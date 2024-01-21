import { EffectComposer, RenderPass } from "three/examples/jsm/Addons.js"
import type { ThreeHelperPlugin, ThreeHelperPluginProps } from "."
import { genZTUInfo } from "../../../util/util"

const genInfo = genZTUInfo("EffectComposerPlugin")

export class EffectComposerPlugin implements ThreeHelperPlugin {
  private key = Symbol.for("effect_composer")
  private ac_key = Symbol.for("update_effect_composer")
  private addProps: ThreeHelperPluginProps | null = null

  private _effectComposer?: EffectComposer
  get effectComposer() {
    return this._effectComposer
  }

  add(props: ThreeHelperPluginProps): EffectComposerPlugin {
    this.addProps = props
    const { threeHelper } = props
    const { animationCollection, pluginCollection } = threeHelper

    const plugin = pluginCollection.get(this.key) as EffectComposerPlugin
    if (plugin) {
      console.error(genInfo("已经存在一个 EffectComposerPlugin, 不能重复添加"))
      return plugin
    }

    const scene = threeHelper.getWidget("scene")!
    const renderer = threeHelper.getWidget("renderer")!
    const camera = threeHelper.getWidget("camera")!

    const effectComposer = new EffectComposer(renderer)
    effectComposer.setSize(window.innerWidth, window.innerHeight)
    effectComposer.setPixelRatio(window.devicePixelRatio)
    effectComposer.addPass(new RenderPass(scene, camera))
    this._effectComposer = effectComposer

    const updateRenderer = animationCollection.get(Symbol.for("update_renderer"))
    if (updateRenderer) {
      if (!updateRenderer.state) updateRenderer.state = {}
      updateRenderer.state.enable = false
    }

    animationCollection.set(this.ac_key, {
      fn() {
        effectComposer.render()
      },
    })

    pluginCollection.set(this.key, this)
    return this
  }

  remove(): void {
    if (!this.addProps) throw new Error(genInfo("未添加的插件不能被移除"))
    const { threeHelper } = this.addProps
    const { animationCollection, pluginCollection } = threeHelper

    this._effectComposer?.dispose()
    this._effectComposer = undefined
    animationCollection.delete(this.ac_key)
    const updateRenderer = animationCollection.get(Symbol.for("update_renderer"))
    if (updateRenderer) {
      if (!updateRenderer.state) updateRenderer.state = {}
      updateRenderer.state.enable = true
    }

    pluginCollection.delete(this.key)
    this.addProps = null
  }
}
