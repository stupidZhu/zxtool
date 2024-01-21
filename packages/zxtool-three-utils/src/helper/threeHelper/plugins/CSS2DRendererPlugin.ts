import { CSS2DParameters, CSS2DRenderer } from "three/examples/jsm/Addons.js"
import { ThreeHelperPlugin, ThreeHelperPluginProps } from "."
import { genZTUInfo } from "../../../util/util"

const genInfo = genZTUInfo("CSS2DRendererPlugin")

export class CSS2DRendererPlugin implements ThreeHelperPlugin<CSS2DParameters> {
  private key = Symbol.for("css2d_renderer")
  private ac_key = Symbol.for("update_css2d_renderer")
  private rc_key = Symbol.for("resize_css2d_renderer")
  private addProps: ThreeHelperPluginProps | null = null

  private _css2dRenderer?: CSS2DRenderer
  get css2dRenderer() {
    return this._css2dRenderer
  }

  add(props: ThreeHelperPluginProps, options?: CSS2DParameters): CSS2DRendererPlugin {
    this.addProps = props
    const { threeHelper, widgetCollection, emitter } = props
    const { animationCollection, pluginCollection, resizeCollection } = threeHelper

    const plugin = pluginCollection.get(this.key) as CSS2DRendererPlugin
    if (plugin) {
      console.error(genInfo("已经存在一个 CSS2DRendererPlugin, 不能重复添加"))
      return plugin
    }

    const css2dRenderer = new CSS2DRenderer(options)
    css2dRenderer!.setSize(window.innerWidth, window.innerHeight)
    this._css2dRenderer = css2dRenderer

    widgetCollection.set("css2d_renderer", this.css2dRenderer)
    emitter.emit("css2d_renderer", this.css2dRenderer)

    animationCollection.set(this.ac_key, {
      fn() {
        const camera = widgetCollection.get("camera")
        const scene = widgetCollection.get("scene")
        if (camera && scene) css2dRenderer?.render(scene, camera)
      },
    })
    resizeCollection.set(this.rc_key, {
      fn() {
        css2dRenderer?.setSize(window.innerWidth, window.innerHeight)
      },
    })

    pluginCollection.set(this.key, this)
    return this
  }

  remove(): void {
    if (!this.addProps) throw new Error(genInfo("未添加的插件不能被移除"))
    const { threeHelper, widgetCollection, emitter } = this.addProps
    const { animationCollection, resizeCollection, pluginCollection } = threeHelper

    widgetCollection.delete("css2d_renderer")
    emitter.clearHistory("css2d_renderer")

    this._css2dRenderer = undefined
    animationCollection.delete(this.ac_key)
    resizeCollection.delete(this.rc_key)

    pluginCollection.delete(this.key)
    this.addProps = null
  }
}
