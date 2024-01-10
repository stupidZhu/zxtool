import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import type { ThreeHelperPlugin, ThreeHelperPluginProps } from "."

export class EffectComposerPlugin implements ThreeHelperPlugin {
  private key = Symbol.for("effect_composer")
  private ac_key = Symbol.for("update_effect_composer")
  private _effectComposer: EffectComposer | null = null

  get effectComposer() {
    return this._effectComposer
  }

  add(props: ThreeHelperPluginProps): void {
    const { threeHelper, initializedCache, clearCollection } = props
    const { animationCollection } = threeHelper
    if (initializedCache.get(this.key)) return

    const scene = threeHelper.getWidget("scene")!
    const renderer = threeHelper.getWidget("renderer")!
    const camera = threeHelper.getWidget("p_camera")!

    const effectComposer = new EffectComposer(renderer)
    effectComposer.setSize(window.innerWidth, window.innerHeight)
    effectComposer.setPixelRatio(window.devicePixelRatio)
    effectComposer.addPass(new RenderPass(scene, camera))
    this._effectComposer = effectComposer

    const updateRendererCache = animationCollection.get(Symbol.for("update_renderer"))

    animationCollection.set(this.ac_key, {
      fn() {
        effectComposer.render()
      },
    })

    clearCollection.set(this.key, {
      fn: () => {
        updateRendererCache && animationCollection.set(Symbol.for("update_renderer"), updateRendererCache)
        animationCollection.delete(this.ac_key)
        this._effectComposer = null
        initializedCache.set(this.key, false)
      },
    })

    initializedCache.set(this.key, true)
  }

  remove({ clearCollection }: ThreeHelperPluginProps): void {
    const clearObj = clearCollection.get(this.key)
    if (clearObj) clearObj.fn({ state: clearObj.state ?? {} })
  }
}
