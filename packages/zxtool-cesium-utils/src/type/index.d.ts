import * as Cesium from "cesium"

export type Num2 = [number, number]
export type Num3 = [number, number, number]

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
