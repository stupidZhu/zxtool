import { IObj } from "@zxtool/utils"

declare module "three" {
  export interface Object3D {
    __customField: {
      onClick?: (data: Object3D["__customField"], e: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>) => void
      onEnter?: (data: Object3D["__customField"], e: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>) => void
      onLeave?: (data: Object3D["__customField"], e: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>) => void
    } & IObj
  }
}
