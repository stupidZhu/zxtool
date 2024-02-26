import { IObj } from "@zxtool/utils"

declare module "cesium" {
  export interface Entity {
    __customField?: {
      hover?: boolean
      onClick?: (data: Entity, raw: any) => void
      onEnter?: (data: Entity, raw: any) => void
      onLeave?: (data: Entity, raw: any) => void
    } & IObj
  }
  export interface Primitive {
    __customField?: {
      hover?: boolean
      onClick?: (data: Primitive, raw: any) => void
      onEnter?: (data: Primitive, raw: any) => void
      onLeave?: (data: Primitive, raw: any) => void
    } & IObj
  }
  export interface Cesium3DTileset {
    __customField?: IObj
  }
}
