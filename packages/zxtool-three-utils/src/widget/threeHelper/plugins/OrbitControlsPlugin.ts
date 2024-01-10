import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import type { ThreeHelperPlugin, ThreeHelperPluginProps } from "."

export interface IControlsConfig {
  enableDamping?: boolean
  distance?: [number, number]
  /** 是否将鼠标操作逻辑改成和 cesium 一样 */
  resetMouse?: boolean
}

export class OrbitControlsPlugin implements ThreeHelperPlugin {
  private key = Symbol.for("o_controls")
  private ac_key = Symbol.for("update_o_controls")
  private controls?: OrbitControls
  private config: IControlsConfig

  constructor(config: IControlsConfig = {}) {
    this.config = config
  }

  add(props: ThreeHelperPluginProps): void {
    const { threeHelper, initializedCache, clearCollection, widgetCollection, emitter } = props
    const { animationCollection } = threeHelper
    if (initializedCache.get(this.key)) return

    const scene = threeHelper.getWidget("scene")
    const canvas = threeHelper.getWidget("canvas")
    const camera = threeHelper.getWidget("p_camera")
    if (!scene || !canvas || !camera) return

    const { enableDamping = true, distance = [1, 1000], resetMouse = true } = this.config

    this.controls = new OrbitControls(camera, canvas)
    this.controls.enableDamping = enableDamping
    this.controls.minDistance = distance[0]
    this.controls.maxDistance = distance[1]

    if (resetMouse) {
      this.controls.enablePan = true
      this.controls.mouseButtons.LEFT = THREE.MOUSE.PAN
      this.controls.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE
    }

    animationCollection.set(this.ac_key, {
      fn: ({ delta }) => {
        this.controls?.update(delta)
      },
    })

    widgetCollection.set("o_controls", this.controls)
    emitter.emit("o_controls", this.controls)

    clearCollection.set(this.key, {
      fn: () => {
        this.controls?.dispose()
        this.controls = undefined
        animationCollection.delete(this.ac_key)
        initializedCache.set(this.key, false)
        widgetCollection.delete("o_controls")
        emitter.clearHistory("o_controls")
      },
    })

    initializedCache.set(this.key, true)
  }

  remove({ clearCollection }: ThreeHelperPluginProps): void {
    const clearObj = clearCollection.get(this.key)
    if (clearObj) clearObj.fn({ state: clearObj.state ?? {} })
  }
}
