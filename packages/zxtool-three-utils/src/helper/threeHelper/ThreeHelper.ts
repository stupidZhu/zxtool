import { EmitterHelper, IObj } from "@zxtool/utils"
import {
  AnimationWithState,
  FunctionWithState,
  StateCbCollection,
  ThreeHelperPlugin,
  ThreeHelperPluginProps,
} from "./plugins"
import { AnimationPlugin } from "./plugins/AnimationPlugin"
import { PCameraPlugin } from "./plugins/PCameraPlugin"
import { RendererPlugin } from "./plugins/RendererPlugin"
import { ResizePlugin } from "./plugins/ResizePlugin"
import { ScenePlugin } from "./plugins/ScenePlugin"

export interface ThreeHelper {
  getWidget(type: "scene"): THREE.Scene | undefined
  getWidget(type: "renderer"): THREE.WebGLRenderer | undefined
  getWidget(type: "camera"): THREE.Camera | undefined

  getWidgetAsync(type: "scene"): Promise<THREE.Scene>
  getWidgetAsync(type: "renderer"): Promise<THREE.WebGLRenderer>
  getWidgetAsync(type: "camera"): Promise<THREE.Camera>
}

export class ThreeHelper {
  private isInit = false
  private readonly emitter = new EmitterHelper({ maxCount: { history: 1 } })
  private readonly widgetCollection: Map<PropertyKey, any> = new Map()

  readonly time = { value: 0 }
  readonly animationCollection: StateCbCollection<PropertyKey, AnimationWithState> = new Map()
  readonly resizeCollection: StateCbCollection<PropertyKey, FunctionWithState> = new Map()
  readonly pluginCollection: Map<PropertyKey, ThreeHelperPlugin> = new Map()

  getWidget(key: PropertyKey): unknown {
    return this.widgetCollection.get(key)
  }
  getWidgetAsync(key: PropertyKey) {
    return this.emitter.onceAsync(key, true).promise
  }

  addPlugin<AO extends IObj>(plugin: ThreeHelperPlugin<AO>, options?: AO) {
    const props: ThreeHelperPluginProps = {
      emitter: this.emitter,
      widgetCollection: this.widgetCollection,
      threeHelper: this,
    }
    plugin.add(props, options)
    return this
  }
  removePlugin<RO extends IObj>(plugin: ThreeHelperPlugin<IObj, RO>, options?: RO) {
    plugin.remove(options)
    return this
  }

  init(canvas: HTMLCanvasElement) {
    if (this.isInit) return

    this.addPlugin(new RendererPlugin(), { canvas })
      .addPlugin(new ScenePlugin())
      .addPlugin(new PCameraPlugin())
      .addPlugin(new AnimationPlugin())
      .addPlugin(new ResizePlugin())

    this.isInit = true
  }
}
