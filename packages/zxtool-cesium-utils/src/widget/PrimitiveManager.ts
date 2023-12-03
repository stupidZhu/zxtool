import { MapList } from "@zxtool/utils"
import * as Cesium from "cesium"
import ViewerHelper from "./ViewerHelper"

// todo: flyTo

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
} & Record<string, any>

class _PrimitiveManager {
  readonly mapList = new MapList<PrimitiveObj>()

  async add(props: AddPrimitiveProps) {
    const { key = Symbol(), viewer: _viewer, primitive, ...rest } = props
    const viewer = await ViewerHelper.getViewerPromise(_viewer)

    if (!viewer.scene.primitives.contains(primitive)) viewer.scene.primitives.add(primitive)
    const primitiveObj = { key, primitive, viewer, ...rest }
    this.mapList.set(key, primitiveObj)
    return primitiveObj
  }

  showByCondition = (condition: Partial<PrimitiveObj>) => {
    const list = this.getListByCondition(condition)
    list.forEach(item => (item.primitive.show = true))
  }

  showAll = () => {
    this.mapList.list.forEach(v => (v.primitive.show = true))
  }

  hideByCondition = (condition: Partial<PrimitiveObj>) => {
    const list = this.getListByCondition(condition)
    list.forEach(item => (item.primitive.show = false))
  }

  hideAll = () => {
    this.mapList.list.forEach(v => (v.primitive.show = false))
  }

  removeByCondition = (condition: Partial<PrimitiveObj>) => {
    const list = this.getListByCondition(condition)
    list.forEach(item => {
      item.viewer.scene.primitives.remove(item.primitive)
      this.mapList.delete(item.key)
    })
  }

  removeAll = () => {
    this.mapList.list.forEach(item => item.viewer.scene.primitives.remove(item.primitive))
    this.mapList.clear()
  }

  getListByCondition = (props: Partial<PrimitiveObj>) => {
    return this.mapList.list.filter(item => {
      return Object.entries(props).every(([k, v]) => {
        return item[k] === v
      })
    })
  }
}

export const PrimitiveManager = new _PrimitiveManager()
