import { EmitterHelper, IObj } from "@zxtool/utils"
import { CesiumHelperPlugin, CesiumHelperPluginProps } from "./plugins"
import { ViewerPlugin } from "./plugins/ViewerPlugin"

export class CesiumHelper {
  private isInit = false
  private readonly emitter = new EmitterHelper({ maxCount: { history: 1 } })
  private readonly widgetCollection: Map<PropertyKey, any> = new Map()

  readonly pluginCollection: Map<PropertyKey, CesiumHelperPlugin> = new Map()

  getWidget(key: PropertyKey): unknown {
    return this.widgetCollection.get(key)
  }
  getWidgetAsync(key: PropertyKey) {
    return this.emitter.onceAsync(key, true).promise
  }

  addPlugin<AO extends IObj>(plugin: CesiumHelperPlugin<AO>, options?: AO) {
    const props: CesiumHelperPluginProps = {
      emitter: this.emitter,
      widgetCollection: this.widgetCollection,
      cesiumHelper: this,
    }
    plugin.add(props, options)
    return this
  }
  removePlugin<RO extends IObj>(plugin: CesiumHelperPlugin<IObj, RO>, options?: RO) {
    plugin.remove(options)
    return this
  }

  init(container: string | Element) {
    if (this.isInit) return

    // todo
    this.addPlugin(new ViewerPlugin(), { container })

    this.isInit = true
  }
}
