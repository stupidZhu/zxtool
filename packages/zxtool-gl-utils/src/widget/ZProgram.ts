import { Matrix4 } from "@zxtool/three-math"
import { CommonUtil } from "@zxtool/utils"
import { isNil } from "lodash"
import { createProgram } from "../util"
import { genZGUInfo } from "../util/util"
import { GLNode } from "./GLNode"
import { ZBounding } from "./ZBounding"
import type { ZScene } from "./ZScene"
import { ZUniform } from "./ZUniform"

const genInfo = genZGUInfo("ZProgram")

interface RenderHookProps {
  node: ZProgram
  parent: GLNode | ZScene
  scene: ZScene
  gl: WebGL2RenderingContext
  program: WebGLProgram
}
export type RenderHook = (props: RenderHookProps) => void
export type ShowCondition = (bounding: ZBounding, programHelper: ZProgram) => boolean

export interface AttributeItem {
  name: string
  data: number[][]
  buffer?: WebGLBuffer
  location?: number
  bufferData?: Float32Array
}

export interface IndexData {
  data?: number[] | null
  buffer?: WebGLBuffer
  bufferData?: Uint16Array
}

export interface ProgramOptions {
  vs?: string
  fs?: string
  program?: WebGLProgram
}

export class ZProgram extends GLNode {
  readonly vs: string
  readonly fs: string

  private programKey: PropertyKey
  private vao?: WebGLVertexArrayObject

  readonly attrData: Map<string, AttributeItem> = new Map()
  readonly indexData: IndexData = {}
  readonly count = { vertex: 0, index: 0 }

  readonly uniformData: Map<string, ZUniform> = new Map()
  private innerUniform = {
    u_modelMat: new ZUniform("u_modelMat", new Matrix4(), { getValueFunc: data => data.elements, type: "matrix" }),
    u_normalMat: new ZUniform("u_normalMat", new Matrix4(), { getValueFunc: data => data.elements, type: "matrix" }),
  }
  // 因为 ZUniform 有可能是共用的, 所以不方便把 location 存在 ZUniform 里面
  private uniformLocation: Record<string, WebGLUniformLocation | number | null> = {}

  readonly bounding = new ZBounding()

  show = true
  attrNeedUpdate = false
  indexNeedUpdate = false
  uniformNeedUpdate = true
  transparent = false
  renderTypes = [0x0004] // gl.TRIANGLES
  beforeRender?: RenderHook
  afterRender?: RenderHook
  showCondition?: ShowCondition

  constructor(vs: string, fs: string) {
    super()
    this.vs = vs
    this.fs = fs
    this.programKey = CommonUtil.hashStr(`${vs}\n${fs}`)
  }

  getProgram() {
    const gl = this.getGl()
    const programMap = this.root?.store.programMap
    if (!programMap) throw new Error(genInfo(`请检查是否将此 zProgram(${this.name}) 插入到了 scene 中`))

    if (!programMap.has(this.programKey)) programMap.set(this.programKey, createProgram(gl, this.vs, this.fs))
    return { gl, program: programMap.get(this.programKey)! }
  }

