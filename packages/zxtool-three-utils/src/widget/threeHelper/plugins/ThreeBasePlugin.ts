import * as THREE from "three"
import type { ThreeHelperPlugin, ThreeHelperPluginProps } from "."

class ThreeBasePlugin implements ThreeHelperPlugin {
  private key = Symbol.for("three_base")
  private ac_key = Symbol.for("update_renderer")
  private canvas: HTMLCanvasElement
  private scene?: THREE.Scene
  private camera?: THREE.PerspectiveCamera
  private renderer?: THREE.WebGLRenderer

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  add(props: ThreeHelperPluginProps): void {
    const { threeHelper, initializedCache, emitter, clearCollection, widgetCollection } = props
    const { animationCollection } = threeHelper
    if (initializedCache.get(this.key)) return

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e4)
    this.camera.position.set(5, 5, 5)
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    animationCollection.set(this.ac_key, () => {
      if (this.renderer && this.camera && this.scene) this.renderer.render(this.scene, this.camera)
    })

    widgetCollection.set("scene", this.scene)
    widgetCollection.set("renderer", this.renderer)
    widgetCollection.set("p_camera", this.camera)
    widgetCollection.set("canvas", this.canvas)
    emitter.emit("scene", this.scene)
    emitter.emit("renderer", this.renderer)
    emitter.emit("p_camera", this.camera)
    emitter.emit("canvas", this.canvas)

    clearCollection.set(this.key, () => {
      // todo
    })

    initializedCache.set(this.key, true)
  }

  remove({ clearCollection }: ThreeHelperPluginProps): void {
    clearCollection.get(this.key)?.(true)
  }
}

export default ThreeBasePlugin
