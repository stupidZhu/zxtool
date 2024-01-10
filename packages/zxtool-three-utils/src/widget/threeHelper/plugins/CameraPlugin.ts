import * as THREE from "three"
import { ThreeHelperPlugin, ThreeHelperPluginProps } from "."
import { genZTUInfo } from "../../../util/util"

const genInfo = genZTUInfo("CameraPlugin")

export class CameraPlugin implements ThreeHelperPlugin {
  private key = Symbol.for("animation")
  private _camera: THREE.Camera
  private addProps!: ThreeHelperPluginProps

  get camera() {
    return this.camera
  }
  set camera(c: THREE.Camera) {
    if (!this.addProps) throw new Error(genInfo("设置 camera 之前需要先添加此插件"))
    const { widgetCollection, emitter } = this.addProps

    this._camera = c
    widgetCollection.set("camera", c)
    emitter.emit("camera", c)
  }

  constructor() {
    this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e4)
    this._camera.position.set(5, 5, 5)
  }

  add(props: ThreeHelperPluginProps): CameraPlugin {
    this.addProps = props
    const { widgetCollection, emitter, threeHelper } = props

    const plugin = threeHelper.pluginCollection.get(this.key) as CameraPlugin
    if (plugin) {
      console.error(genInfo("已经存在一个 CameraPlugin, 不能重复添加"))
      return plugin
    }

    widgetCollection.set("camera", this.camera)
    emitter.emit("camera", this.camera)

    return this
  }

  remove(): void {
    if (!this.addProps) throw new Error(genInfo("未添加的插件不能被移除"))

    const { widgetCollection, emitter } = this.addProps

    widgetCollection.delete("camera")
    emitter.clearHistory("camera")
  }
}
