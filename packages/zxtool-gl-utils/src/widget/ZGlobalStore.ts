import { genZGUMsg } from "../util/util"

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

  isRenderingTransparent = false
  debugMode = false
}

export const store = new _ZGlobalStore()
export type ZGlobalStore = _ZGlobalStore

export const initGlUtil = (gl: WebGL2RenderingContext) => {
  if (!(gl instanceof WebGL2RenderingContext)) throw new Error(genMsg("只支持 webgl2 上下文", "error"))
  store.gl = gl
  store.canvas = gl.canvas as HTMLCanvasElement
}
