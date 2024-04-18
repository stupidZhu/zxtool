import { Matrix4 } from "@zxtool/three-math"
import { Num4 } from "@zxtool/utils"
import { genZGUMsg } from "../util/util"
import { GLNode } from "./GLNode"
import { ZCamera } from "./ZCamera"
import { store } from "./ZGlobalStore"
import { ZUniform } from "./ZUniform"

const genMsg = genZGUMsg("ZProgram")

export class ZScene extends GLNode {
  readonly uniformData: Map<string, ZUniform> = new Map()
  clearColor: Num4 = [0, 0, 0, 0]
  depthTest = true

  protected _camera: ZCamera | undefined
  get camera() {
    return this._camera
  }

  constructor() {
    super()
    // @ts-ignore
    this.root = this
    this.name = "ZScene"
    this.initCommonUniform()
  }

  protected initCommonUniform() {
    this.addCommonUniform(
      new ZUniform("u_canvasSize", this.gl.canvas, { getValueFunc: v => [v.width, v.height], type: "vec" }),
      new ZUniform("u_clearColor", this, { getValueFunc: v => v.clearColor, type: "vec" }),
    )
  }

  setCamera(camera: ZCamera) {
    this._camera = camera
    this.addCommonUniform(
      new ZUniform("u_pvMat", camera, { getValueFunc: v => v.pvMat.elements, type: "mat" }),
      new ZUniform("u_projMat", camera, { getValueFunc: v => v.projMat.elements, type: "mat" }),
      new ZUniform("u_viewMat", camera, { getValueFunc: v => v.viewMat.elements, type: "mat" }),
      new ZUniform("u_nearFar", camera.config, { getValueFunc: v => [v.near, v.far], type: "vec" }),
      new ZUniform("u_eye", camera.config, { getValueFunc: v => v.eye!.toArray(), type: "vec" }),
      new ZUniform("u_target", camera.config, { getValueFunc: v => v.target!.toArray(), type: "vec" }),
    )
    return this
  }
  addCommonUniform(...uniforms: ZUniform[]) {
    uniforms.forEach(uniform => this.uniformData.set(uniform.name, uniform))
    return this
  }
  setModelMat(mat: Matrix4) {
    this.modelMat.local = mat
    this.modelMat.world = mat
    return this
  }

  render() {
    if (this.destroyed) return console.warn(genMsg(`${this.name} 已经被销毁, 不能执行 render`))
    const { gl, depthTest, clearColor } = this

    gl.clearColor(...clearColor)
    depthTest ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    store.isRenderingTransparent = false
    super.renderChildren(this)

    store.isRenderingTransparent = true
    gl.depthMask(false)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    super.renderChildren(this)
    gl.depthMask(true)
    gl.disable(gl.BLEND)
  }

  destroy() {
    this.uniformData.clear()
    super.destroy()
  }
}
