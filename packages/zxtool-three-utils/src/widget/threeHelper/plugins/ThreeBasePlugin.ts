import * as THREE from "three"
import type { ThreeHelperPlugin } from "."
import type { ThreeHelper } from "../ThreeHelper"
import type { ThreeHelperStore } from "../ThreeHelperStore"

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

  add(ThreeHelper: ThreeHelper, THS: ThreeHelperStore): void {
    if (THS.initializedCache.get(this.key)) return

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.set(5, 5, 5)
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    THS.animationCollection.set(this.ac_key, () => {
      if (this.renderer && this.camera && this.scene) this.renderer.render(this.scene, this.camera)
    })

    THS.widgetCollection.set("scene", this.scene)
    THS.widgetCollection.set("renderer", this.renderer)
    THS.widgetCollection.set("p_camera", this.camera)
    THS.widgetCollection.set("canvas", this.canvas)
    THS.emitter.emit("scene", this.scene)
    THS.emitter.emit("renderer", this.renderer)
    THS.emitter.emit("p_camera", this.camera)
    THS.emitter.emit("canvas", this.canvas)

    THS.clearCollection.set(this.key, () => {
      // todo
    })

    THS.initializedCache.set(this.key, true)
  }

  remove(ThreeHelper: ThreeHelper, THS: ThreeHelperStore): void {
    THS.clearCollection.get(this.key)?.(true)
  }
}

export default ThreeBasePlugin
