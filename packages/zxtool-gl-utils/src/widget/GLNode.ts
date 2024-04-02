import { Matrix4 } from "@zxtool/three-math"
import { multiplyMats } from "../util"
import { genZGUMsg } from "../util/util"
import { store } from "./ZGlobalStore"
import type { ZScene } from "./ZScene"

const genMsg = genZGUMsg("GLNode")

export class GLNode {
  name = "unnamed"
  debugMode?: boolean
  show = true

  readonly key = Symbol("GLNode")
  readonly parent: GLNode | null = null
  readonly root: ZScene | null = null
  readonly gl: WebGL2RenderingContext

  readonly children: GLNode[] = []
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

  add(child: GLNode) {
    this.children.push(child)
    // @ts-ignore
    child.parent = this
    this.resortChildren()
    if (this.root) child.updateRoot(this.root)
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
    return this
  }
  updateWorldMat() {
    const { modelMat, parent } = this
    modelMat.world = parent ? multiplyMats(parent.modelMat.world, modelMat.local) : modelMat.local
  }

  renderChildren() {
    const { gl, children } = this
    if (!children.length) return

    const tChildren: GLNode[] = []

    children.forEach(child => {
      if (child.destroyed) {
        this.remove(child)
        console.warn(genMsg(`${child.name} 已经被销毁, 不能执行 render`))
        return
      }
      if (!child.show) return
      // @ts-ignore
      if (child.transparent) tChildren.push(child)
      else child.render()
    })

    // todo: child的child渲染之后会重置 BLEND 为 false
    gl.depthMask(false)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    tChildren.forEach(child => child.render())
    gl.depthMask(true)
    gl.disable(gl.BLEND)
  }

  render() {
    if (this.destroyed) return console.warn(genMsg(`${this.name} 已经被销毁, 不能执行 render`))
    this.updateWorldMat()
    this.renderChildren()
  }

  destroy() {
    this.parent?.remove(this)
    this.children.forEach(child => child.destroy())
    this.children.length = 0
    // @ts-ignore
    this.destroyed = true
  }
}
