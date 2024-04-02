import { CommonUtil } from "@zxtool/utils"
import { createProgram } from "../util"
import { genZGUMsg } from "../util/util"
import { GLNode } from "./GLNode"
import { ZAttribute } from "./ZAttribute"
import { ZBounding } from "./ZBounding"
import { store } from "./ZGlobalStore"
import { ZUniform } from "./ZUniform"
import type { ZGeom } from "./geometry"

const genMsg = genZGUMsg("ZProgram")

export interface RenderHookProps {
  node: ZProgram
  gl: WebGL2RenderingContext
  program: WebGLProgram
}
export type RenderHook = (props: RenderHookProps) => void
export type ShowCondition = (program: ZProgram) => boolean

export interface IndexData {
  data?: number[] | null
  buffer?: WebGLBuffer
  bufferData?: Uint16Array
}

export class ZProgram extends GLNode {
  readonly vs: string
  readonly fs: string

  protected program!: WebGLProgram
  protected programKey!: PropertyKey
  protected vao!: WebGLVertexArrayObject

  readonly indexData: IndexData = {}
  readonly count = { vertex: 0, index: 0 }

  readonly attrData: Map<string, ZAttribute> = new Map()

  readonly uniformData: Map<string, ZUniform> = new Map()

  readonly bounding = new ZBounding()
  autoUpdateBounding = false

  indexNeedUpdate = false
  attrNeedUpdate = true
  uniformNeedUpdate = true
  renderTypes = [0x0004] // gl.TRIANGLES
  beforeRender?: RenderHook
  afterRender?: RenderHook
  showCondition?: ShowCondition

  transparent = false
  // depthWrite = true
  // depthTest = true

  constructor(vs: string, fs: string) {
    super()
    this.vs = vs
    this.fs = fs
    this.init()
  }

  protected init() {
    const { gl, vs, fs } = this
    const { programMap } = store
    this.programKey = CommonUtil.hashStr(`${vs}\n${fs}`)
    if (!programMap.has(this.programKey)) programMap.set(this.programKey, createProgram(gl, this.vs, this.fs))
    this.program = programMap.get(this.programKey)!
    this.vao = gl.createVertexArray()!

    this.addUniform(new ZUniform("u_modelMat", this.modelMat, { getValueFunc: v => v.world.elements, type: "mat" }))
    this.addUniform(
      new ZUniform("u_normalMat", this.modelMat, {
        getValueFunc: v => v.world.clone().invert().transpose().elements,
        type: "mat",
      }),
    )
  }

  setGeom(geom: ZGeom) {
    geom.setProgramGeom(this)
    return this
  }

  addAttribute(attribute: ZAttribute) {
    this.attrData.set(attribute.name, attribute)
    return this
  }
  protected processAttrData() {
    const { gl, program, attrData } = this

    attrData.forEach(zAttr => {
      const count = zAttr.processAttr({ gl, program, zProgram: this })
      if (count && !zAttr.isInstanceAttr) this.count.vertex = count
    })
  }

  setIndies(data: number[] | null) {
    this.indexNeedUpdate = true
    this.indexData.data = data
    return this
  }
  protected processIndies() {
    const { gl, indexData } = this

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
  protected processUniform() {
    const { gl, program, root } = this
    let textureIndex = -1
    let uboBindingPoint = -1
    const zUniforms: ZUniform[] = [...(root?.uniformData.values() ?? []), ...this.uniformData.values()]

    zUniforms.forEach(zUniform => {
      let index = 0
      if (zUniform.isTexture) index = ++textureIndex
      if (zUniform.isUbo) index = ++uboBindingPoint
      zUniform.processUniform({ gl, program, zProgram: this, index })
    })
  }

  updateBounding(logErr = false) {
    const aPos = this.attrData.get("a_position")
    const vertices = aPos?.getData()
    if (!vertices) {
      if (logErr) console.error(genMsg("没有找到 a_position 的 data, updateBounding 失败"))
      return
    }
    this.bounding.update(vertices, this.modelMat.world)
    return this
  }

  protected isShow() {
    const { show, autoUpdateBounding, destroyed, showCondition } = this
    if (destroyed) return console.warn(genMsg(`${this.name} 已经被销毁, 不能执行 render`, "error"))
    if (show === false) return false

    this.updateWorldMat()

    autoUpdateBounding && this.updateBounding()
    return showCondition?.(this) ?? true
  }

  protected useProgram() {
    const { gl, program } = this
    const currentProgram = store.currentProgram
    if (program !== currentProgram) {
      store.currentProgram = program
      gl.useProgram(program)
    }
  }

  render() {
    if (!this.isShow()) return
    const { gl, program, vao, count, renderTypes, attrNeedUpdate, indexNeedUpdate, uniformNeedUpdate } = this
    this.useProgram()

    gl.bindVertexArray(vao)
    if (attrNeedUpdate) this.processAttrData()
    if (indexNeedUpdate) this.processIndies()
    if (uniformNeedUpdate) this.processUniform()

    this.beforeRender?.({ node: this, gl, program })

    if (count.index) {
      renderTypes.forEach(type => gl.drawElements(type, count.index, gl.UNSIGNED_SHORT, 0))
    } else if (count.vertex) {
      renderTypes.forEach(type => gl.drawArrays(type, 0, count.vertex))
    }

    this.afterRender?.({ node: this, gl, program })

    gl.bindVertexArray(null)

    super.renderChildren()
  }

  _render(initiator?: GLNode) {}

  destroy() {
    const { gl, vao } = this
    gl.deleteVertexArray(vao)
    // @ts-ignore
    this.indexData = {}
    this.count.vertex = 0
    this.count.index = 0
    this.attrData.clear()
    this.uniformData.clear()
    this.beforeRender = undefined
    this.afterRender = undefined
    this.showCondition = undefined
    super.destroy()
  }
}
