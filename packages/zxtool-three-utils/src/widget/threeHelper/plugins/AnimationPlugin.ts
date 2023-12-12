import * as THREE from "three"
import type { ThreeHelperPlugin, ThreeHelperPluginProps } from "."

class AnimationPlugin implements ThreeHelperPlugin {
  private key = Symbol.for("animation")
  private animationId = { value: 0 }

  add(props: ThreeHelperPluginProps): void {
    const { threeHelper, initializedCache, clearCollection } = props
    const { time, animationCollection } = threeHelper
    if (initializedCache.get(this.key)) return

    const clock = new THREE.Clock()

    const animation = (t = 0) => {
      time.value = t
      animationCollection.forEach(fn => fn(t, clock.getDelta()))
      this.animationId.value = requestAnimationFrame(animation)
    }
    animation()

    clearCollection.set(this.key, () => {
      cancelAnimationFrame(this.animationId.value)
      time.value = 0
      animationCollection.clear()
      initializedCache.set(this.key, false)
    })

    initializedCache.set(this.key, true)
  }

  remove({ clearCollection }: ThreeHelperPluginProps): void {
    clearCollection.get(this.key)?.()
  }
}

export default AnimationPlugin
