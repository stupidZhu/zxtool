import { genZGUMsg } from "../util/util"
import { ZUniform } from "./ZUniform"

const genMsg = genZGUMsg("initGlUtil")

class _ZGlobalStore {
  private _gl: WebGL2RenderingContext | null = null
  get gl() {
    if (!this._gl) throw new Error(genMsg("请检查是否调用 initGlUtil 初始化 gl 上下文", "error"))
    return this._gl
  }
  set gl(v: WebGL2RenderingContext) {
    this._gl = v
  }

  private _canvas: HTMLCanvasElement | null = null
  get canvas() {
    if (!this._canvas) throw new Error(genMsg("请检查是否调用 initGlUtil 初始化 canvas 上下文", "error"))
    return this._canvas
  }
  set canvas(v: HTMLCanvasElement) {
    this._canvas = v
  }

  readonly programMap: Map<PropertyKey, WebGLProgram> = new Map()
  currentProgram: WebGLProgram | null = null

  readonly timeObj: { time: number; deltaTime: number; frameCount: number } = { time: 0, deltaTime: 0, frameCount: 0 }
  readonly uniformData: Map<string, ZUniform> = new Map()

  isRenderingTransparent = false
  debugMode = false

  constructor() {
    this.uniformData.set("u_time", new ZUniform("u_time", this.timeObj, { getValueFunc: v => v.time }))
    this.uniformData.set("u_timeS", new ZUniform("u_timeS", this.timeObj, { getValueFunc: v => v.time * 0.001 }))
    this.uniformData.set("u_deltaTime", new ZUniform("u_deltaTime", this.timeObj, { getValueFunc: v => v.deltaTime }))
    this.uniformData.set(
      "u_deltaTimeS",
      new ZUniform("u_deltaTimeS", this.timeObj, { getValueFunc: v => v.deltaTime * 0.001 }),
    )
    this.uniformData.set("u_frameCount", new ZUniform("u_frameCount", this.timeObj, { getValueFunc: v => v.frameCount }))
  }
}

export const store = new _ZGlobalStore()
export type ZGlobalStore = _ZGlobalStore

export const initGlUtil = (gl: WebGL2RenderingContext) => {
  if (!(gl instanceof WebGL2RenderingContext)) throw new Error(genMsg("只支持 webgl2 上下文", "error"))
  store.gl = gl
  store.canvas = gl.canvas as HTMLCanvasElement
}
