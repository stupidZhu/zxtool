import { Num2, Num3 } from "@zxtool/utils"
import * as Cesium from "cesium"

export type LonLat = Num2
export type LonLatKey = { key: PropertyKey; lonLat: LonLat }
export type LonLatObj = {
  lon: number
  lat: number
}
export type LonLatHeight = Num3
export type LonLatHeightObj = {
  lon: number
  lat: number
  height: number
}
export type LonLatType = "degree" | "radian"

export interface RECT {
  minx: number
  maxx: number
  miny: number
  maxy: number
}

export type IEntity = Cesium.Entity & {
  __custom__?: any
  [index: string]: any
}
