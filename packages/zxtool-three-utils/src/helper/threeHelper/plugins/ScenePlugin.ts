import * as THREE from "three"
import { ThreeHelperPlugin, ThreeHelperPluginProps } from "."
import { genZTUInfo } from "../../../util/util"

const genInfo = genZTUInfo("ScenePlugin")

export class ScenePlugin implements ThreeHelperPlugin {
  private key = Symbol.for("scene")
  private addProps: ThreeHelperPluginProps | null = null

  private _scene?: THREE.Scene
  get scene() {
    return this._scene
  }

  add(props: ThreeHelperPluginProps): ScenePlugin {
    this.addProps = props
    const { threeHelper, widgetCollection, emitter } = props

    const plugin = threeHelper.pluginCollection.get(this.key) as ScenePlugin
    if (plugin) {
      console.error(genInfo("已经存在一个 ScenePlugin, 不能重复添加"))
      return plugin
    }

    const scene = new THREE.Scene()
    this._scene = scene

    widgetCollection.set("scene", scene)
    emitter.emit("scene", scene)

    threeHelper.pluginCollection.set(this.key, this)
    return this
  }

  remove(): void {
    if (!this.addProps) throw new Error(genInfo("未添加的插件不能被移除"))
    const { threeHelper, widgetCollection, emitter } = this.addProps

    widgetCollection.delete("scene")
    emitter.clearHistory("scene")

    this._scene = undefined

    threeHelper.pluginCollection.delete(this.key)
    this.addProps = null
  }
}
