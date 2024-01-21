import { CSS3DParameters, CSS3DRenderer } from "three/examples/jsm/Addons.js"
import { ThreeHelperPlugin, ThreeHelperPluginProps } from "."
import { genZTUInfo } from "../../../util/util"

const genInfo = genZTUInfo("CSS3DRendererPlugin")

export class CSS3DRendererPlugin implements ThreeHelperPlugin<CSS3DParameters> {
  private key = Symbol.for("css3d_renderer")
  private ac_key = Symbol.for("update_css3d_renderer")
  private rc_key = Symbol.for("resize_css3d_renderer")
  private addProps: ThreeHelperPluginProps | null = null

  private _css3dRenderer?: CSS3DRenderer
  get css3dRenderer() {
    return this._css3dRenderer
  }

  add(props: ThreeHelperPluginProps, options?: CSS3DParameters): CSS3DRendererPlugin {
    this.addProps = props
    const { threeHelper, widgetCollection, emitter } = props
    const { animationCollection, pluginCollection, resizeCollection } = threeHelper

    const plugin = pluginCollection.get(this.key) as CSS3DRendererPlugin
    if (plugin) {
      console.error(genInfo("已经存在一个 CSS3DRendererPlugin, 不能重复添加"))
      return plugin
    }

    const css3dRenderer = new CSS3DRenderer(options)
    css3dRenderer!.setSize(window.innerWidth, window.innerHeight)
    this._css3dRenderer = css3dRenderer

    widgetCollection.set("css3d_renderer", this.css3dRenderer)
    emitter.emit("css3d_renderer", this.css3dRenderer)

    animationCollection.set(this.ac_key, {
      fn() {
        const camera = widgetCollection.get("camera")
        const scene = widgetCollection.get("scene")
        if (camera && scene) css3dRenderer?.render(scene, camera)
      },
    })
    resizeCollection.set(this.rc_key, {
      fn() {
        css3dRenderer?.setSize(window.innerWidth, window.innerHeight)
      },
    })

    pluginCollection.set(this.key, this)
    return this
  }

  remove(): void {
    if (!this.addProps) throw new Error(genInfo("未添加的插件不能被移除"))
    const { threeHelper, widgetCollection, emitter } = this.addProps
    const { animationCollection, resizeCollection, pluginCollection } = threeHelper

    widgetCollection.delete("css3d_renderer")
    emitter.clearHistory("css3d_renderer")

    this._css3dRenderer = undefined
    animationCollection.delete(this.ac_key)
    resizeCollection.delete(this.rc_key)

    pluginCollection.delete(this.key)
    this.addProps = null
  }
}
