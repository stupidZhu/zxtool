import { MapList } from "@zxtool/utils"
import * as Cesium from "cesium"
import { last } from "lodash"
import { ZCUConfig, ZCUConfigType } from "../util/ZCUConfig"
import ViewerHelper from "./ViewerHelper"

export type TilesetObj = {
  key: PropertyKey
  tileset: Cesium.Cesium3DTileset
  viewer: Cesium.Viewer
} & Record<string, any>

export interface AddTilesetProps extends Partial<TilesetObj> {
  url: Cesium.Resource | string | number
  flyTo?: boolean
  tilesetOptions?: ZCUConfigType["tilesetOptions"]
}

class _TilesetManager {
  readonly mapList = new MapList<TilesetObj>()

  /**
   * @param props 如果 url 是数值则代表 Cesium.IonAssetId; url 和 tileset 传入一个即可, tileset 优先级更高
   */
  add = async (props: AddTilesetProps) => {
    const {
      url,
      key = Symbol(),
      flyTo = true,
      viewer: _viewer,
      tileset: _tileset,
      tilesetOptions = ZCUConfig.getConfig("tilesetOptions", false) ?? {},
      ...rest
    } = props
    const viewer = await ViewerHelper.getViewerPromise(_viewer)

    let tilesetObj = this.mapList.get(key)
    if (tilesetObj?.tileset && tilesetObj.tileset === _tileset) {
      if (flyTo) viewer!.flyTo(tilesetObj.tileset)
      console.error(`[TilesetManager] 当前 key(${key.toString()}) 已经存在，新增 tileset 失败`)
      return tilesetObj
    }

    const tileset =
      _tileset ??
      (typeof url === "number"
        ? await Cesium.Cesium3DTileset.fromIonAssetId(url, tilesetOptions)
        : await Cesium.Cesium3DTileset.fromUrl(url, tilesetOptions))

    if (!viewer.scene.primitives.contains(tileset)) viewer.scene.primitives.add(tileset)
    tilesetObj = { key, tileset, viewer, ...rest }
    this.mapList.set(key, tilesetObj)
    if (flyTo) viewer!.flyTo(tileset)
    return tilesetObj
  }

  showByCondition = (condition: Partial<TilesetObj>, flyTo?: boolean) => {
    const list = this.getListByCondition(condition)
    list.forEach(item => (item.tileset.show = true))
    const lastOne = last(list)
    if (flyTo && lastOne) lastOne.viewer.flyTo(lastOne.tileset)
  }

  showAll = (flyTo?: boolean) => {
    let last: TilesetObj | undefined
    this.mapList.list.forEach(v => {
      v.tileset.show = true
      last = v
    })
    if (flyTo && last) last.viewer.flyTo(last.tileset)
  }

  hideByCondition = (condition: Partial<TilesetObj>) => {
    const list = this.getListByCondition(condition)
    list.forEach(item => (item.tileset.show = false))
  }

  hideAll = () => {
    this.mapList.list.forEach(v => (v.tileset.show = false))
  }

  removeByCondition = (condition: Partial<TilesetObj>) => {
    const list = this.getListByCondition(condition)
    list.forEach(item => {
      item.viewer.scene.primitives.remove(item.tileset)
      this.mapList.delete(item.key)
    })
  }

  removeAll = () => {
    this.mapList.list.forEach(item => item.viewer.scene.primitives.remove(item.tileset))
    this.mapList.clear()
  }

  getListByCondition = (props: Partial<TilesetObj>) => {
    return this.mapList.list.filter(item => {
      return Object.entries(props).every(([k, v]) => {
        return item[k] === v
      })
    })
  }
}

export const TilesetManager = new _TilesetManager()
