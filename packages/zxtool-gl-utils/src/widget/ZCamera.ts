import { Matrix4, Vector3 } from "@zxtool/three-math"
import { isNil } from "lodash"
import { getOrthographicMat, getPerspectiveMat, lookAt, multiplyMats } from "../util"

export type CameraType = "Orthographic" | "Perspective"

export interface CameraConfig {
  eye?: Vector3
  target?: Vector3
  up?: Vector3
  left?: number
  right?: number
  top?: number
  bottom?: number
  near?: number
  far?: number
  fov?: number
  aspect?: number
  scale?: number
}

export class ZCamera {
  type: CameraType | null = null

  readonly config: CameraConfig = {}

  mat: Matrix4 = new Matrix4()
  viewMat: Matrix4 = new Matrix4()
  projMat: Matrix4 = new Matrix4()
  pvMat: Matrix4 = new Matrix4()

  setViewMat(eye: Vector3, target: Vector3, up: Vector3) {
    Object.assign(this.config, { eye, target, up })
    this.updateViewMat()
    return this
  }
  setOrthographicMat(left: number, right: number, top: number, bottom: number, near: number, far: number) {
    this.type = "Orthographic"
    Object.assign(this.config, { left, right, top, bottom, near, far })
    this.updateProjMat()
    return this
  }
  setPerspectiveMat(fov: number, aspect: number, near: number, far: number) {
    this.type = "Perspective"
    Object.assign(this.config, { fov, aspect, near, far })
    this.updateProjMat()
    return this
  }
  updateViewMat() {
    const { eye, target, up } = this.config

    if (eye && target && up) {
      this.mat = lookAt(eye, target, up)
      // const realUp = new Vector3(0, 1, 0).applyMatrix4(this.mat)
      this.viewMat = this.mat.clone().invert()
    } else this.viewMat = new Matrix4()

    this.updatePvMat()
    return this.viewMat
  }
  updateProjMat() {
    const { left, right, top, bottom, near, far, fov, aspect, scale = 1 } = this.config

    if (this.type === "Orthographic") {
      if (!isNil(left) && !isNil(right) && !isNil(top) && !isNil(bottom) && !isNil(near) && !isNil(far)) {
        this.projMat = getOrthographicMat(left, right, top, bottom, near, far, scale)
      } else this.projMat = new Matrix4()
    } else if (this.type === "Perspective") {
      if (!isNil(fov) && !isNil(aspect) && !isNil(near) && !isNil(far)) {
        this.projMat = getPerspectiveMat(fov, aspect, near, far, scale)
      } else this.projMat = new Matrix4()
    }

    this.updatePvMat()
    return this.projMat
  }
  updatePvMat() {
    this.pvMat = multiplyMats(this.projMat, this.viewMat)
    return this.pvMat
  }
  updateAllMat() {
    this.updateViewMat()
    this.updateProjMat()
  }
}
