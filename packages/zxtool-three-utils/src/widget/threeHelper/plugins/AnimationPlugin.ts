import * as THREE from "three"
import type { ThreeHelperPlugin } from "."
import type { ThreeHelper } from "../ThreeHelper"
import type { ThreeHelperStore } from "../ThreeHelperStore"

class AnimationPlugin implements ThreeHelperPlugin {
  private key = Symbol.for("animation")
  private animationId = { value: 0 }

  add(ThreeHelper: ThreeHelper, THS: ThreeHelperStore): void {
    if (THS.initializedCache.get(this.key)) return

    const clock = new THREE.Clock()

    const animation = (time = 0) => {
      THS.time.value = time
      THS.animationCollection.forEach(fn => fn(time, clock.getDelta()))
      this.animationId.value = requestAnimationFrame(animation)
    }
    animation()

    THS.clearCollection.set(this.key, () => {
      cancelAnimationFrame(this.animationId.value)
      THS.time.value = 0
      THS.animationCollection.clear()
      THS.initializedCache.set(this.key, false)
    })

    THS.initializedCache.set(this.key, true)
  }

  remove(ThreeHelper: ThreeHelper, THS: ThreeHelperStore): void {
    THS.clearCollection.get(this.key)?.()
  }
}

export default AnimationPlugin
