import { CommonUtil } from "@zxtool/utils"
import { createProgram } from "../util"
import { genZGUMsg } from "../util/util"
import { ZAttribute } from "./ZAttribute"
import { store } from "./ZGlobalStore"
import { ZUniform } from "./ZUniform"
import type { ZGeom } from "./geometry"

export interface TFVaryingItem {
  name: string
  perSize: number
}

const genMsg = genZGUMsg("ZGPProgram")

export class ZGPProgram {
  name = "unnamed"
  debugMode?: boolean
  readonly vs: string
  readonly gl: WebGL2RenderingContext
  readonly key = Symbol("ZGPProgram")

  private programKey!: PropertyKey
  private program!: WebGLProgram
  readonly bufferMode: number
  readonly tfVaryings: TFVaryingItem[]

  private vao!: WebGLVertexArrayObject
  private tf!: WebGLTransformFeedback

  readonly buffers: WebGLBuffer[] = []

  readonly attrData: Map<string, ZAttribute> = new Map()
  readonly uniformData: Map<string, ZUniform> = new Map()

  readonly destroyed = false

  private _count = 0
  get count() {
    return this._count
  }

  renderType = 0x0000 // gl.POINTS
  attrNeedUpdate = true
  uniformNeedUpdate = true

  static fs = `#version 300 es
  precision lowp float;
  void main() {
  }`

  // bufferMode 默认 gl.SEPARATE_ATTRIBS
  constructor(vs: string, tfVaryings: TFVaryingItem[], bufferMode = 0x8c8d) {
    this.vs = vs
    this.tfVaryings = tfVaryings
    this.bufferMode = bufferMode
    this.gl = store.gl
    this.init()
  }

  private init() {
    const { gl, vs, tfVaryings, bufferMode, buffers } = this
    const fs = ZGPProgram.fs
    const { programMap } = store
    this.programKey = CommonUtil.hashStr(`${vs}\n${fs}`)
    if (!programMap.has(this.programKey)) {
      const program = createProgram(gl, vs, fs)
      programMap.set(this.programKey, program)

      const names = tfVaryings.map(item => item.name)
      gl.transformFeedbackVaryings(program, names, bufferMode)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Failed to link program: " + gl.getProgramInfoLog(program))
      }
    }
    this.program = programMap.get(this.programKey)!
    this.vao = gl.createVertexArray()!
    this.tf = gl.createTransformFeedback()!

    if (bufferMode === gl.INTERLEAVED_ATTRIBS) buffers[0] = gl.createBuffer()!
    else tfVaryings.forEach((_, index) => (buffers[index] = gl.createBuffer()!))
  }

  setGeom(geom: ZGeom) {
    geom.setProgramGeom(this)
    return this
  }

  getBufferContent(i: number) {
    const buffer = this.buffers[i]
    const size =
      this.bufferMode === 0x8c8c ? this.tfVaryings.reduce((prev, cur) => prev + cur.perSize, 0) : this.tfVaryings[i].perSize
    if (!buffer || !size) throw new Error(genMsg(`索引为 ${i} 的 buffer 不存在`, "error"))
    return getBufferContent(store.gl, buffer, this.count * size)
  }

  addAttribute(...attributes: ZAttribute[]) {
    attributes.forEach(attribute => this.attrData.set(attribute.name, attribute))
    return this
  }
  protected processAttrData() {
    const { gl, program, attrData } = this

    attrData.forEach(zAttr => {
      const count = zAttr.processAttr({ gl, program, zProgram: this })
      if (count) this._count = count
    })

    this.updateTransformFeedBackBuffer()
  }

  addUniform(...uniforms: ZUniform[]) {
    uniforms.forEach(uniform => this.uniformData.set(uniform.name, uniform))
    return this
  }
  private processUniform() {
    const { gl, program } = this
    let textureIndex = -1
    let uboBindingPoint = -1

    const zUniforms: ZUniform[] = [...store.uniformData.values(), ...this.uniformData.values()]

    zUniforms.forEach(zUniform => {
      let index = 0
      if (zUniform.isTexture) index = ++textureIndex
      if (zUniform.isUbo) index = ++uboBindingPoint
      zUniform.processUniform({ gl, program, zProgram: this, index })
    })
  }

  private updateTransformFeedBackBuffer() {
    const { gl, tf, tfVaryings, buffers, bufferMode, count } = this
    if (!this.count) return

    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf)

    if (bufferMode === gl.INTERLEAVED_ATTRIBS) {
      const size = tfVaryings.reduce((prev, cur) => prev + cur.perSize, 0)
      gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, buffers[0])
      gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, 4 * size * count, gl.DYNAMIC_COPY)
      gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffers[0])
    } else {
      tfVaryings.forEach((item, index) => {
        const { perSize } = item
        const buffer = buffers[index]
        gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, buffer!)
        gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, 4 * perSize * count, gl.DYNAMIC_COPY)
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, index, buffer!)
      })
    }

    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null)
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null)
  }

  private useProgram() {
    const { gl, program } = this
    const currentProgram = store.currentProgram
    if (program !== currentProgram) {
      store.currentProgram = program
      gl.useProgram(program)
    }
  }

  render() {
    if (this.destroyed) return console.warn(genMsg(`${this.name} 已经被销毁, 不能执行 render`))
    const { gl, vao, tf, renderType, attrNeedUpdate, uniformNeedUpdate } = this
    this.useProgram()

    gl.bindVertexArray(vao)
    if (attrNeedUpdate) this.processAttrData()
    if (uniformNeedUpdate) this.processUniform()

    gl.enable(gl.RASTERIZER_DISCARD)
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf)
    gl.beginTransformFeedback(renderType)

    gl.drawArrays(renderType, 0, this.count)

    gl.endTransformFeedback()
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null)
    gl.disable(gl.RASTERIZER_DISCARD)
    gl.bindVertexArray(null)
  }

  destroy() {
    const { gl, vao, tf } = this
    gl.deleteVertexArray(vao)
    gl.deleteTransformFeedback(tf)
    this.tfVaryings.length = 0
    this.buffers.length = 0
    this.attrData.clear()
    this.uniformData.clear()
    this._count = 0
    // @ts-ignore
    this._destroyed = true
  }
}

export const getBufferContent = (gl: WebGL2RenderingContext, buffer: WebGLBuffer, count: number) => {
  return new Promise<Float32Array>(resolve => {
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)!

    const checkStatus = () => {
      const status = gl.clientWaitSync(sync, gl.SYNC_FLUSH_COMMANDS_BIT, 0)

      if (status === gl.TIMEOUT_EXPIRED) {
        console.log("GPU is still busy. Let's wait some more.")
        setTimeout(checkStatus)
      } else if (status === gl.WAIT_FAILED) {
        console.error("Something bad happened and we won't get any response.")
      } else {
        const view = new Float32Array(count)
        gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, buffer)
        gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, 0, view)
        gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null)
        resolve(view)
      }
    }

    setTimeout(checkStatus)
  })
}
