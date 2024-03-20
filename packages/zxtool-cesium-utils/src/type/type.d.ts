import { IObj } from "@zxtool/utils"

declare module "cesium" {
  export interface Entity {
    __customField?: {
      hover?: boolean
      onClick?: (data: Entity, raw: any, position: Cartesian2) => void
      onEnter?: (data: Entity, raw: any, position: Cartesian2) => void
      onLeave?: (data: Entity, raw: any, position: Cartesian2) => void
    } & IObj
  }
  export interface Primitive {
    __customField?: {
      hover?: boolean
      onClick?: (data: Primitive, raw: any, position: Cartesian2) => void
      onEnter?: (data: Primitive, raw: any, position: Cartesian2) => void
      onLeave?: (data: Primitive, raw: any, position: Cartesian2) => void
    } & IObj
  }
  export interface Cesium3DTileset {
    __customField?: IObj
  }
}
