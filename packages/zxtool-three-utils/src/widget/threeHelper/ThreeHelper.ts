import { EmitterHelper } from "@zxtool/utils"
import {
  AnimationWithState,
  ClickWithState,
  FunctionWithState,
  StateCbCollection,
  ThreeHelperPlugin,
  ThreeHelperPluginProps,
} from "./plugins"
import { AnimationPlugin } from "./plugins/AnimationPlugin"
import { ResizePlugin } from "./plugins/ResizePlugin"
import { ThreeBasePlugin } from "./plugins/ThreeBasePlugin"

export interface ThreeHelper {
  getWidget(type: "scene"): THREE.Scene | undefined
  getWidget(type: "renderer"): THREE.WebGLRenderer | undefined
  getWidget(type: "p_camera"): THREE.PerspectiveCamera | undefined
  getWidget(type: "canvas"): HTMLCanvasElement | undefined

  getWidgetAsync(type: "scene"): Promise<THREE.Scene>
  getWidgetAsync(type: "renderer"): Promise<THREE.WebGLRenderer>
  getWidgetAsync(type: "p_camera"): Promise<THREE.PerspectiveCamera>
  getWidgetAsync(type: "canvas"): Promise<HTMLCanvasElement>
}

export class ThreeHelper {
  private readonly KEY: PropertyKey = Symbol("TH")
  private readonly emitter = new EmitterHelper({ maxCount: { history: 1 } })
  private readonly initializedCache: Map<PropertyKey, boolean> = new Map()
  private readonly clearCollection: StateCbCollection<PropertyKey, FunctionWithState> = new Map()
  private readonly widgetCollection: Map<PropertyKey, any> = new Map()

  readonly time = { value: 0 }
  readonly animationCollection: StateCbCollection<PropertyKey, AnimationWithState> = new Map()
  readonly clickCollection: StateCbCollection<PropertyKey, ClickWithState> = new Map()
  readonly resizeCollection: StateCbCollection<PropertyKey, FunctionWithState> = new Map()
  readonly pluginCollection: Map<PropertyKey, ThreeHelperPlugin> = new Map()

  getWidget(key: PropertyKey): any {
    return this.widgetCollection.get(key)
  }
  getWidgetAsync(key: PropertyKey) {
    return this.emitter.onceAsync(key, true).promise
  }

  add(plugin: ThreeHelperPlugin) {
    const props: ThreeHelperPluginProps = {
      KEY: this.KEY,
      emitter: this.emitter,
      initializedCache: this.initializedCache,
      clearCollection: this.clearCollection,
      widgetCollection: this.widgetCollection,
      threeHelper: this,
    }
    plugin.add(props)
  }
  remove(plugin: ThreeHelperPlugin) {
    const props: ThreeHelperPluginProps = {
      KEY: this.KEY,
      emitter: this.emitter,
      initializedCache: this.initializedCache,
      clearCollection: this.clearCollection,
      widgetCollection: this.widgetCollection,
      threeHelper: this,
    }
    plugin.remove(props)
  }

  init(canvas: HTMLCanvasElement) {
    if (this.initializedCache.get(this.KEY)) return

    this.add(new ThreeBasePlugin(canvas))
    this.add(new AnimationPlugin())
    this.add(new ResizePlugin())

    this.initializedCache.set(this.KEY, true)
  }
}
