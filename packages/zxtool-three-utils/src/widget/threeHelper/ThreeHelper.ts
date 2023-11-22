import { AnimationItem, ClickItem, ThreeHelperStore } from "./ThreeHelperStore"
import { ThreeHelperPlugin } from "./plugins"
import AnimationPlugin from "./plugins/AnimationPlugin"
import ResizePlugin from "./plugins/ResizePlugin"
import ThreeBasePlugin from "./plugins/ThreeBasePlugin"

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
  private THS = new ThreeHelperStore()
  private key = Symbol.for("th")

  getTime() {
    return this.THS.time
  }
  getWidget(key: PropertyKey): any {
    return this.THS.widgetCollection.get(key)
  }
  getWidgetAsync(key: PropertyKey) {
    return this.THS.emitter.onceAsync(key, true).promise
  }
  addToAnimation(key: PropertyKey, val: AnimationItem) {
    this.THS.animationCollection.set(key, val)
  }
  removeFromAnimation(key: PropertyKey) {
    this.THS.animationCollection.delete(key)
  }
  addToClick(key: PropertyKey, val: ClickItem) {
    this.THS.clickCollection.set(key, val)
  }
  removeFromClick(key: PropertyKey) {
    this.THS.clickCollection.delete(key)
  }
  addToResize(key: PropertyKey, val: Function) {
    this.THS.resizeCollection.set(key, val)
  }
  removeFromResize(key: PropertyKey) {
    this.THS.resizeCollection.delete(key)
  }

  add(plugin: ThreeHelperPlugin) {
    plugin.add(this, this.THS)
  }
  remove(plugin: ThreeHelperPlugin) {
    plugin.remove(this, this.THS)
  }

  init(canvas: HTMLCanvasElement) {
    if (this.THS.initializedCache.get(this.key)) return

    this.add(new ThreeBasePlugin(canvas))
    this.add(new AnimationPlugin())
    this.add(new ResizePlugin())

    this.THS.initializedCache.set(this.key, true)
  }
}
