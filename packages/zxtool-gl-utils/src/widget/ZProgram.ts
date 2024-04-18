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

  constructor(vs: string, fs: string) {
    super()
    this.vs = vs
    this.fs = fs
    this.init()
  }

  protected init() {
    const { gl, vs, fs } = this
    const { programMap } = store
    this.name = "ZProgram"
    this.programKey = CommonUtil.hashStr(`${vs}\n${fs}`)
    if (!programMap.has(this.programKey)) programMap.set(this.programKey, createProgram(gl, this.vs, this.fs))
    this.program = programMap.get(this.programKey)!
    this.vao = gl.createVertexArray()!

    this.addUniform(
      new ZUniform("u_modelMat", this.modelMat, { getValueFunc: v => v.world.elements, type: "mat" }),
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
  cloneData(program: ZProgram) {
    this.modelMat.local = program.modelMat.local
    this.modelMat.world = program.modelMat.world
    this.trs = program.trs

    program.indexData.data && this.setIndies(program.indexData.data)
    program.attrData.forEach(attr => this.addAttribute(attr))
    program.uniformData.forEach(uniform => this.addUniform(uniform))

    return this
  }

  addAttribute(...attributes: ZAttribute[]) {
    attributes.forEach(attribute => this.attrData.set(attribute.name, attribute))
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

  addUniform(...uniforms: ZUniform[]) {
    uniforms.forEach(uniform => this.uniformData.set(uniform.name, uniform))
    return this
  }
  protected processUniform() {
    const { gl, program, root } = this
    let textureIndex = -1
    let uboBindingPoint = -1
    const zUniforms: ZUniform[] = [
      ...store.uniformData.values(),
      ...(root?.uniformData.values() ?? []),
      ...this.uniformData.values(),
    ]

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
    if (!show) return false

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

  render(initiator?: GLNode) {
    const { transparent } = this
    const { isRenderingTransparent } = store

    // 手动渲染或者非透明阶段, 判断可见性
    if (!initiator || !isRenderingTransparent) {
      // 在 isShow 里面更新了矩阵
      if (!this.isShow()) return
    }

    // 手动调用 ZProgram.render, 而不是通过 Scene 调度
    if (!initiator) {
      this._render()
      super.renderChildren(initiator)
      return
    }

    // 非透明物体
    if (!transparent) {
      if (!isRenderingTransparent) this._render()
      super.renderChildren(initiator)
    }

    // 透明物体
    if (transparent) {
      if (isRenderingTransparent) this._render()
      super.renderChildren(initiator)
    }
  }

  protected _render() {
    const { gl, program, vao, count, renderTypes, attrNeedUpdate, indexNeedUpdate, uniformNeedUpdate } = this

    this.beforeRender?.({ node: this, gl, program })
    this.useProgram()
    gl.bindVertexArray(vao)
    if (attrNeedUpdate) this.processAttrData()
    if (indexNeedUpdate) this.processIndies()
    if (uniformNeedUpdate) this.processUniform()

    if (count.index) {
      renderTypes.forEach(type => gl.drawElements(type, count.index, gl.UNSIGNED_SHORT, 0))
    } else if (count.vertex) {
      renderTypes.forEach(type => gl.drawArrays(type, 0, count.vertex))
    }

    gl.bindVertexArray(null)
    this.afterRender?.({ node: this, gl, program })
  }

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
