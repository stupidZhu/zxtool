import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/Addons.js"
import { ThreeHelperPlugin, ThreeHelperPluginProps } from "."
import { genZTUInfo } from "../../../util/util"

export interface OControlsPluginAO {
  enableDamping?: boolean
  /** 是否将鼠标操作逻辑改成和 cesium 一样 */
  resetMouse?: boolean
}

const genInfo = genZTUInfo("OControlsPlugin")

export class OControlsPlugin implements ThreeHelperPlugin<OControlsPluginAO> {
  private key = Symbol.for("controls")
  private ac_key = Symbol.for("update_controls")
  private addProps: ThreeHelperPluginProps | null = null

  private _controls?: OrbitControls
  get controls() {
    return this._controls
  }

  add(props: ThreeHelperPluginProps, options: OControlsPluginAO = {}): OControlsPlugin {
    this.addProps = props
    const { threeHelper, widgetCollection, emitter } = props
    const { animationCollection, pluginCollection } = threeHelper

    const plugin = pluginCollection.get(this.key) as OControlsPlugin
    if (plugin) {
      console.error(genInfo("已经存在一个 ControlsPlugin, 不能重复添加"))
      return plugin
    }

    const { enableDamping = true, resetMouse = true } = options
    const renderer = threeHelper.getWidget("renderer")
    const camera = threeHelper.getWidget("camera")

    if (!renderer?.domElement || !camera) {
      console.error(genInfo("不存在可用的 renderer 和 camera"))
      return this
    }

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = enableDamping
    if (resetMouse) {
      controls.enablePan = true
      controls.mouseButtons.LEFT = THREE.MOUSE.PAN
      controls.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE
    }
    this._controls = controls

    widgetCollection.set("controls", controls)
    emitter.emit("controls", controls)

    animationCollection.set(this.ac_key, {
      fn({ delta }) {
        controls.update?.(delta)
      },
    })

    pluginCollection.set(this.key, this)
    return this
  }

  remove(): void {
    if (!this.addProps) throw new Error(genInfo("未添加的插件不能被移除"))
    const { threeHelper, widgetCollection, emitter } = this.addProps
    const { animationCollection, pluginCollection } = threeHelper

    widgetCollection.delete("controls")
    emitter.clearHistory("controls")

    this.controls?.dispose()
    this._controls = undefined
    animationCollection.delete(this.ac_key)

    pluginCollection.delete(this.key)
    this.addProps = null
  }
}
