import * as THREE from "three"
import type { ThreeHelperPlugin, ThreeHelperPluginProps } from "."

type LikeDom = HTMLElement | typeof window | Document

class ClickPlugin implements ThreeHelperPlugin {
  private key = Symbol.for("click")
  private dom: LikeDom

  constructor(dom: LikeDom) {
    this.dom = dom
  }

  add(props: ThreeHelperPluginProps): void {
    const { ThreeHelper, initializedCache, clearCollection } = props
    const { clickCollection } = ThreeHelper
    if (initializedCache.get(this.key)) return

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const clickFn = (ev: unknown) => {
      const scene = ThreeHelper.getWidget("scene")
      const camera = ThreeHelper.getWidget("p_camera")
      if (!scene || !camera) return

      const e = ev as MouseEvent
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * -2

      raycaster.setFromCamera(mouse, camera)
      let res: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[] | null = null

      clickCollection.forEach(({ fn, objs }) => {
        if (objs?.length) {
          const _res = raycaster.intersectObjects(objs)
          if (_res.length) fn(_res, e)
        } else {
          if (!res) res = raycaster.intersectObjects(scene.children)
          fn(res, e)
        }
      })
    }

    this.dom.addEventListener("click", clickFn)

    clearCollection.set(this.key, () => {
      this.dom.removeEventListener("click", clickFn)
      clickCollection.clear()
      initializedCache.set(this.key, false)
    })

    initializedCache.set(this.key, true)
  }

  remove({ clearCollection }: ThreeHelperPluginProps): void {
    clearCollection.get(this.key)?.()
  }
}

export default ClickPlugin
