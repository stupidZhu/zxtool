import { Matrix4 } from "@zxtool/three-math"
import { multiplyMats } from "../util"
import { ZScene } from "./ZScene"

export class GLNode {
  readonly gl: WebGLRenderingContext | WebGL2RenderingContext
  readonly modelMat: { local: Matrix4; world: Matrix4 } = { local: new Matrix4(), world: new Matrix4() }

  readonly children: GLNode[] = []
  parent: GLNode | ZScene | null = null
  rootRef: { value: ZScene | null } = { value: null }

  private _renderOrder = 0
  get renderOrder() {
    return this._renderOrder
  }
  set renderOrder(o: number) {
    this._renderOrder = o
    this.resortChildren()
  }

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.gl = gl
  }

  add(child: GLNode) {
    this.children.push(child)
    child.parent = this
    child.rootRef = this.rootRef
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
      // @ts-ignore
      if (child.transparent) tChildren.push(child)
      else child.render()
    })

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
