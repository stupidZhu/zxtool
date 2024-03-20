import { Matrix4 } from "@zxtool/three-math"
import { multiplyMats } from "../util"
import { genZGUInfo } from "../util/util"
import { AttributeItem, ZProgram } from "./ZProgram"

const genInfo = genZGUInfo("ZInstanceProgram")

interface ModelMatsAttr extends Omit<AttributeItem, "data"> {
  data: Matrix4[]
}

// todo: normalMat
export class ZInstanceProgram extends ZProgram {
  instanceCount: number
  readonly modelMatsAttr: ModelMatsAttr
  modelMatsNeedUpdate = true

  constructor(vs: string, fs: string, count: number) {
    super(vs, fs)
    this.instanceCount = count
    this.modelMatsAttr = {
      name: "a_modelMat",
      data: Array.from(Array(this.instanceCount), () => new Matrix4()),
    }
  }

  setModelMatAt(i: number, mat: Matrix4) {
    const { modelMatsAttr } = this
    modelMatsAttr.data[i] = mat
    modelMatsAttr.bufferData = new Float32Array(modelMatsAttr.data.map(mat => mat.elements).flat())
    return this
  }

  protected processAttrData() {
    const { modelMatsAttr } = this
    const { name, data } = modelMatsAttr
    const { gl, program } = this.getProgram()

    super.processAttrData()

    if (modelMatsAttr.location === undefined) modelMatsAttr.location = gl.getAttribLocation(program, name)
    if (modelMatsAttr.location === -1) {
      return console.warn(genInfo(`${this.name} 没有找到 name 为 ${name} 的 attribute`))
    }
    if (!modelMatsAttr.buffer) modelMatsAttr.buffer = gl.createBuffer()!

    modelMatsAttr.bufferData = new Float32Array(data.map(mat => mat.elements).flat())
    const BYTES = Float32Array.BYTES_PER_ELEMENT

    gl.bindBuffer(gl.ARRAY_BUFFER, modelMatsAttr.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, modelMatsAttr.bufferData.byteLength, gl.DYNAMIC_DRAW)

    for (let i = 0; i < 4; i++) {
      const location = modelMatsAttr.location + i
      const offset = BYTES * 4 * i // 每行 4 个数
      gl.vertexAttribPointer(location, 4, gl.FLOAT, false, BYTES * 16, offset)
      gl.enableVertexAttribArray(location)
      gl.vertexAttribDivisor(location, 1)
    }
  }

  private updateModelMats() {
    const { modelMatsAttr, parent } = this
    const gl = this.getGl()

    const modelWorldMats = modelMatsAttr.data.map(mat => {
      return parent ? multiplyMats(parent.modelMat.world, mat) : mat
    })
    modelMatsAttr.bufferData = new Float32Array(modelWorldMats.map(mat => mat.elements).flat())

    gl.bindBuffer(gl.ARRAY_BUFFER, modelMatsAttr.buffer!)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, modelMatsAttr.bufferData!)
  }

  render() {
    const {
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
    const { gl, program } = this.getProgram()
    if (!this.isShow()) return
    this.useProgram()

    this.bindVAO()
    if (attrNeedUpdate) this.processAttrData()
    if (indexNeedUpdate) this.processIndies()
    if (uniformNeedUpdate) this.updateUniform()
    if (modelMatsNeedUpdate) this.updateModelMats()

    this.beforeRender?.({ node: this, parent: parent!, scene: root!, gl, program })

    if (count.index) {
      renderTypes.forEach(type => gl.drawElementsInstanced(type, count.index, gl.UNSIGNED_SHORT, 0, instanceCount))
    } else if (count.vertex) {
      renderTypes.forEach(type => gl.drawArraysInstanced(type, 0, count.vertex, instanceCount))
    }

    this.afterRender?.({ node: this, parent: parent!, scene: root!, gl, program })

    super.renderChildren()
  }
}
