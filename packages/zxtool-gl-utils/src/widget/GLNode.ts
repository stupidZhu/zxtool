import { Matrix4 } from "@zxtool/three-math"
import { FileUtil } from "@zxtool/utils"
import { multiplyMats } from "../util"
import { genZGUMsg } from "../util/util"
import { TRS } from "./TRS"
import { store } from "./ZGlobalStore"
import type { ZScene } from "./ZScene"

const genMsg = genZGUMsg("GLNode")

const pixelData = new Uint8Array(4)

export class GLNode {
  name = "GLNode"
  debugMode?: boolean
  show = true

  readonly key = Symbol("GLNode")
  readonly parent: GLNode | null = null
  readonly root: ZScene | null = null
  readonly gl: WebGL2RenderingContext

  readonly children: GLNode[] = []
  trs?: TRS
  readonly modelMat: { local: Matrix4; world: Matrix4 } = { local: new Matrix4(), world: new Matrix4() }

  readonly destroyed = false

  private _renderOrder = 0
  get renderOrder() {
    return this._renderOrder
  }
  set renderOrder(o: number) {
    this._renderOrder = o
    this.resortChildren()
  }

  constructor() {
    this.gl = store.gl
  }

  add(...children: GLNode[]) {
    children.forEach(child => {
      this.children.push(child)
      // @ts-ignore
      child.parent = this
      if (this.root) child.updateRoot(this.root)
    })
    this.resortChildren()
    return this
  }
  remove(child: GLNode) {
    const index = this.children.indexOf(child)
    if (index !== -1) this.children.splice(index, 1)
    return this
  }

  protected resortChildren() {
    this.children.sort((a, b) => a.renderOrder - b.renderOrder)
  }
  protected updateRoot(root: ZScene) {
    // @ts-ignore
    this.root = root
    this.children.forEach(child => {
      child.updateRoot(root)
    })
  }

  setModelMat(mat: Matrix4) {
    this.modelMat.local = mat
    this.trs?.setFromMat(mat)
    return this
  }
  updateWorldMat() {
    const { modelMat, trs, parent } = this
    const localMat = trs?.getMat() ?? modelMat.local
    modelMat.world = parent ? multiplyMats(parent.modelMat.world, localMat) : localMat
  }

  protected renderChildren(initiator?: GLNode) {
    const { children } = this
    if (!children.length) return

    children.forEach(child => {
      if (child.destroyed) {
        this.remove(child)
        console.warn(genMsg(`${child.name} 已经被销毁, 不能执行 render`, "error"))
        return
      }
      if (!child.show) return
      child.render(initiator)
    })
  }

  screenshot(name?: string) {
    this.render()
    const canvas = this.gl.canvas as HTMLCanvasElement
    const fileName = name ? `${name}.png` : `${this.name}-${Date.now()}.png`
    canvas.toBlob(blob => FileUtil.downloadFile(blob!, fileName), "image/png")
  }
  readPixel(e: MouseEvent) {
    const { gl } = this
    const canvas = gl.canvas as HTMLCanvasElement
    this.render()
    gl.readPixels(
      e.offsetX * devicePixelRatio,
      (canvas.clientHeight - e.offsetY) * devicePixelRatio,
      1,
      1,
      gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_FORMAT),
      gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_TYPE),
      pixelData,
    )
    return [...pixelData]
  }

  render(initiator?: GLNode) {
    if (this.destroyed) return console.warn(genMsg(`${this.name} 已经被销毁, 不能执行 render`, "error"))
    if (!this.show) return
    this.updateWorldMat()
    this.renderChildren(initiator)
  }

  destroy() {
    this.parent?.remove(this)
    this.children.forEach(child => child.destroy())
    this.children.length = 0
    // @ts-ignore
    this.destroyed = true
  }
}
