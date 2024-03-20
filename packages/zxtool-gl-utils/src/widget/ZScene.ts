import { Matrix4 } from "@zxtool/three-math"
import { Num4 } from "@zxtool/utils"
import { genZGUInfo } from "../util/util"
import { GLNode } from "./GLNode"
import { ZGlobalStore, store } from "./ZGlobalStore"
import { ZUniform } from "./ZUniform"

const genInfo = genZGUInfo("ZScene")

export class ZScene extends GLNode {
  readonly gl: WebGL2RenderingContext
  readonly uniformData: Map<string, ZUniform> = new Map()
  clearColor: Num4 = [0, 0, 0, 0]
  depthTest = true
  timeRef = { value: 0 }

  readonly store: ZGlobalStore

  constructor(gl: WebGL2RenderingContext) {
    if (!(gl instanceof WebGL2RenderingContext)) throw new Error(genInfo("只支持 webgl2 上下文"))
    super()
    this.gl = gl
    this.store = store
    this.root = this
    this.addGlobalUniform(new ZUniform("u_time", this.timeRef, { getValueFunc: v => v.value }))
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
    const { gl, depthTest, clearColor, timeRef } = this

    time && (timeRef.value = time)

    gl.clearColor(...clearColor)
    depthTest ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    super.renderChildren()
  }
}
