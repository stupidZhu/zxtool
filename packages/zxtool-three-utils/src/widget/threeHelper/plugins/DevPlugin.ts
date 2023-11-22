import * as THREE from "three"
import Stats from "three/examples/jsm/libs/stats.module.js"
import type { ThreeHelperPlugin } from "."
import type { ThreeHelper } from "../ThreeHelper"
import type { ThreeHelperStore } from "../ThreeHelperStore"

export interface DevPluginConfig {
  enableStats?: boolean
  enableAxes?: boolean
  axesSize?: number
}

class DevPlugin implements ThreeHelperPlugin {
  private key = Symbol.for("dev")
  private ac_key = Symbol.for("update_stats")
  private stats?: Stats
  private axesHelper?: THREE.AxesHelper
  private config: DevPluginConfig

  constructor(config: DevPluginConfig = {}) {
    this.config = config
  }

  add(ThreeHelper: ThreeHelper, THS: ThreeHelperStore): void {
    if (THS.initializedCache.get(this.key)) return

    const scene = ThreeHelper.getWidget("scene")
    if (!scene) return

    const { enableStats = true, enableAxes = true, axesSize = 50 } = this.config

    if (enableAxes) {
      this.axesHelper = new THREE.AxesHelper(axesSize)
      scene.add(this.axesHelper)
    }
    if (enableStats) {
      this.stats = new Stats()
      document.body.appendChild(this.stats.dom)
      THS.animationCollection.set(this.ac_key, () => {
        this.stats?.update()
      })
    }

    THS.clearCollection.set(this.key, () => {
      if (this.stats) {
        this.stats.dom.remove()
        this.stats = undefined
      }
      if (this.axesHelper) {
        scene.remove(this.axesHelper)
        this.axesHelper = undefined
      }
      THS.initializedCache.set(this.key, false)
    })

    THS.initializedCache.set(this.key, true)
  }

  remove(ThreeHelper: ThreeHelper, THS: ThreeHelperStore): void {
    THS.clearCollection.get(this.key)?.()
  }
}

export default DevPlugin
