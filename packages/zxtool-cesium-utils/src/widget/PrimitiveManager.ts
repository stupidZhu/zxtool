import { CommonUtil } from "@zxtool/utils"
import * as Cesium from "cesium"
import { ViewerUtilSync } from "../util/ViewerUtilSync"
import { ViewerHelper } from "./ViewerHelper"

export type IPrimitive = Cesium.GroundPrimitive | Cesium.ClassificationPrimitive | Cesium.Primitive

export type PrimitiveObj = {
  key: PropertyKey
  primitive: IPrimitive
} & Record<string, any>

export type AddPrimitiveProps = {
  key?: PropertyKey
  primitive: IPrimitive
  flyTo?: boolean
} & Record<string, any>

export class PrimitiveManager {
  private viewer?: Cesium.Viewer
  readonly primitiveCollection = new Map<PropertyKey, PrimitiveObj>()

  constructor(viewer?: Cesium.Viewer) {
    if (viewer) this.viewer = viewer
  }

  async add(props: AddPrimitiveProps) {
    const viewer = await ViewerHelper.getViewerPromise(undefined, this.viewer)
    const { key = Symbol(), flyTo = true, primitive, ...rest } = props

    if (!viewer.scene.primitives.contains(primitive)) viewer.scene.primitives.add(primitive)
    const primitiveObj = { key, primitive, ...rest }
    this.primitiveCollection.set(key, primitiveObj)
    if (flyTo) ViewerUtilSync.flyToPrimitive(primitive, viewer)
    return primitiveObj
  }

  showByCondition = async (condition: Partial<PrimitiveObj>, flyTo?: boolean) => {
    const viewer = await ViewerHelper.getViewerPromise(undefined, this.viewer)
    const map = this.getByCondition(condition)
    let last: IPrimitive | undefined
    map.forEach(item => {
      item.primitive.show = true
      last = item.tileset
    })
    if (flyTo && last) ViewerUtilSync.flyToPrimitive(last, viewer)
  }

  showAll = async (flyTo?: boolean) => {
    const viewer = await ViewerHelper.getViewerPromise(undefined, this.viewer)
    let last: IPrimitive | undefined
    this.primitiveCollection.forEach(item => {
      item.primitive.show = true
      last = item.primitive
    })
    if (flyTo && last) ViewerUtilSync.flyToPrimitive(last, viewer)
  }

  hideByCondition = (condition: Partial<PrimitiveObj>) => {
    const map = this.getByCondition(condition)
    map.forEach(item => (item.primitive.show = false))
  }

  hideAll = () => {
    this.primitiveCollection.forEach(v => (v.primitive.show = false))
  }

  removeByCondition = async (condition: Partial<PrimitiveObj>) => {
    const viewer = await ViewerHelper.getViewerPromise(undefined, this.viewer)
    const map = this.getByCondition(condition)
    map.forEach(item => {
      viewer.scene.primitives.remove(item.primitive)
      this.primitiveCollection.delete(item.key)
    })
  }

  removeAll = async () => {
    const viewer = await ViewerHelper.getViewerPromise(undefined, this.viewer)
    this.primitiveCollection.forEach(item => viewer.scene.primitives.remove(item.primitive))
    this.primitiveCollection.clear()
  }

  getByCondition = (props: Partial<PrimitiveObj>) => {
    return CommonUtil.mapOrSetFilter(this.primitiveCollection, item => {
      return Object.entries(props).every(([k, v]) => {
        return item[k] === v
      })
    })
  }
}
