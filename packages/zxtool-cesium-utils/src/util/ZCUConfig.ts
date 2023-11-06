import * as Cesium from "cesium"
import { merge } from "lodash"

export interface ZCUConfigType {
  CESIUM_TOKEN?: string
  viewerOptions?: Cesium.Viewer.ConstructorOptions & { hideWidget?: boolean; fxaa?: boolean }
  homeView?: Parameters<Cesium.Camera["flyTo"]>[0]
  tilesetConfig?: Omit<ConstructorParameters<typeof Cesium.Cesium3DTileset>[0], "url">
}

class ZCUC {
  private config: ZCUConfigType = {}

  setConfig(c: ZCUConfigType) {
    merge(this.config, c)
  }

  getConfig<K extends keyof ZCUConfigType>(key: K, strict?: true): NonNullable<ZCUConfigType[K]>
  getConfig<K extends keyof ZCUConfigType>(key: K, strict?: false): ZCUConfigType[K]
  getConfig<K extends keyof ZCUConfigType>(key: K, strict = true) {
    if (!(key in this.config)) {
      const errInfo = `[@zxtool/cesium-utils]: ZCUConfig.getConfig 失败，请检查是否正确设置了 ZCUConfig 的 ${key}`
      if (strict) throw new Error(errInfo)
      else console.warn(errInfo)
    }
    return this.config[key]
  }
}

export const ZCUConfig = new ZCUC()
