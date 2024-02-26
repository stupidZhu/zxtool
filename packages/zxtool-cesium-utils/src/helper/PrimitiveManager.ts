import { CommonUtil } from "@zxtool/utils"
import * as Cesium from "cesium"
import { ViewerUtil } from "../util"

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
  private viewer: Cesium.Viewer
  readonly primitiveCollection = new Map<PropertyKey, PrimitiveObj>()

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer
  }

  add(props: AddPrimitiveProps) {
    const { key = Symbol(), flyTo = true, primitive, ...rest } = props

    if (!this.viewer.scene.primitives.contains(primitive)) this.viewer.scene.primitives.add(primitive)
    const primitiveObj = { key, primitive, ...rest }
    this.primitiveCollection.set(key, primitiveObj)
    if (flyTo) ViewerUtil.flyToPrimitive(this.viewer, primitive)
    return primitiveObj
  }

  showByCondition = (condition: Partial<PrimitiveObj>, flyTo?: boolean) => {
    const map = this.getByCondition(condition)
    let last: IPrimitive | undefined
    map.forEach(item => {
      item.primitive.show = true
      last = item.tileset
    })
    if (flyTo && last) ViewerUtil.flyToPrimitive(this.viewer, last)
  }

  showAll = (flyTo?: boolean) => {
    let last: IPrimitive | undefined
    this.primitiveCollection.forEach(item => {
      item.primitive.show = true
      last = item.primitive
    })
    if (flyTo && last) ViewerUtil.flyToPrimitive(this.viewer, last)
  }

  hideByCondition = (condition: Partial<PrimitiveObj>) => {
    const map = this.getByCondition(condition)
    map.forEach(item => (item.primitive.show = false))
  }

  hideAll = () => {
    this.primitiveCollection.forEach(v => (v.primitive.show = false))
  }

  removeByCondition = (condition: Partial<PrimitiveObj>) => {
    const map = this.getByCondition(condition)
    map.forEach(item => {
      this.viewer.scene.primitives.remove(item.primitive)
      this.primitiveCollection.delete(item.key)
    })
  }

  removeAll = () => {
    this.primitiveCollection.forEach(item => this.viewer.scene.primitives.remove(item.primitive))
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
