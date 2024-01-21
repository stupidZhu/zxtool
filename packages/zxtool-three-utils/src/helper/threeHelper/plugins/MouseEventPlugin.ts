import { LikeDom } from "@zxtool/utils"
import * as THREE from "three"
import type { ThreeHelperPlugin, ThreeHelperPluginProps } from "."
import { genZTUInfo } from "../../../util/util"

type RawCb = (intersection: THREE.Intersection | null, e: MouseEvent) => void
export interface MouseEventPluginAO {
  dom?: LikeDom
}

const genInfo = genZTUInfo("MouseEventPlugin")

export class MouseEventPlugin implements ThreeHelperPlugin<MouseEventPluginAO> {
  private key = Symbol.for("mouse_event")
  private raycaster = new THREE.Raycaster()
  private pointerV2 = new THREE.Vector2()
  private dom: LikeDom = document
  private addProps: ThreeHelperPluginProps | null = null
  private curObj: THREE.Object3D | null = null
  private cbs = {
    down: (ev: unknown) => {
      const e = ev as PointerEvent
      if (e.button !== 0) return
      this.cbs.state.startTime = Date.now()
      this.cbs.state.startX = e.clientX
      this.cbs.state.startY = e.clientY
    },
    up: (ev: unknown) => {
      const e = ev as PointerEvent
      const { button, clientX, clientY } = e
      if (button !== 0) return
      const { startTime, startX, startY } = this.cbs.state
      const deltaTime = Date.now() - startTime
      const deltaX = clientX - startX
      const deltaY = clientY - startY
      if (deltaTime > 400 || deltaX * deltaX + deltaY * deltaY > 20) return

      const [intersection] = this.getIntersection(clientX, clientY)
      this.onClick?.(intersection, e)

      const fn = intersection?.object?.__customField?.onClick
      if (typeof fn === "function") {
        this.clearClick?.()
        fn(intersection!.object.__customField, intersection!)
      }
    },
    move: (ev: unknown) => {
      const e = ev as PointerEvent
      const [intersection] = this.getIntersection(e.clientX, e.clientY)
      this.onMove?.(intersection, e)
      if (this.curObj === intersection?.object ?? null) return

      const leave = this.curObj?.__customField?.onLeave
      if (typeof leave === "function") leave(this.curObj!.__customField, intersection!)
      const enter = intersection?.object?.__customField?.onEnter
      if (typeof enter === "function") enter(intersection!.object.__customField, intersection!)

      this.curObj = intersection?.object ?? null
    },
    state: { startTime: 0, startX: 0, startY: 0 },
  }

  include?: THREE.Object3D[] = undefined
  exclude?: THREE.Object3D[] = undefined

  onClick?: RawCb
  onMove?: RawCb
  clearClick?: () => void

  private getIntersection = (screenX: number, screenY: number) => {
    if (!this.addProps) throw new Error(genInfo("未添加插件"))
    const { threeHelper } = this.addProps

    const scene = threeHelper.getWidget("scene")
    const camera = threeHelper.getWidget("camera")
    if (!scene || !camera) return [null, []] as const

    this.pointerV2.x = (screenX / window.innerWidth - 0.5) * 2
    this.pointerV2.y = (screenY / window.innerHeight - 0.5) * -2
    this.raycaster.setFromCamera(this.pointerV2, camera)

    const include = this.include ?? scene.children
    const intersections = this.raycaster.intersectObjects(include)

    let intersection: THREE.Intersection | null = intersections[0] ?? null
    if (this.exclude?.length) intersection = this.exclude.includes(intersection.object) ? null : intersection
    return [intersection, intersections] as const
  }

  add(props: ThreeHelperPluginProps, options: MouseEventPluginAO = {}): MouseEventPlugin {
    this.addProps = props
    const { threeHelper } = props
    const { pluginCollection } = threeHelper

    const plugin = pluginCollection.get(this.key) as MouseEventPlugin
    if (plugin) {
      console.error(genInfo("已经存在一个 MouseEventPlugin, 不能重复添加"))
      return plugin
    }

    if (options.dom) this.dom = options.dom

    this.dom.addEventListener("pointerdown", this.cbs.down)
    this.dom.addEventListener("pointermove", this.cbs.move)
    this.dom.addEventListener("pointerup", this.cbs.up)

    pluginCollection.set(this.key, this)
    return this
  }

  remove(): void {
    if (!this.addProps) throw new Error(genInfo("未添加的插件不能被移除"))
    const { threeHelper } = this.addProps
    const { pluginCollection } = threeHelper

    this.dom.removeEventListener("pointerdown", this.cbs.down)
    this.dom.removeEventListener("pointermove", this.cbs.move)
    this.dom.removeEventListener("pointerup", this.cbs.up)
    this.cbs.state = { startTime: 0, startX: 0, startY: 0 }
    this.curObj = null
    this.dom = document
    this.include = undefined
    this.exclude = undefined
    this.onClick = undefined
    this.onMove = undefined
    this.clearClick = undefined

    pluginCollection.delete(this.key)
    this.addProps = null
  }
}
