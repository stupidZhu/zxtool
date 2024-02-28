import { Euler, Matrix4 } from "@zxtool/three-math"
import { Num3 } from "@zxtool/utils"
import { multiplyMats } from "../util"

export interface GetMatrixProps {
  matOrder?: "TRS" | "TSR" | "RTS" | "RST" | "STR" | "SRT"
  rotateOrder?: "XYZ" | "XZY" | "YXZ" | "YZX" | "ZXY" | "ZYX"
}

export class TRS {
  translation: Num3 = [0, 0, 0]
  rotation: Num3 = [0, 0, 0]
  scale: Num3 = [1, 1, 1]

  getMatrix(props: GetMatrixProps = {}) {
    const { matOrder, rotateOrder } = props
    const { translation, rotation, scale } = this
    const tMat = new Matrix4().makeTranslation(...translation)
    const rMat = new Matrix4().makeRotationFromEuler(new Euler(...rotation, rotateOrder))
    const sMat = new Matrix4().makeScale(...scale)

    if (!matOrder) return multiplyMats(tMat, rMat, sMat)

    const matMap = { T: tMat, R: rMat, S: sMat }
    const mats = [...matOrder].map(k => matMap[k])
    return multiplyMats(...mats)
  }
}
