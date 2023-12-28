import { CommonUtil } from "@zxtool/utils"
import * as Cesium from "cesium"
import { ZCUConfig, ZCUConfigType } from "../util/ZCUConfig"
import { genZCUInfo } from "../util/util"
import { ViewerHelper } from "./ViewerHelper"

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
  private viewer?: Cesium.Viewer
  readonly tilesetCollection = new Map<PropertyKey, TilesetObj>()

  constructor(viewer?: Cesium.Viewer) {
    if (viewer) this.viewer = viewer
  }

  /**
   * @param props 如果 url 是数值则代表 Cesium.IonAssetId; url 和 tileset 传入一个即可, tileset 优先级更高
   */
  add = async (props: AddTilesetProps) => {
    const viewer = await ViewerHelper.getViewerPromise(undefined, this.viewer)
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
      if (flyTo) viewer.flyTo(tilesetObj.tileset)
      console.error(genInfo(`当前 key(${key.toString()}) 已经存在，新增 tileset 失败`))
      return tilesetObj
    }

    const tileset =
      _tileset ??
      (typeof url === "number"
        ? await Cesium.Cesium3DTileset.fromIonAssetId(url, tilesetOptions)
        : await Cesium.Cesium3DTileset.fromUrl(url, tilesetOptions))

    if (!viewer.scene.primitives.contains(tileset)) viewer.scene.primitives.add(tileset)
    tilesetObj = { key, tileset, ...rest }
    this.tilesetCollection.set(key, tilesetObj)
    if (flyTo) viewer.flyTo(tileset)
    return tilesetObj
  }

  showByCondition = async (condition: Partial<TilesetObj>, flyTo?: boolean) => {
    const viewer = await ViewerHelper.getViewerPromise(undefined, this.viewer)
    const map = this.getByCondition(condition)
    let last: Cesium.Cesium3DTileset | undefined
    map.forEach(item => {
      item.tileset.show = true
      last = item.tileset
    })
    if (flyTo && last) viewer.flyTo(last)
  }

  showAll = async (flyTo?: boolean) => {
    const viewer = await ViewerHelper.getViewerPromise(undefined, this.viewer)
    let last: Cesium.Cesium3DTileset | undefined
    this.tilesetCollection.forEach(item => {
      item.tileset.show = true
      last = item.tileset
    })
    if (flyTo && last) viewer.flyTo(last)
  }

  hideByCondition = (condition: Partial<TilesetObj>) => {
    const map = this.getByCondition(condition)
    map.forEach(item => (item.tileset.show = false))
  }

  hideAll = () => {
    this.tilesetCollection.forEach(v => (v.tileset.show = false))
  }

  removeByCondition = async (condition: Partial<TilesetObj>) => {
    const viewer = await ViewerHelper.getViewerPromise(undefined, this.viewer)
    const map = this.getByCondition(condition)
    map.forEach(item => {
      viewer.scene.primitives.remove(item.tileset)
      this.tilesetCollection.delete(item.key)
    })
  }

  removeAll = async () => {
    const viewer = await ViewerHelper.getViewerPromise(undefined, this.viewer)
    this.tilesetCollection.forEach(item => viewer.scene.primitives.remove(item.tileset))
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
