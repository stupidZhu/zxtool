import * as THREE from "three"
import { ThreeHelperPlugin, ThreeHelperPluginProps } from "."
import { genZTUInfo } from "../../../util/util"

const genInfo = genZTUInfo("RendererPlugin")

export class RendererPlugin implements ThreeHelperPlugin<THREE.WebGLRendererParameters> {
  private key = Symbol.for("renderer")
  private ac_key = Symbol.for("update_renderer")
  private rc_key = Symbol.for("resize_renderer")
  private addProps: ThreeHelperPluginProps | null = null

  private _renderer?: THREE.WebGLRenderer
  get renderer() {
    return this._renderer
  }

  add(props: ThreeHelperPluginProps, options?: THREE.WebGLRendererParameters): RendererPlugin {
    this.addProps = props
    const { threeHelper, widgetCollection, emitter } = props
    const { animationCollection, resizeCollection, pluginCollection } = threeHelper

    const plugin = pluginCollection.get(this.key) as RendererPlugin
    if (plugin) {
      console.error(genInfo("已经存在一个 RendererPlugin, 不能重复添加"))
      return plugin
    }

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, logarithmicDepthBuffer: true, ...options })
    renderer.shadowMap.enabled = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    this._renderer = renderer

    widgetCollection.set("renderer", renderer)
    emitter.emit("renderer", renderer)

    animationCollection.set(this.ac_key, {
      fn() {
        const camera = widgetCollection.get("camera")
        const scene = widgetCollection.get("scene")
        if (camera && scene) renderer.render(scene, camera)
      },
    })
    resizeCollection.set(this.rc_key, {
      fn() {
        renderer.setSize(window.innerWidth, window.innerHeight)
      },
    })

    pluginCollection.set(this.key, this)
    return this
  }

  remove(): void {
    if (!this.addProps) throw new Error(genInfo("未添加的插件不能被移除"))
    const { threeHelper, widgetCollection, emitter } = this.addProps
    const { animationCollection, resizeCollection, pluginCollection } = threeHelper

    widgetCollection.delete("renderer")
    emitter.clearHistory("renderer")

    this.renderer?.dispose()
    this._renderer = undefined
    animationCollection.delete(this.ac_key)
    resizeCollection.delete(this.rc_key)

    pluginCollection.delete(this.key)
    this.addProps = null
  }
}

// interface Test<A extends IObj> {
//   getAny(a: A): Test<A>
// }

// class TTTT implements Test<{ hello: string }> {
//   getAny(a: { hello: string }) {
//     return this
//   }
// }

// type Func<T extends IObj, O extends Test<T>> = (t: O, p: T) => O

// const func = <O extends Test<T>, T extends IObj = IObj>(t: O, p?: T) => {}
// func<TTTT>(new TTTT(), { hello: 1 })

// class TestPlugin implements ThreeHelperPlugin<{ hello: string }> {
//   add(props: ThreeHelperPluginProps, options?: { hello: string }): TestPlugin {
//     return this
//   }
//   remove(): void {}
// }

// const addPlugin = <AO extends IObj>(plugin: ThreeHelperPlugin<AO>, options?: AO) => {}
// addPlugin(new RendererPlugin(), { aa: 1 })
