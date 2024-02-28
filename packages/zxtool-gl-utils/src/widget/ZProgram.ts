import { Matrix4 } from "@zxtool/three-math"
import { createProgram, createVaoObj } from "../util"
import { GLNode } from "./GLNode"
import { ZBounding } from "./ZBounding"
import { ZScene } from "./ZScene"
import { ZUniform } from "./ZUniform"

export type RenderHook = (node: ZProgram, parent: GLNode | ZScene | null, scene: ZScene | null) => void
export type ShowCondition = (bounding: ZBounding, programHelper: ZProgram) => boolean

export interface AttributeItem {
  name: string
  data: number[][]
  buffer: WebGLBuffer | null
  location: number
  bufferData: Float32Array | null
}

export interface IndexData {
  data: number[] | null
  buffer: WebGLBuffer | null
  bufferData: Uint16Array | null
}

export interface ProgramOptions {
  vs?: string
  fs?: string
  program?: WebGLProgram
}

export class ZProgram extends GLNode {
  readonly program: WebGLProgram
  readonly vs?: string
  readonly fs?: string

  private vaoObj!: ReturnType<typeof createVaoObj>

  readonly attrData: Map<string, AttributeItem> = new Map()
  readonly indexData: IndexData = { data: null, buffer: null, bufferData: null }
  readonly count = { vertex: 0, index: 0 }

  readonly uniformData: Map<string, ZUniform> = new Map()
  private innerUniform = {
    u_modelMat: new ZUniform("u_modelMat", new Matrix4(), { getValueFunc: data => data.elements, type: "matrix" }),
    u_normalMat: new ZUniform("u_normalMat", new Matrix4(), { getValueFunc: data => data.elements, type: "matrix" }),
  }
  private uniformLocation: Record<string, WebGLUniformLocation | null> = {}

  bounding = new ZBounding()

  name = "no name"
  show = true
  attrNeedUpdate = false
  indexNeedUpdate = false
  uniformNeedUpdate = true
  transparent = false
  renderTypes = [0x0004] // gl.TRIANGLES
  beforeRender?: RenderHook
  afterRender?: RenderHook
  showCondition?: ShowCondition

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, options: ProgramOptions) {
    super(gl)
    const { vs, fs, program } = options

    this.vs = vs
    this.fs = fs

    if (program) this.program = program
    else if (vs && fs) this.program = createProgram(gl, vs, fs)
    else throw new Error("缺少必要参数")

    this.vaoObj = createVaoObj(gl)
  }

  addAttribute(name: string, data: number[][]) {
    const { gl, program } = this
    this.attrNeedUpdate = true
    const location = gl.getAttribLocation(program, name)
    if (location === -1) {
      console.warn(`[${this.name}]: 没有找到 name 为 ${name} 的 attribute!`)
      return this
    }
    this.attrData.set(name, { name, data, location, buffer: gl.createBuffer(), bufferData: null })
    return this
  }
  private processAttrData() {
    const { gl, vaoObj, attrData } = this
    vaoObj.bind()
    attrData.forEach(item => {
      const { data, location, buffer } = item

      item.bufferData = new Float32Array(data.flat())
      const BYTES = item.bufferData.BYTES_PER_ELEMENT

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, item.bufferData, gl.STATIC_DRAW)
      gl.vertexAttribPointer(location, data[0].length, gl.FLOAT, false, BYTES * data[0].length, 0)
      gl.enableVertexAttribArray(location)
      this.count.vertex = data.length
    })

    this.attrNeedUpdate = false
  }

  setIndies(data: number[] | null) {
    const { gl } = this
    this.indexNeedUpdate = true
    this.indexData.data = data
    this.indexData.bufferData = data ? new Uint16Array(data) : null
    if (!this.indexData.buffer) this.indexData.buffer = gl.createBuffer()
    return this
  }
  private processIndies() {
    const { gl, vaoObj, indexData } = this
    vaoObj.bind()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexData.buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData.bufferData, gl.STATIC_DRAW)
    this.count.index = indexData.bufferData?.length ?? 0
    this.indexNeedUpdate = false
  }

  addUniform(uniform: ZUniform) {
    this.uniformData.set(uniform.name, uniform)
    return this
  }
  private getUniformLocation(name: string) {
    const { gl, program, uniformLocation } = this
    let location = uniformLocation[name]
    if (location === undefined) {
      location = gl.getUniformLocation(program, name)
      if (!location) console.warn(`[${this.name}]: 没有找到 name 为 ${name} 的 uniform!`)
      uniformLocation[name] = location
    }
    return location
  }
  private updateUniform() {
    const { gl, rootRef, modelMat, innerUniform } = this
    const { u_modelMat, u_normalMat } = innerUniform
    let textureIndex = -1

    // globalUniform
    rootRef.value?.uniformData.forEach(zUniform => {
      const location = this.getUniformLocation(zUniform.name)
      if (location) {
        if (zUniform.isTexture) textureIndex++
        zUniform.useUniform(gl, location, textureIndex)
      }
    })
    // localUniform
    this.uniformData.forEach(zUniform => {
      const location = this.getUniformLocation(zUniform.name)
      if (location) {
        if (zUniform.isTexture) textureIndex++
        zUniform.useUniform(gl, location, textureIndex)
      }
    })

    // innerUniform
    // isShow 里面执行过 this.updateWorldMat()
    {
      const location = this.getUniformLocation(u_modelMat.name)
      u_modelMat.data = modelMat.world
      location && u_modelMat.useUniform(gl, location)
    }
    {
      const location = this.getUniformLocation(u_normalMat.name)
      if (location) {
        u_normalMat.data = modelMat.world.clone().invert().transpose()
        u_normalMat.useUniform(gl, location)
      }
    }
  }

  updateBounding() {
    const vertices = this.attrData.get("a_position")?.data
    if (!vertices) return console.error("请先设置 a_position, updateBounding 失败!")

    this.updateWorldMat()
    this.bounding = new ZBounding(vertices, this.modelMat.world)
    return this
  }

  private isShow() {
    const { show, showCondition } = this
    if (show === false) return false
    this.updateBounding()
    return showCondition?.(this.bounding, this) ?? true
  }

  render() {
    const { gl, program, vaoObj, count, parent, rootRef, renderTypes, attrNeedUpdate, indexNeedUpdate, uniformNeedUpdate } =
      this

    if (!this.isShow()) return

    gl.useProgram(program)

    if (attrNeedUpdate) this.processAttrData()
    if (indexNeedUpdate) this.processIndies()
    vaoObj.bind()
    if (uniformNeedUpdate) this.updateUniform()

    this.beforeRender?.(this, parent, rootRef.value)

    if (count.index) {
      renderTypes.forEach(type => gl.drawElements(type, count.index, gl.UNSIGNED_SHORT, 0))
    } else if (count.vertex) {
      renderTypes.forEach(type => gl.drawArrays(type, 0, count.vertex))
    }

    this.afterRender?.(this, parent, rootRef.value)

    super.renderChildren()
  }
}
