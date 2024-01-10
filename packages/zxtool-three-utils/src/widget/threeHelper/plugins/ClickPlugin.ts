import { LikeDom } from "@zxtool/utils"
import * as THREE from "three"
import type { ThreeHelperPlugin, ThreeHelperPluginProps } from "."

export class ClickPlugin implements ThreeHelperPlugin {
  private key = Symbol.for("click")
  private cc_key = Symbol.for("default_click")
  private dom: LikeDom

  constructor(dom: LikeDom) {
    this.dom = dom
  }

  add(props: ThreeHelperPluginProps): void {
    const { threeHelper, initializedCache, clearCollection } = props
    const { clickCollection } = threeHelper
    if (initializedCache.get(this.key)) return

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const clickFn = (ev: unknown) => {
      const scene = threeHelper.getWidget("scene")
      const camera = threeHelper.getWidget("p_camera")
      if (!scene || !camera) return

      const e = ev as MouseEvent
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * -2

      raycaster.setFromCamera(mouse, camera)
      let res: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[] | null = null

      clickCollection.forEach(({ fn, state = {} }) => {
        const objs = state.objs
        if (objs?.length) {
          const _res = raycaster.intersectObjects(objs)
          if (_res.length) fn({ objs: _res, e, state })
        } else {
          if (!res) res = raycaster.intersectObjects(scene.children)
          fn({ objs: res, e, state })
        }
      })
    }

    this.dom.addEventListener("click", clickFn)

    clearCollection.set(this.key, {
      fn: () => {
        this.dom.removeEventListener("click", clickFn)
        clickCollection.clear()
        initializedCache.set(this.key, false)
      },
    })

    clickCollection.set(this.cc_key, {
      fn({ objs }) {
        const mesh = objs?.[0]?.object
        // @ts-ignore
        if (typeof mesh?.__onClick === "function") mesh.__onClick()
      },
    })

    initializedCache.set(this.key, true)
  }

  remove({ clearCollection }: ThreeHelperPluginProps): void {
    const clearObj = clearCollection.get(this.key)
    if (clearObj) clearObj.fn({ state: clearObj.state ?? {} })
  }
}
