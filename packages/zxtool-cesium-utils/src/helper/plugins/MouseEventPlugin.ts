import * as Cesium from "cesium"
import { CesiumHelperPlugin, CesiumHelperPluginProps } from "."
import { genZCUInfo } from "../../util/util"
import { MouseEventHelper } from "../MouseEventHelper"

type RawCb<T> = (picked: any, e: T) => void

const genInfo = genZCUInfo("MouseEventPlugin")

export class MouseEventPlugin implements CesiumHelperPlugin {
  private static key = Symbol.for("__mouse_event__")

  private addProps: CesiumHelperPluginProps | null = null
  private curObj: Cesium.Entity | Cesium.Primitive | null = null
  private cbs = {
    click: (e: { position: Cesium.Cartesian2 }) => {
      const { position } = e

      const { entity, primitive, raw } = this.getPicked(position)
      this.onClick?.(raw, e)

      if (entity) {
        const fn = entity.__customField?.onClick
        if (typeof fn === "function") {
          this.clearClick?.()
          fn(entity!, raw, position)
        }
      } else if (primitive) {
        const fn = primitive.__customField?.onClick
        if (typeof fn === "function") {
          this.clearClick?.()
          fn(primitive!, raw, position)
        }
      }
    },
    move: (e: { startPosition: Cesium.Cartesian2; endPosition: Cesium.Cartesian2 }) => {
      const { endPosition } = e
      const { entity, primitive, raw } = this.getPicked(endPosition)
      this.onMove?.(raw, e)

      const object = entity ?? primitive ?? null
      const hover = object?.__customField?.hover ?? false
      document.body.style.cursor = hover ? "pointer" : "default"

      if (this.curObj === object) return
      const leave = this.curObj?.__customField?.onLeave
      // @ts-ignore
      if (typeof leave === "function") leave(this.curObj, raw)
      const enter = object?.__customField?.onEnter
      // @ts-ignore
      if (typeof enter === "function") enter(object, raw)

      this.curObj = object
    },
  }

  onClick?: RawCb<{ position: Cesium.Cartesian2 }>
  onMove?: RawCb<{ startPosition: Cesium.Cartesian2; endPosition: Cesium.Cartesian2 }>
  clearClick?: () => void

  private _mouseEventHelper?: MouseEventHelper
  get mouseEventHelper() {
    return this._mouseEventHelper
  }

  private getPicked = (
    position: Cesium.Cartesian2,
  ): { entity: Cesium.Entity | null; primitive: Cesium.Primitive | null; raw: any } => {
    if (!this.addProps) return { entity: null, primitive: null, raw: null }
    const { cesiumHelper } = this.addProps

    const viewer = cesiumHelper.getWidget("viewer")
    if (!viewer) return { entity: null, primitive: null, raw: null }

    const picked = viewer.scene.pick(position)
    if (!Cesium.defined(picked)) return { entity: null, primitive: null, raw: null }

    const res = { entity: null, primitive: null, raw: picked }

    if (picked.id instanceof Cesium.Entity) res.entity = picked.id
    if (picked.primitive instanceof Cesium.Primitive) res.primitive = picked.primitive
    return res
  }

  add(props: CesiumHelperPluginProps): MouseEventPlugin {
    this.addProps = props
    const { cesiumHelper } = props
    const { pluginCollection } = cesiumHelper

    const plugin = pluginCollection.get(MouseEventPlugin.key) as MouseEventPlugin
    if (plugin) {
      console.error(genInfo("已经存在一个 MouseEventPlugin, 不能重复添加"))
      return plugin
    }

    const viewer = cesiumHelper.getWidget("viewer")
    if (!viewer) {
      console.error(genInfo("不存在可用的 viewer"))
      return this
    }

    const mouseEventHelper = new MouseEventHelper(viewer)
    mouseEventHelper.addEvent({ key: MouseEventPlugin.key, type: "LEFT_CLICK", cb: this.cbs.click })
    mouseEventHelper.addEvent({ key: MouseEventPlugin.key, type: "MOUSE_MOVE", cb: this.cbs.move })

    this._mouseEventHelper = mouseEventHelper

    pluginCollection.set(MouseEventPlugin.key, this)
    return this
  }

  remove() {
    if (!this.addProps) throw new Error(genInfo("未添加的插件不能被移除"))
    const { cesiumHelper } = this.addProps
    const { pluginCollection } = cesiumHelper

    this.mouseEventHelper?.clear()
    this._mouseEventHelper = undefined
    this.curObj = null
    this.onClick = undefined
    this.onMove = undefined
    this.clearClick = undefined

    pluginCollection.delete(MouseEventPlugin.key)
    this.addProps = null
  }
}
