import { resizeViewport } from "../util"
import { store } from "./ZGlobalStore"

export type RenderFunc = (time: number) => void
export type ResizeFunc = (width: number, height: number) => void

export class ZRenderer {
  readonly gl: WebGL2RenderingContext

  private _fps?: number
  get fps(): number | undefined {
    return this._fps
  }
  set fps(v: number | undefined) {
    if (v && v <= 0) v = undefined
    v ? (this.frameTime = 1000 / v) : (this.frameTime = undefined)
    this._fps = v
  }

  readonly renderQueue: RenderFunc[] = []
  readonly resizeQueue: ResizeFunc[] = []
  needUpdate = true

  private frameTime?: number
  private prevTime: number = -Infinity

  constructor(fps?: number) {
    const { gl } = store
    this.gl = gl
    this.fps = fps
    this.loop(0)
  }

  private render(time: number) {
    const { gl, renderQueue, resizeQueue } = this
    resizeViewport(gl, (width, height) => resizeQueue.forEach(fn => fn(width, height)))
    renderQueue.forEach(fn => fn(time))
  }

  private loop(time: number) {
    const { needUpdate, frameTime } = this

    if (needUpdate) {
      if (!frameTime) this.render(time)
      else {
        const deltaTime = time - this.prevTime
        if (deltaTime >= frameTime) {
          this.render(time)
          this.prevTime = time
        }
      }
    }

    requestAnimationFrame(this.loop.bind(this))
  }

  addRenderFunc(func: RenderFunc) {
    this.renderQueue.push(func)
    return this
  }

  addResizeFunc(func: ResizeFunc) {
    this.resizeQueue.push(func)
    const canvas = this.gl.canvas
    func(canvas.width, canvas.height)
    return this
  }
}