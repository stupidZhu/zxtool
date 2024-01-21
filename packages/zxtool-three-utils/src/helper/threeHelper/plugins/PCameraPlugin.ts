import * as THREE from "three"
import { ThreeHelperPlugin, ThreeHelperPluginProps } from "."
import { genZTUInfo } from "../../../util/util"

export interface PCameraPluginAO {
  fov?: number
  near?: number
  far?: number
}

const genInfo = genZTUInfo("PCameraPlugin")

export class PCameraPlugin implements ThreeHelperPlugin<PCameraPluginAO> {
  private key = Symbol.for("camera")
  private rc_key = Symbol.for("resize_camera")
  private addProps: ThreeHelperPluginProps | null = null

  private _camera?: THREE.PerspectiveCamera
  get camera() {
    return this._camera
  }

  add(props: ThreeHelperPluginProps, options: PCameraPluginAO = {}): PCameraPlugin {
    this.addProps = props
    const { threeHelper, widgetCollection, emitter } = props
    const { resizeCollection, pluginCollection } = threeHelper

    const plugin = pluginCollection.get(this.key) as PCameraPlugin
    if (plugin) {
      console.error(genInfo("已经存在一个 CameraPlugin, 不能重复添加"))
      return plugin
    }

    const { fov = 45, near = 0.1, far = 1e4 } = options
    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far)
    camera.position.set(5, 5, 5)
    this._camera = camera

    widgetCollection.set("camera", camera)
    emitter.emit("camera", camera)

    resizeCollection.set(this.rc_key, {
      fn() {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
      },
    })

    pluginCollection.set(this.key, this)
    return this
  }

  remove(): void {
    if (!this.addProps) throw new Error(genInfo("未添加的插件不能被移除"))
    const { threeHelper, widgetCollection, emitter } = this.addProps
    const { resizeCollection, pluginCollection } = threeHelper

    widgetCollection.delete("camera")
    emitter.clearHistory("camera")

    this._camera?.remove()
    this._camera = undefined
    resizeCollection.delete(this.rc_key)

    pluginCollection.delete(this.key)
    this.addProps = null
  }
}
