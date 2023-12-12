import * as THREE from "three"
import Stats from "three/examples/jsm/libs/stats.module.js"
import type { ThreeHelperPlugin, ThreeHelperPluginProps } from "."

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

  add(props: ThreeHelperPluginProps): void {
    const { threeHelper, initializedCache, clearCollection } = props
    const { animationCollection } = threeHelper
    if (initializedCache.get(this.key)) return

    const scene = threeHelper.getWidget("scene")
    if (!scene) return

    const { enableStats = true, enableAxes = true, axesSize = 50 } = this.config

    if (enableAxes) {
      this.axesHelper = new THREE.AxesHelper(axesSize)
      scene.add(this.axesHelper)
    }
    if (enableStats) {
      this.stats = new Stats()
      document.body.appendChild(this.stats.dom)
      animationCollection.set(this.ac_key, () => {
        this.stats?.update()
      })
    }

    clearCollection.set(this.key, () => {
      if (this.stats) {
        this.stats.dom.remove()
        this.stats = undefined
      }
      if (this.axesHelper) {
        scene.remove(this.axesHelper)
        this.axesHelper = undefined
      }
      initializedCache.set(this.key, false)
    })

    initializedCache.set(this.key, true)
  }

  remove({ clearCollection }: ThreeHelperPluginProps): void {
    clearCollection.get(this.key)?.()
  }
}

export default DevPlugin