  addAttribute(name: string, data: number[][]) {
    this.attrNeedUpdate = true
    this.attrData.set(name, { name, data })
    return this
  }
  protected processAttrData() {
    const { attrData } = this
    const { gl, program } = this.getProgram()

    this.attrNeedUpdate = false

    attrData.forEach(item => {
      const { name, data } = item

      if (item.location === undefined) item.location = gl.getAttribLocation(program, name)
      if (item.location === -1) {
        return console.warn(genInfo(`${this.name} 没有找到 name 为 ${name} 的 attribute`))
      }
      if (!item.buffer) item.buffer = gl.createBuffer()!

      item.bufferData = new Float32Array(data.flat())
      const BYTES = Float32Array.BYTES_PER_ELEMENT

      gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer)
      gl.bufferData(gl.ARRAY_BUFFER, item.bufferData, gl.STATIC_DRAW)
      gl.vertexAttribPointer(item.location, data[0].length, gl.FLOAT, false, BYTES * data[0].length, 0)
      gl.enableVertexAttribArray(item.location)
      this.count.vertex = data.length
    })
  }

  setIndies(data: number[] | null) {
    this.indexNeedUpdate = true
    this.indexData.data = data
    return this
  }
  protected processIndies() {
    const { indexData } = this
    const gl = this.getGl()

    this.indexNeedUpdate = false

    if (!indexData.data) return (this.count.index = 0)
    if (!indexData.buffer) indexData.buffer = gl.createBuffer()!

    indexData.bufferData = new Uint16Array(indexData.data)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexData.buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData.bufferData, gl.STATIC_DRAW)
    this.count.index = indexData.bufferData.length
  }

  addUniform(uniform: ZUniform) {
    this.uniformData.set(uniform.name, uniform)
    return this
  }
  protected getUniformLocation(uniform: ZUniform) {
    const { name, isUbo } = uniform
    const { gl, program } = this.getProgram()

    if (this.uniformLocation[name] === undefined) {
      const location = isUbo ? gl.getUniformBlockIndex(program, name) : gl.getUniformLocation(program, name)
      if (location === null) console.warn(genInfo(`${this.name} 没有找到 name 为 ${name} 的 uniform`))
      this.uniformLocation[name] = location
    }
    return this.uniformLocation[name]
  }
  protected updateUniform() {
    const { root, modelMat, innerUniform } = this
    const { u_modelMat, u_normalMat } = innerUniform
    const { gl, program } = this.getProgram()
    let textureIndex = -1
    let uboBindingPoint = -1

    // globalUniform
    root?.uniformData.forEach(zUniform => {
      const location = this.getUniformLocation(zUniform)
      if (!isNil(location)) {
        let index = 0
        if (zUniform.isTexture) index = ++textureIndex
        if (zUniform.isUbo) index = ++uboBindingPoint
        zUniform.useUniform({ gl, program, location, index })
      }
    })
    // localUniform
    this.uniformData.forEach(zUniform => {
      const location = this.getUniformLocation(zUniform)
      if (!isNil(location)) {
        let index = 0
        if (zUniform.isTexture) index = ++textureIndex
        if (zUniform.isUbo) index = ++uboBindingPoint
        zUniform.useUniform({ gl, program, location, index })
      }
    })

    // innerUniform
    // isShow 里面执行过 this.updateWorldMat()
    {
      const location = this.getUniformLocation(u_modelMat)
      u_modelMat.data = modelMat.world
      location && u_modelMat.useUniform({ gl, program, location })
    }
    {
      const location = this.getUniformLocation(u_normalMat)
      if (location) {
        u_normalMat.data = modelMat.world.clone().invert().transpose()
        u_normalMat.useUniform({ gl, program, location })
      }
    }
  }

  updateBounding() {
    const vertices = this.attrData.get("a_position")?.data
    if (!vertices) return console.error(genInfo("请先设置 a_position, updateBounding 失败"))
    this.updateWorldMat()
    this.bounding.update(vertices, this.modelMat.world)
    return this
  }

  protected isShow() {
    const { show, showCondition } = this
    if (show === false) return false
    this.updateBounding()
    return showCondition?.(this.bounding, this) ?? true
  }

  protected useProgram() {
    const { gl, program } = this.getProgram()
    const currentProgram = this.root!.store.currentProgram
    if (program !== currentProgram) {
      this.root!.store.currentProgram = program
      gl.useProgram(program)
    }
  }
  protected bindVAO() {
    const gl = this.getGl()
    if (!this.vao) this.vao = gl.createVertexArray()!
    gl.bindVertexArray(this.vao)
  }

  render() {
    if (!this.isShow()) return
    const { count, parent, root, renderTypes, attrNeedUpdate, indexNeedUpdate, uniformNeedUpdate } = this
    const { gl, program } = this.getProgram()
    this.useProgram()

    this.bindVAO()
    if (attrNeedUpdate) this.processAttrData()
    if (indexNeedUpdate) this.processIndies()
    if (uniformNeedUpdate) this.updateUniform()

    this.beforeRender?.({ node: this, parent: parent!, scene: root!, gl, program })

    if (count.index) {
      renderTypes.forEach(type => gl.drawElements(type, count.index, gl.UNSIGNED_SHORT, 0))
    } else if (count.vertex) {
      renderTypes.forEach(type => gl.drawArrays(type, 0, count.vertex))
    }

    this.afterRender?.({ node: this, parent: parent!, scene: root!, gl, program })

    super.renderChildren()
  }
}
