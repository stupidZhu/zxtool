import type { ThreeHelperPlugin } from "."
import type { ThreeHelper } from "../ThreeHelper"
import type { ThreeHelperStore } from "../ThreeHelperStore"

class ResizePlugin implements ThreeHelperPlugin {
  private key = Symbol.for("resize")
  private rc_key = Symbol.for("resize_camera_renderer")

  add(ThreeHelper: ThreeHelper, THS: ThreeHelperStore): void {
    if (THS.initializedCache.get(this.key)) return
    const camera = ThreeHelper.getWidget("p_camera")!
    const renderer = ThreeHelper.getWidget("renderer")!

    const resizeFn = () => {
      THS.resizeCollection.forEach(fn => fn())
    }

    window.addEventListener("resize", resizeFn)

    THS.resizeCollection.set(this.rc_key, () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
    })
    THS.clearCollection.set(this.key, () => {
      window.removeEventListener("resize", resizeFn)
      THS.resizeCollection.clear()
      THS.initializedCache.set(this.key, false)
    })

    THS.initializedCache.set(this.key, true)
  }

  remove(ThreeHelper: ThreeHelper, THS: ThreeHelperStore): void {
    THS.clearCollection.get("resize")?.()
  }
}

export default ResizePlugin
