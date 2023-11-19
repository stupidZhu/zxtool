import { IKey, IObj } from "@zxtool/utils/dist/type"
import * as Cesium from "cesium"
import { last } from "lodash"
import { ZCUConfig, ZCUConfigType } from "../util/ZCUConfig"
import ViewerHelper from "./ViewerHelper"

export type TilesetObj = {
  key: IKey
  tileset: Cesium.Cesium3DTileset
  viewer: Cesium.Viewer
  group?: IKey
}

export type TilesetFilterCondition = Partial<Omit<TilesetObj, "tileset">>

export interface AddTilesetProps {
  url: string | Cesium.Resource | Promise<Cesium.Resource> | Promise<string>
  key: IKey
  flyTo?: boolean
  viewer?: Cesium.Viewer
  group?: IKey
  tilesetConfig?: ZCUConfigType["tilesetConfig"]
}

class TilesetHelper {
  tilesetMap: IObj<TilesetObj> = {}

  /**
   *
   * @param props key 必传且必须全局唯一，group 可以不传
   * @returns
   */
  add = async (props: AddTilesetProps) => {
    const {
      url,
      key,
      flyTo = true,
      viewer: _viewer,
      group,
      tilesetConfig = ZCUConfig.getConfig("tilesetConfig", false) ?? null,
    } = props
    const viewer = await ViewerHelper.getViewerPromise(_viewer)

    if (this.tilesetMap[key]?.tileset) {
      if (flyTo) viewer!.flyTo(this.tilesetMap[key].tileset)
      console.error(`[TilesetHelper] 当前 key(${key}) 已经存在，新增 tileset 失败`)
      return this.tilesetMap[key]
    }

    return new Cesium.Cesium3DTileset({ url, ...tilesetConfig }).readyPromise.then(tileset => {
      viewer.scene.primitives.add(tileset)
      this.tilesetMap[key] = { key, tileset, viewer, group }
      if (flyTo) viewer!.flyTo(this.tilesetMap[key].tileset)
      return this.tilesetMap[key]
    })
  }

  showByCondition = (condition: TilesetFilterCondition, flyTo?: boolean) => {
    const list = this.getTilesetObjListByCondition(condition)
    list.forEach(item => (item.tileset.show = true))
    const lastOne = last(list)
    if (flyTo && lastOne) lastOne.viewer.flyTo(lastOne.tileset)
    return list
  }

  showAll = (flyTo?: boolean) => {
    const list = Object.values(this.tilesetMap)
    list.forEach(item => (item.tileset.show = true))
    const lastOne = last(list)
    if (flyTo && lastOne) lastOne.viewer.flyTo(lastOne.tileset)
    return list
  }

  hideByCondition = (condition: TilesetFilterCondition) => {
    const list = this.getTilesetObjListByCondition(condition)
    list.forEach(item => (item.tileset.show = false))
    return list
  }

  hideAll = () => {
    const list = Object.values(this.tilesetMap)
    list.forEach(item => (item.tileset.show = false))
    return list
  }

  removeByCondition = (condition: TilesetFilterCondition) => {
    const list = this.getTilesetObjListByCondition(condition)
    list.forEach(item => {
      item.viewer.scene.primitives.remove(item.tileset)
      Reflect.deleteProperty(this.tilesetMap, item.key)
    })
  }

  removeAll = () => {
    Object.values(this.tilesetMap).forEach(item => item.viewer.scene.primitives.remove(item.tileset))
    this.tilesetMap = {}
  }

  getTilesetObjListByCondition = (props: Partial<Omit<TilesetObj, "tileset">>) => {
    const { key, group, viewer } = props
    return Object.values(this.tilesetMap).filter(item => {
      if (key && item.key !== key) return false
      if (group && item.group !== group) return false
      if (viewer && item.viewer !== viewer) return false
      return true
    })
  }
}

export default new TilesetHelper()
