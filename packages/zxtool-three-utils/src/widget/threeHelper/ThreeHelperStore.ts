import { EmitterHelper } from "@zxtool/utils"

export type AnimationItem = (time: number, delta: number) => void
export type ClickCb = (objs: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[], e: MouseEvent) => void
export type ClickItem = { fn: ClickCb; objs?: THREE.Object3D[] }

export class ThreeHelperStore {
  readonly time = { value: 0 }
  readonly emitter = new EmitterHelper({ maxCount: { history: 1 } })
  readonly animationCollection: Map<PropertyKey, AnimationItem> = new Map()
  readonly clickCollection: Map<PropertyKey, ClickItem> = new Map()
  readonly resizeCollection: Map<PropertyKey, Function> = new Map()
  readonly clearCollection: Map<PropertyKey, Function> = new Map()
  readonly initializedCache: Map<PropertyKey, boolean> = new Map()
  readonly widgetCollection: Map<PropertyKey, any> = new Map()
}
