import * as Cesium from "cesium"
import { CesiumHelperPlugin, CesiumHelperPluginProps } from "."
import { CesiumUtil, ViewerUtil } from "../../util"
import { genZCUInfo } from "../../util/util"

export type ViewerPluginAO = Cesium.Viewer.ConstructorOptions & {
  container: string | Element
  hideWidget?: boolean
  fxaa?: boolean
  enableIframe?: boolean
}

const genInfo = genZCUInfo("ViewerPlugin")

export class ViewerPlugin implements CesiumHelperPlugin<ViewerPluginAO> {
  private static key = Symbol.for("__viewer__")
  private addProps: CesiumHelperPluginProps | null = null

  private _viewer?: Cesium.Viewer
  get viewer() {
    return this._viewer
  }

  add(props: CesiumHelperPluginProps, options: ViewerPluginAO): ViewerPlugin {
    this.addProps = props
    const { cesiumHelper, widgetCollection, emitter } = props
    const { pluginCollection } = cesiumHelper

    const plugin = pluginCollection.get(ViewerPlugin.key) as ViewerPlugin
    if (plugin) {
      console.error(genInfo("已经存在一个 ViewerPlugin, 不能重复添加"))
      return plugin
    }

    const { container, hideWidget = true, fxaa = true, enableIframe, ...rest } = options
    if (!container) throw new Error("请传入 container")

    const viewer = new Cesium.Viewer(container, {
      // msaaSamples: 4,
      ...(hideWidget ? ViewerUtil.getHideWidgetOption() : null),
      ...rest,
    })
    // @ts-ignore
    if (hideWidget) viewer.cesiumWidget.creditContainer.style.display = "none"
    fxaa && ViewerUtil.fxaa(viewer)
    enableIframe && CesiumUtil.enableIframe()
    viewer.scene.globe.depthTestAgainstTerrain = true

    this._viewer = viewer
    widgetCollection.set("viewer", viewer)
    emitter.emit("viewer", viewer)

    pluginCollection.set(ViewerPlugin.key, this)
    return this
  }

  remove(): void {
    if (!this.addProps) throw new Error(genInfo("未添加的插件不能被移除"))
    const { cesiumHelper, widgetCollection, emitter } = this.addProps
    const { pluginCollection } = cesiumHelper

    widgetCollection.delete("viewer")
    emitter.clearHistory("viewer")

    this.viewer?.destroy()
    this._viewer = undefined

    pluginCollection.delete(ViewerPlugin.key)
    this.addProps = null
  }
}
