import { throttle } from "lodash"
import * as THREE from "three"
import type { ThreeHelperPlugin, ThreeHelperPluginProps } from "."

export class AnimationPlugin implements ThreeHelperPlugin {
  private key = Symbol.for("animation")
  private animationId = { value: 0 }

  add(props: ThreeHelperPluginProps): void {
    const { threeHelper, initializedCache, clearCollection } = props
    const { time, animationCollection } = threeHelper
    if (initializedCache.get(this.key)) return

    const clock = new THREE.Clock()

    const animation = (t = 0) => {
      time.value = t
      const delta = clock.getDelta()
      animationCollection.forEach<{ _throttled?: boolean }>(item => {
        const { fn, state = {} } = item
        if (state.throttleTime && !state._throttled) {
          fn({ time: t, delta, state })
          item.fn = throttle(item.fn, state.throttleTime)
          state._throttled = true
        } else fn({ time: t, delta, state })
      })
      this.animationId.value = requestAnimationFrame(animation)
    }
    animation()

    clearCollection.set(this.key, {
      fn: () => {
        cancelAnimationFrame(this.animationId.value)
        time.value = 0
        animationCollection.clear()
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
