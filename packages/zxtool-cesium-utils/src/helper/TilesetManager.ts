import { CommonUtil } from "@zxtool/utils"
import * as Cesium from "cesium"
import { ZCUConfig, ZCUConfigType } from "../util/ZCUConfig"
import { genZCUInfo } from "../util/util"

const genInfo = genZCUInfo("TilesetManager")

export type TilesetObj = {
  key: PropertyKey
  tileset: Cesium.Cesium3DTileset
} & Record<string, any>

export interface AddTilesetProps extends Partial<TilesetObj> {
  url: Cesium.Resource | string | number
  flyTo?: boolean
  tilesetOptions?: ZCUConfigType["tilesetOptions"]
}

export class TilesetManager {
  private viewer: Cesium.Viewer
  readonly tilesetCollection = new Map<PropertyKey, TilesetObj>()

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer
  }

  /**
   * @param props 如果 url 是数值则代表 Cesium.IonAssetId; url 和 tileset 传入一个即可, tileset 优先级更高
   */
  add = async (props: AddTilesetProps) => {
    const {
      url,
      key = Symbol(),
      flyTo = true,
      tileset: _tileset,
      tilesetOptions = ZCUConfig.getConfig("tilesetOptions", false) ?? {},
      ...rest
    } = props

    let tilesetObj = this.tilesetCollection.get(key)
    if (tilesetObj?.tileset && tilesetObj.tileset === _tileset) {
      if (flyTo) this.viewer.flyTo(tilesetObj.tileset)
      console.error(genInfo(`当前 key(${key.toString()}) 已经存在，新增 tileset 失败`))
      return tilesetObj
    }

    const tileset =
      _tileset ??
      (typeof url === "number"
        ? await Cesium.Cesium3DTileset.fromIonAssetId(url, tilesetOptions)
        : await Cesium.Cesium3DTileset.fromUrl(url, tilesetOptions))

    if (!this.viewer.scene.primitives.contains(tileset)) this.viewer.scene.primitives.add(tileset)
    tilesetObj = { key, tileset, ...rest }
    this.tilesetCollection.set(key, tilesetObj)
    if (flyTo) this.viewer.flyTo(tileset)
    return tilesetObj
  }

  showByCondition = (condition: Partial<TilesetObj>, flyTo?: boolean) => {
    const map = this.getByCondition(condition)
    let last: Cesium.Cesium3DTileset | undefined
    map.forEach(item => {
      item.tileset.show = true
      last = item.tileset
    })
    if (flyTo && last) this.viewer.flyTo(last)
  }

  showAll = (flyTo?: boolean) => {
    let last: Cesium.Cesium3DTileset | undefined
    this.tilesetCollection.forEach(item => {
      item.tileset.show = true
      last = item.tileset
    })
    if (flyTo && last) this.viewer.flyTo(last)
  }

  hideByCondition = (condition: Partial<TilesetObj>) => {
    const map = this.getByCondition(condition)
    map.forEach(item => (item.tileset.show = false))
  }

  hideAll = () => {
    this.tilesetCollection.forEach(v => (v.tileset.show = false))
  }

  removeByCondition = (condition: Partial<TilesetObj>) => {
    const map = this.getByCondition(condition)
    map.forEach(item => {
      this.viewer.scene.primitives.remove(item.tileset)
      this.tilesetCollection.delete(item.key)
    })
  }

  removeAll = async () => {
    this.tilesetCollection.forEach(item => this.viewer.scene.primitives.remove(item.tileset))
    this.tilesetCollection.clear()
  }

  getByCondition = (props: Partial<TilesetObj>) => {
    return CommonUtil.mapOrSetFilter(this.tilesetCollection, item => {
      return Object.entries(props).every(([k, v]) => {
        return item[k] === v
      })
    })
  }
}
