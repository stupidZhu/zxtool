import { Matrix4 } from "@zxtool/three-math"
import { Num4 } from "@zxtool/utils"
import { isNil } from "lodash"
import { genZGUMsg } from "../util/util"
import { GLNode } from "./GLNode"
import { ZCamera } from "./ZCamera"
import { ZUniform } from "./ZUniform"

const genMsg = genZGUMsg("ZProgram")

export class ZScene extends GLNode {
  readonly uniformData: Map<string, ZUniform> = new Map()
  clearColor: Num4 = [0, 0, 0, 0]
  depthTest = true
  readonly timeRef = { value: 0 }
  readonly deltaTimeRef = { value: 0 }
  protected camera?: ZCamera

  constructor() {
    super()
    // @ts-ignore
    this.root = this
    this.name = "ZScene"
    this.initGlobalUniform()
  }

  protected initGlobalUniform() {
    this.addGlobalUniform(new ZUniform("u_time", this.timeRef, { getValueFunc: v => v.value }))
    this.addGlobalUniform(new ZUniform("u_deltaTime", this.deltaTimeRef, { getValueFunc: v => v.value }))
    this.addGlobalUniform(
      new ZUniform("u_canvasSize", this.gl.canvas, { getValueFunc: v => [v.width, v.height], type: "vec" }),
    )
    this.addGlobalUniform(new ZUniform("u_clearColor", this, { getValueFunc: v => v.clearColor, type: "vec" }))
  }

  setCamera(camera: ZCamera) {
    this.camera = camera
    this.addGlobalUniform(new ZUniform("u_pvMat", camera, { getValueFunc: v => v.pvMat.elements, type: "mat" }))
    this.addGlobalUniform(new ZUniform("u_projMat", camera, { getValueFunc: v => v.projMat.elements, type: "mat" }))
    this.addGlobalUniform(new ZUniform("u_viewMat", camera, { getValueFunc: v => v.viewMat.elements, type: "mat" }))
    this.addGlobalUniform(new ZUniform("u_nearFar", camera.config, { getValueFunc: v => [v.near, v.far], type: "vec" }))
    this.addGlobalUniform(new ZUniform("u_eye", camera.config, { getValueFunc: v => v.eye!.toArray(), type: "vec" }))
    this.addGlobalUniform(new ZUniform("u_target", camera.config, { getValueFunc: v => v.target!.toArray(), type: "vec" }))
    return this
  }
  addGlobalUniform(uniform: ZUniform) {
    this.uniformData.set(uniform.name, uniform)
    return this
  }
  setModelMat(mat: Matrix4) {
    this.modelMat.local = mat
    this.modelMat.world = mat
    return this
  }

  render(time?: number) {
    if (this.destroyed) return console.warn(genMsg(`${this.name} 已经被销毁, 不能执行 render`))
    const { gl, depthTest, clearColor, timeRef, deltaTimeRef } = this

    if (!isNil(time)) {
      deltaTimeRef.value = time - timeRef.value
      timeRef.value = time
    }

    gl.clearColor(...clearColor)
    depthTest ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    super.renderChildren()
  }

  destroy() {
    this.uniformData.clear()
    this.timeRef.value = 0
    this.deltaTimeRef.value = 0
    super.destroy()
  }
}
