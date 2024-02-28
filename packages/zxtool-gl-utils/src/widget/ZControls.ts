import { MathUtils, Spherical, Vector3 } from "@zxtool/three-math"
import { Num2 } from "@zxtool/utils"
import { isNil } from "lodash"
import { ZCamera } from "./ZCamera"

export type ControlsState = "move" | "rotate" | "none"

export class ZControls {
  private camera: ZCamera
  private canvas: HTMLCanvasElement
  private curState: ControlsState = "none"
  private spherical = new Spherical()

  leftBtn: ControlsState = "move"
  middleBtn: ControlsState = "rotate"
  rightBtn: ControlsState = "none"

  moveAxis: "x" | "y" | "xy" = "xy"
  rotateAxis: "x" | "y" | "xy" = "xy"
  zoomStep = 0.05

  enableMove = true
  enableScale = true
  enableRotate = true

  onChange?: (camera: ZCamera, controls: ZControls) => void

  constructor(camera: ZCamera, canvas: HTMLCanvasElement) {
    this.camera = camera
    this.canvas = canvas

    this.initEvent()
    this.update()
  }

  initEvent() {
    const { canvas } = this
    canvas.addEventListener("contextmenu", e => e.preventDefault())
    canvas.addEventListener("pointerdown", e => {
      if (e.button === 0) this.curState = this.leftBtn
      else if (e.button === 1) this.curState = this.middleBtn
      else if (e.button === 2) this.curState = this.rightBtn
      else this.curState = "none"
    })
    canvas.addEventListener("pointerup", () => {
      this.curState = "none"
    })
    canvas.addEventListener("pointermove", e => {
      const { movementX, movementY } = e
      if (this.curState === "move") this.move([movementX, movementY])
      if (this.curState === "rotate") this.rotate([movementX, movementY])
    })
    canvas.addEventListener("wheel", e => {
      e.preventDefault()
      this.zoom(e.deltaY)
    })
  }

  private move(offset: Num2) {
    if (!this.enableMove) return
    if (this.camera.type === "Perspective") this.movePCamera(offset)
    if (this.camera.type === "Orthographic") this.moveOCamrea(offset)
    this.update()
  }
  private movePCamera(offset: Num2) {
    const { camera, canvas, moveAxis } = this
    const { mat } = camera
    const { eye, target, fov } = camera.config

    if (!eye || !target || isNil(fov)) return

    // * 求出视平面和 canvas 的比例(高度比例)
    const dis = target.clone().sub(eye).length()
    const targetH = dis * Math.tan(MathUtils.degToRad(fov * 0.5)) * 2
    const ratio = targetH / canvas.clientHeight

    // * 将 canvas 上移动到距离转换为世界坐标的移动距离
    let disX = 0
    let disY = 0
    if (moveAxis.includes("x")) disX = offset[0] * ratio
    if (moveAxis.includes("y")) disY = offset[1] * ratio

    // * 将相机的视点和目标点同时移动
    const axisX = new Vector3().setFromMatrixColumn(mat, 0)
    const axisY = new Vector3().setFromMatrixColumn(mat, 1)
    const moveOffset = axisX.multiplyScalar(-disX).add(axisY.multiplyScalar(disY))

    eye.add(moveOffset)
    target.add(moveOffset)
  }
  private moveOCamrea(offset: Num2) {
    const { camera, canvas } = this
    const { mat } = camera
    const { eye, target, left, right, top, bottom } = camera.config

    if (!eye || !target || isNil(left) || isNil(right) || isNil(top) || isNil(bottom)) return

    const disX = offset[0] * ((top - bottom) / canvas.clientHeight)
    const disY = offset[1] * ((top - bottom) / canvas.clientHeight)

    const axisX = new Vector3().setFromMatrixColumn(mat, 0)
    const axisY = new Vector3().setFromMatrixColumn(mat, 1)
    const moveOffset = axisX.multiplyScalar(-disX).add(axisY.multiplyScalar(disY))
    eye.add(moveOffset)
    target.add(moveOffset)
  }

  private rotate(offset: Num2) {
    if (!this.enableRotate) return
    const { camera, canvas, rotateAxis, spherical } = this
    const { eye, target } = camera.config
    if (!eye || !target) return

    const canvasSize = Math.min(canvas.clientHeight, canvas.clientWidth)

    // * 同时除以 height 或者 width 保证转的一样快
    const deltaTheta = (Math.PI * 2 * offset[0]) / canvasSize
    const deltaPhi = (Math.PI * 2 * offset[1]) / canvasSize

    if (rotateAxis.includes("x")) spherical.theta -= deltaTheta
    if (rotateAxis.includes("y")) {
      spherical.phi -= deltaPhi
      // * 限制纵向旋转范围
      spherical.phi = MathUtils.clamp(spherical.phi, 1e-5, Math.PI - 1e-5)
    }

    // * 求出旋转后 eye 相对于 target 的位置
    const rotateOffset = new Vector3().setFromSpherical(spherical)
    eye.copy(target.clone().add(rotateOffset))
    this.update()
  }

  private zoom(deltaY: number) {
    if (!this.enableScale) return
    const { camera, zoomStep } = this
    const { eye, target } = camera.config

    if (!eye || !target) return

    const zoom = deltaY > 0 ? -zoomStep : zoomStep
    // * lerp 类似于 mix(eye, target, zoom)
    eye.lerp(target, zoom)

    this.update()
  }

  update() {
    const { camera, spherical } = this
    const { eye, target } = camera.config
    if (!eye || !target) return

    spherical.setFromVector3(eye.clone().sub(target))
    camera.updateViewMat()
    this.onChange?.(camera, this)
  }
}
