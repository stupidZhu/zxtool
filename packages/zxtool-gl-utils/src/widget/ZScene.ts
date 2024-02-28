import { Matrix4 } from "@zxtool/three-math"
import { Num4 } from "@zxtool/utils"
import { GLNode } from "./GLNode"
import { ZUniform } from "./ZUniform"

export class ZScene extends GLNode {
  readonly uniformData: Map<string, ZUniform> = new Map()
  clearColor: Num4 = [0, 0, 0, 0]
  depthTest = true

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    super(gl)
  }

  add(child: GLNode) {
    this.children.push(child)
    child.parent = this
    child.rootRef.value = this
    this.resortChildren()
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

  render() {
    const { gl, depthTest, clearColor } = this

    gl.clearColor(...clearColor)
    depthTest ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    super.renderChildren()
  }
}
