import { MapList } from "@zxtool/utils"
import * as Cesium from "cesium"
import { last } from "lodash"
import { ViewerUtilSync } from "../util/ViewerUtilSync"
import { ViewerHelper } from "./ViewerHelper"

export type IPrimitive = Cesium.GroundPrimitive | Cesium.ClassificationPrimitive | Cesium.Primitive

export type PrimitiveObj = {
  key: PropertyKey
  primitive: IPrimitive
  viewer: Cesium.Viewer
} & Record<string, any>

export type AddPrimitiveProps = {
  key?: PropertyKey
  primitive: IPrimitive
  viewer?: Cesium.Viewer
  flyTo?: boolean
} & Record<string, any>

class _PrimitiveManager {
  readonly primitiveCollection = new MapList<PrimitiveObj>()

  async add(props: AddPrimitiveProps) {
    const { key = Symbol(), flyTo = true, viewer: _viewer, primitive, ...rest } = props
    const viewer = await ViewerHelper.getViewerPromise(undefined, _viewer)

    if (!viewer.scene.primitives.contains(primitive)) viewer.scene.primitives.add(primitive)
    const primitiveObj = { key, primitive, viewer, ...rest }
    this.primitiveCollection.set(key, primitiveObj)
    if (flyTo) ViewerUtilSync.flyToPrimitive(primitive, viewer)
    return primitiveObj
  }

  showByCondition = (condition: Partial<PrimitiveObj>, flyTo?: boolean) => {
    const list = this.getListByCondition(condition)
    list.forEach(item => (item.primitive.show = true))
    const lastOne = last(list)
    if (flyTo && lastOne) ViewerUtilSync.flyToPrimitive(lastOne.primitive, lastOne.viewer)
  }

  showAll = (flyTo?: boolean) => {
    let last: PrimitiveObj | undefined
    this.primitiveCollection.list.forEach(v => {
      v.primitive.show = true
      last = v
    })
    if (flyTo && last) ViewerUtilSync.flyToPrimitive(last.primitive, last.viewer)
  }

  hideByCondition = (condition: Partial<PrimitiveObj>) => {
    const list = this.getListByCondition(condition)
    list.forEach(item => (item.primitive.show = false))
  }

  hideAll = () => {
    this.primitiveCollection.list.forEach(v => (v.primitive.show = false))
  }

  removeByCondition = (condition: Partial<PrimitiveObj>) => {
    const list = this.getListByCondition(condition)
    list.forEach(item => {
      item.viewer.scene.primitives.remove(item.primitive)
      this.primitiveCollection.delete(item.key)
    })
  }

  removeAll = () => {
    this.primitiveCollection.list.forEach(item => item.viewer.scene.primitives.remove(item.primitive))
    this.primitiveCollection.clear()
  }

  getListByCondition = (props: Partial<PrimitiveObj>) => {
    return this.primitiveCollection.list.filter(item => {
      return Object.entries(props).every(([k, v]) => {
        return item[k] === v
      })
    })
  }
}

export const PrimitiveManager = new _PrimitiveManager()
