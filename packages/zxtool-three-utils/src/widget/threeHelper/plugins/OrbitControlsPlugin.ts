import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import type { ThreeHelperPlugin } from "."
import type { ThreeHelper } from "../ThreeHelper"
import type { ThreeHelperStore } from "../ThreeHelperStore"

export interface IControlsConfig {
  enableDamping?: boolean
  distance?: [number, number]
  /** 是否将鼠标操作逻辑改成和 cesium 一样 */
  resetMouse?: boolean
}

class OrbitControlsPlugin implements ThreeHelperPlugin {
  private key = Symbol.for("o_controls")
  private ac_key = Symbol.for("update_o_controls")
  private controls?: OrbitControls
  private config: IControlsConfig

  constructor(config: IControlsConfig = {}) {
    this.config = config
  }

  add(ThreeHelper: ThreeHelper, THS: ThreeHelperStore): void {
    if (THS.initializedCache.get(this.key)) return

    const scene = ThreeHelper.getWidget("scene")
    const canvas = ThreeHelper.getWidget("canvas")
    const camera = ThreeHelper.getWidget("p_camera")
    if (!scene || !canvas || !camera) return

    const { enableDamping = true, distance = [1, 200], resetMouse = true } = this.config

    this.controls = new OrbitControls(camera, canvas)
    this.controls.enableDamping = enableDamping
    this.controls.minDistance = distance[0]
    this.controls.maxDistance = distance[1]

    if (resetMouse) {
      this.controls.enablePan = true
      this.controls.mouseButtons.LEFT = THREE.MOUSE.PAN
      this.controls.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE
    }

    THS.animationCollection.set(this.ac_key, (_, delta) => {
      this.controls?.update(delta)
    })

    THS.clearCollection.set(this.key, () => {
      this.controls?.dispose()
      this.controls = undefined
      THS.animationCollection.delete(this.ac_key)
      THS.initializedCache.set(this.key, false)
    })

    THS.initializedCache.set(this.key, true)
  }

  remove(ThreeHelper: ThreeHelper, THS: ThreeHelperStore): void {
    THS.clearCollection.get(this.key)?.()
  }
}

export default OrbitControlsPlugin
