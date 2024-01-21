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
    thisArg?: unknown,
  ): void
}

export type AnimationWithState<T extends IObj = { throttleTime?: number; enable?: boolean }> = {
  fn(props: { time: number; delta: number; state: T }): void
  state?: T
}
export type FunctionWithState<T extends IObj = { enable?: boolean }> = {
  fn(props: { state: T }): void
  state?: T
}

export interface ThreeHelperPluginProps {
  emitter: EmitterHelper
  widgetCollection: Map<PropertyKey, any>
  threeHelper: ThreeHelper
}
export interface ThreeHelperPlugin<AO extends IObj = {}, RO extends IObj = {}> {
  add(props: ThreeHelperPluginProps, options?: AO): ThreeHelperPlugin<AO>
  remove(options?: RO): void
}

export * from "./AnimationPlugin"
export * from "./CSS2DRendererPlugin"
export * from "./CSS3DRendererPlugin"
export * from "./DevPlugin"
export * from "./EffectComposerPlugin"
export * from "./MouseEventPlugin"
export * from "./OCameraPlugin"
export * from "./OControlsPlugin"
export * from "./PCameraPlugin"
export * from "./RendererPlugin"
export * from "./ResizePlugin"
export * from "./ScenePlugin"
export * from "./SyncCesiumPlugin"
