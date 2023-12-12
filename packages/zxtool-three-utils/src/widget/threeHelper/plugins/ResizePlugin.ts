import type { ThreeHelperPlugin, ThreeHelperPluginProps } from "."

class ResizePlugin implements ThreeHelperPlugin {
  private key = Symbol.for("resize")
  private rc_key = Symbol.for("resize_camera_renderer")

  add(props: ThreeHelperPluginProps): void {
    const { ThreeHelper, initializedCache, clearCollection } = props
    const { resizeCollection } = ThreeHelper
    if (initializedCache.get(this.key)) return
    const camera = ThreeHelper.getWidget("p_camera")!
    const renderer = ThreeHelper.getWidget("renderer")!

    const resizeFn = () => {
      resizeCollection.forEach(fn => fn())
    }

    window.addEventListener("resize", resizeFn)

    resizeCollection.set(this.rc_key, () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    })
    clearCollection.set(this.key, () => {
      window.removeEventListener("resize", resizeFn)
      resizeCollection.clear()
      initializedCache.set(this.key, false)
    })

    initializedCache.set(this.key, true)
  }

  remove({ clearCollection }: ThreeHelperPluginProps): void {
    clearCollection.get("resize")?.()
  }
}

export default ResizePlugin
