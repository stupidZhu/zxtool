import * as THREE from "three"
import Stats from "three/examples/jsm/libs/stats.module.js"
import type { ThreeHelperPlugin, ThreeHelperPluginProps } from "."
import { genZTUInfo } from "../../../util/util"

export interface DevPluginAO {
  enableStats?: boolean
  enableAxes?: boolean
  axesSize?: number
}

const genInfo = genZTUInfo("DevPlugin")

export class DevPlugin implements ThreeHelperPlugin<DevPluginAO> {
  private key = Symbol.for("dev")
  private ac_key = Symbol.for("update_stats")
  private addProps: ThreeHelperPluginProps | null = null

  private _stats?: Stats
  get stats() {
    return this._stats
  }
  private _axesHelper?: THREE.AxesHelper
  get axesHelper() {
    return this._axesHelper
  }

  add(props: ThreeHelperPluginProps, options: DevPluginAO = {}): DevPlugin {
    this.addProps = props
    const { threeHelper } = props
    const { animationCollection, pluginCollection } = threeHelper

    const plugin = pluginCollection.get(this.key) as DevPlugin
    if (plugin) {
      console.error(genInfo("已经存在一个 DevPlugin, 不能重复添加"))
      return plugin
    }

    const scene = threeHelper.getWidget("scene")
    if (!scene) {
      console.error(genInfo("不存在可用的 scene"))
      return this
    }

    const { enableStats = true, enableAxes = true, axesSize = 50 } = options

    if (enableAxes) {
      this._axesHelper = new THREE.AxesHelper(axesSize)
      scene.add(this._axesHelper)
    }
    if (enableStats) {
      this._stats = new Stats()
      document.body.appendChild(this._stats.dom)
      animationCollection.set(this.ac_key, {
        fn: () => this.stats?.update(),
      })
    }

    pluginCollection.set(this.key, this)
    return this
  }

  remove(): void {
    if (!this.addProps) throw new Error(genInfo("未添加的插件不能被移除"))
    const { threeHelper } = this.addProps

    const scene = threeHelper.getWidget("scene")

    if (this.stats) {
      this.stats.dom.remove()
      this._stats = undefined
    }
    if (this.axesHelper) {
      scene?.remove(this.axesHelper)
      this._axesHelper = undefined
    }

    threeHelper.pluginCollection.delete(this.key)
    this.addProps = null
  }
}
