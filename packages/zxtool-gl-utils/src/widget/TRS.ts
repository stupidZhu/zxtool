import { Euler, Matrix4, Quaternion, Vector3 } from "@zxtool/three-math"
import { Num3 } from "@zxtool/utils"
import { multiplyMats } from "../util"

export interface GetMatrixProps {
  matOrder?: "TRS" | "TSR" | "RTS" | "RST" | "STR" | "SRT"
  rotateOrder?: "XYZ" | "XZY" | "YXZ" | "YZX" | "ZXY" | "ZYX"
}

export class TRS {
  private key = ""
  private mat = new Matrix4()

  translation: Num3 = [0, 0, 0]
  rotation: Num3 = [0, 0, 0]
  scale: Num3 = [1, 1, 1]

  setFromMat(mat: Matrix4, rotateOrder?: GetMatrixProps["rotateOrder"]) {
    const translation = new Vector3()
    const rotation = new Quaternion()
    const scale = new Vector3()
    mat.decompose(translation, rotation, scale)

    this.translation = translation.toArray()
    const euler = new Euler().setFromQuaternion(rotation, rotateOrder)
    this.rotation = [euler.x, euler.y, euler.z]
    this.scale = scale.toArray()

    this.key = JSON.stringify([this.translation, this.rotation, this.scale])
    this.mat = mat
    return this
  }

  getMat(props: GetMatrixProps = {}) {
    const { matOrder, rotateOrder } = props
    const { translation, rotation, scale } = this

    const key = JSON.stringify([translation, rotation, scale])
    if (key === this.key) return this.mat
    this.key = key

    const tMat = new Matrix4().makeTranslation(...translation)
    const rMat = new Matrix4().makeRotationFromEuler(new Euler(...rotation, rotateOrder))
    const sMat = new Matrix4().makeScale(...scale)

    if (!matOrder) {
      this.mat = multiplyMats(tMat, rMat, sMat)
      return this.mat
    }

    const matMap = { T: tMat, R: rMat, S: sMat }
    const mats = [...matOrder].map(k => matMap[k])
    this.mat = multiplyMats(...mats)
    return this.mat
  }
}
