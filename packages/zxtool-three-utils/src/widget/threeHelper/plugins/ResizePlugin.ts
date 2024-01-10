import type { ThreeHelperPlugin, ThreeHelperPluginProps } from "."

export class ResizePlugin implements ThreeHelperPlugin {
  private key = Symbol.for("resize")
  private rc_key = Symbol.for("resize_camera_renderer")

  add(props: ThreeHelperPluginProps): void {
    const { threeHelper, initializedCache, clearCollection } = props
    const { resizeCollection } = threeHelper
    if (initializedCache.get(this.key)) return
    const camera = threeHelper.getWidget("p_camera")!
    const renderer = threeHelper.getWidget("renderer")!

    const resizeFn = () => {
      resizeCollection.forEach(({ fn, state = {} }) => fn({ state }))
    }

    window.addEventListener("resize", resizeFn)

    resizeCollection.set(this.rc_key, {
      fn: () => {
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
      },
    })
    clearCollection.set(this.key, {
      fn: () => {
        window.removeEventListener("resize", resizeFn)
        resizeCollection.clear()
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
