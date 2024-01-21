import { throttle } from "lodash"
import * as THREE from "three"
import type { ThreeHelperPlugin, ThreeHelperPluginProps } from "."
import { genZTUInfo } from "../../../util/util"

const genInfo = genZTUInfo("AnimationPlugin")

export class AnimationPlugin implements ThreeHelperPlugin {
  private key = Symbol.for("animation")
  private animationId = { value: 0 }
  private addProps: ThreeHelperPluginProps | null = null

  add(props: ThreeHelperPluginProps): AnimationPlugin {
    this.addProps = props
    const { threeHelper } = props
    const { time, animationCollection, pluginCollection } = threeHelper

    const plugin = pluginCollection.get(this.key) as AnimationPlugin
    if (plugin) {
      console.error(genInfo("已经存在一个 AnimationPlugin, 不能重复添加"))
      return plugin
    }

    const clock = new THREE.Clock()

    const animation = (t = 0) => {
      time.value = t
      const delta = clock.getDelta()
      animationCollection.forEach<{ _throttled?: boolean }>(item => {
        const { fn, state = {} } = item
        if (state.enable === false) return
        if (state.throttleTime && !state._throttled) {
          fn({ time: t, delta, state })
          item.fn = throttle(item.fn, state.throttleTime)
          state._throttled = true
        } else fn({ time: t, delta, state })
      })
      this.animationId.value = requestAnimationFrame(animation)
    }
    animation()

    pluginCollection.set(this.key, this)
    return this
  }

  remove(): void {
    if (!this.addProps) throw new Error(genInfo("未添加的插件不能被移除"))
    const { threeHelper } = this.addProps
    const { time, pluginCollection } = threeHelper

    cancelAnimationFrame(this.animationId.value)
    time.value = 0

    pluginCollection.delete(this.key)
    this.addProps = null
  }
}
