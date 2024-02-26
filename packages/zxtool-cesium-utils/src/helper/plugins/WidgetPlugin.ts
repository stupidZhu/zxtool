import { Viewer } from "cesium"
import { CesiumHelperPlugin, CesiumHelperPluginProps } from "."
import { genZCUInfo } from "../../util/util"

const genInfo = genZCUInfo("WidgetPlugin")

interface WidgetPluginAO<T> {
  getWidget: (viewer: Viewer) => T
  name: PropertyKey
  key: PropertyKey
  onRemove?: (widget: T) => void
}

export class WidgetPlugin<T> implements CesiumHelperPlugin<WidgetPluginAO<T>> {
  private addProps: CesiumHelperPluginProps | null = null
  private options?: WidgetPluginAO<T>

  private _widget?: T
  get widget() {
    return this._widget
  }

  add(props: CesiumHelperPluginProps, options?: WidgetPluginAO<T>): WidgetPlugin<T> {
    const { getWidget, name, key } = options ?? {}
    if (!getWidget || !name || !key) throw new Error(genInfo("添加插件失败, 缺少必要参数"))

    this.options = options
    this.addProps = props
    const { cesiumHelper, widgetCollection, emitter } = props
    const { pluginCollection } = cesiumHelper

    const plugin = pluginCollection.get(key) as WidgetPlugin<T>
    if (plugin) {
      console.error(genInfo(`已经存在一个 key 为 ${String(key)} 的 WidgetPlugin, 不能重复添加`))
      return plugin
    }

    const viewer = cesiumHelper.getWidget("viewer")
    if (!viewer) throw new Error(genInfo("不存在可用的 viewer"))

    const widget = getWidget(viewer)
    this._widget = widget
    widgetCollection.set(name, widget)
    emitter.emit(name, widget)

    pluginCollection.set(key, this)
    return this
  }

  remove() {
    if (!this.addProps || !this.options || !this.widget) throw new Error(genInfo("未添加的插件不能被移除"))
    const { cesiumHelper, widgetCollection, emitter } = this.addProps
    const { name, key, onRemove } = this.options
    const { pluginCollection } = cesiumHelper

    widgetCollection.delete(name)
    emitter.clearHistory(name)

    onRemove?.(this.widget)
    this._widget = undefined

    pluginCollection.delete(key)
    this.addProps = null
  }
}
