import { Matrix4 } from "@zxtool/three-math"
import { multiplyMats } from "../util"
import { genZGUInfo } from "../util/util"
import type { ZScene } from "./ZScene"

const genInfo = genZGUInfo("ZProgram")

export class GLNode {
  name = "unnamed"
  parent: GLNode | null = null
  root: ZScene | null = null

  readonly children: GLNode[] = []
  readonly modelMat: { local: Matrix4; world: Matrix4 } = { local: new Matrix4(), world: new Matrix4() }

  private _renderOrder = 0
  get renderOrder() {
    return this._renderOrder
  }
  set renderOrder(o: number) {
    this._renderOrder = o
    this.resortChildren()
  }

  protected getGl() {
    const gl = this.root!.gl
    if (!gl) throw new Error(genInfo(`请检查是否将此 GLNode(${this.name}) 插入到了 scene 中`))
    return gl
  }

  add(child: GLNode) {
    this.children.push(child)
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
    const { children } = this
    if (!children.length) return

    const gl = this.getGl()
    const tChildren: GLNode[] = []

    children.forEach(child => {
      // @ts-ignore
      if (child.transparent) tChildren.push(child)
      else child.render()
    })

    // todo: child的child渲染之后会重置BLEND为false
    gl.depthMask(false)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    tChildren.forEach(child => child.render())
    gl.depthMask(true)
    gl.disable(gl.BLEND)
  }

  render() {
    this.updateWorldMat()
    this.renderChildren()
  }
}
