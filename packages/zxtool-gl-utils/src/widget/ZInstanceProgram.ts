import { Matrix4 } from "@zxtool/three-math"
import { multiplyMats } from "../util"
import { ZAttribute } from "./ZAttribute"
import { ZProgram } from "./ZProgram"

const IdentityMat = new Matrix4()

export class ZInstanceProgram extends ZProgram {
  readonly instanceCount: number
  modelMatsNeedUpdate = true

  readonly modelMats: Matrix4[] = []
  private worldModelMats: Matrix4[] = []
  private modelMatsZAttr: ZAttribute

  constructor(vs: string, fs: string, count: number) {
    super(vs, fs)
    this.instanceCount = count
    this.modelMatsZAttr = new ZAttribute("a_modelMat", {
      data: this.worldModelMats,
      getValueFunc: v => v.map(mat => mat.elements),
      isInstanceAttr: true,
    })
    this.addAttribute(this.modelMatsZAttr)
  }

  private updateModelMats() {
    const { parent, instanceCount, worldModelMats, modelMats, modelMatsZAttr } = this
    for (let i = 0; i < instanceCount; i++) {
      const mat = modelMats[i] ?? IdentityMat
      worldModelMats[i] = parent ? multiplyMats(parent.modelMat.world, mat) : mat
    }
    modelMatsZAttr.needUpdate = true
  }

  render() {
    const {
      gl,
      program,
      vao,
      count,
      instanceCount,
      parent,
      root,
      renderTypes,
      attrNeedUpdate,
      indexNeedUpdate,
      uniformNeedUpdate,
      modelMatsNeedUpdate,
    } = this
    if (!this.isShow()) return
    this.useProgram()

    gl.bindVertexArray(vao)
    if (modelMatsNeedUpdate) this.updateModelMats()
    if (attrNeedUpdate) this.processAttrData()
    if (indexNeedUpdate) this.processIndies()
    if (uniformNeedUpdate) this.processUniform()

    this.beforeRender?.({ node: this, parent: parent!, scene: root!, gl, program })

    if (count.index) {
      renderTypes.forEach(type => gl.drawElementsInstanced(type, count.index, gl.UNSIGNED_SHORT, 0, instanceCount))
    } else if (count.vertex) {
      renderTypes.forEach(type => gl.drawArraysInstanced(type, 0, count.vertex, instanceCount))
    }
    gl.bindVertexArray(null)

    this.afterRender?.({ node: this, parent: parent!, scene: root!, gl, program })

    super.renderChildren()
  }
}
