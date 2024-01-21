import type { ThreeHelperPlugin, ThreeHelperPluginProps } from "."
import { genZTUInfo } from "../../../util/util"

const genInfo = genZTUInfo("ResizePlugin")

export class ResizePlugin implements ThreeHelperPlugin {
  private key = Symbol.for("resize")
  private addProps: ThreeHelperPluginProps | null = null
  private resizeFn: (() => void) | null = null

  add(props: ThreeHelperPluginProps): ResizePlugin {
    this.addProps = props
    const { threeHelper } = props
    const { resizeCollection, pluginCollection } = threeHelper

    const plugin = pluginCollection.get(this.key) as ResizePlugin
    if (plugin) {
      console.error(genInfo("已经存在一个 ResizePlugin, 不能重复添加"))
      return plugin
    }

    this.resizeFn = () => {
      resizeCollection.forEach(({ fn, state = {} }) => {
        if (state.enable === false) return
        fn({ state })
      })
    }
    window.addEventListener("resize", this.resizeFn)

    pluginCollection.set(this.key, this)
    return this
  }

  remove(): void {
    if (!this.addProps) throw new Error(genInfo("未添加的插件不能被移除"))
    const { threeHelper } = this.addProps
    const { pluginCollection } = threeHelper

    this.resizeFn && window.removeEventListener("resize", this.resizeFn)
    this.resizeFn = null

    pluginCollection.delete(this.key)
    this.addProps = null
  }
}
