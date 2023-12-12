import { EmitterHelper } from "@zxtool/utils"
import type { ThreeHelper } from "../ThreeHelper"

export type AnimationItem = (time: number, delta: number) => void
export type ClickCb = (objs: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[], e: MouseEvent) => void
export type ClickItem = { fn: ClickCb; objs?: THREE.Object3D[] }

export interface ThreeHelperPluginProps {
  KEY: PropertyKey
  emitter: EmitterHelper
  initializedCache: Map<PropertyKey, boolean>
  clearCollection: Map<PropertyKey, Function>
  widgetCollection: Map<PropertyKey, any>
  ThreeHelper: ThreeHelper
}
export interface ThreeHelperPlugin {
  add(props: ThreeHelperPluginProps): void
  remove(props: ThreeHelperPluginProps): void
}

export { default as ClickPlugin } from "./ClickPlugin"
export { default as DevPlugin } from "./DevPlugin"
export { default as OrbitControlsPlugin } from "./OrbitControlsPlugin"
export { default as SyncCesiumPlugin } from "./SyncCesiumPlugin"
