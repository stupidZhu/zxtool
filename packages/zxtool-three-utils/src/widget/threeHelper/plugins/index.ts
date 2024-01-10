import { EmitterHelper, IObj } from "@zxtool/utils"
import type { ThreeHelper } from "../ThreeHelper"

// type RemoveLastParam<T extends any[]> = T extends [...infer Params, any] ? Params : never
// export interface StateCbCollection<K, V extends FunctionWithState> extends Omit<Map<K, V>, "get" | "set"> {
//   get<S = never>(
//     key: K,
//   ): [S] extends [never] ? V : { state?: S; fn: (...args: [...RemoveLastParam<Parameters<V["fn"]>>, S]) => void } | undefined
//   set<S = never>(
//     key: K,
//     value: [S] extends [never] ? V : { state?: S; fn: (...args: [...RemoveLastParam<Parameters<V["fn"]>>, S]) => void },
//   ): this
// }

export type StateCbCollectionV<V extends FunctionWithState, S extends IObj> = [S] extends [never]
  ? V
  : {
      state?: S & Parameters<V["fn"]>[0]["state"]
      fn: (props: Parameters<V["fn"]>[0] & { state: S & Parameters<V["fn"]>[0]["state"] }) => void
    }
export interface StateCbCollection<K, V extends FunctionWithState> extends Omit<Map<K, V>, "get" | "set" | "forEach"> {
  get<S extends IObj = never>(key: K): StateCbCollectionV<V, S> | undefined
  set<S extends IObj = never>(key: K, value: StateCbCollectionV<V, S>): this
  forEach<S extends IObj = never>(
    callbackfn: (value: StateCbCollectionV<V, S>, key: K, map: Map<K, StateCbCollectionV<V, S>>) => void,
    thisArg?: any,
  ): void
}

export type AnimationWithState<T extends IObj = { throttleTime?: number }> = {
  fn(props: { time: number; delta: number; state: T }): void
  state?: T
}
export type ClickWithState<T extends IObj = { objs?: THREE.Object3D[] }> = {
  fn(props: { objs: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[]; e: MouseEvent; state: T }): void
  state?: T
}
export type FunctionWithState<T extends IObj = IObj> = {
  fn(props: { state: T }): void
  state?: T
}

export interface ThreeHelperPluginProps {
  KEY: PropertyKey
  emitter: EmitterHelper
  initializedCache: Map<PropertyKey, boolean>
  clearCollection: StateCbCollection<PropertyKey, FunctionWithState>
  widgetCollection: Map<PropertyKey, any>
  threeHelper: ThreeHelper
}
export interface ThreeHelperPlugin {
  add(props: ThreeHelperPluginProps): void
  remove(props: ThreeHelperPluginProps): void
}

export * from "./ClickPlugin"
export * from "./DevPlugin"
export * from "./EffectComposerPlugin"
export * from "./OrbitControlsPlugin"
export * from "./SyncCesiumPlugin"
