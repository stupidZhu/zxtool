export type IObj<T = any> = Record<string, T>
export type IKey = string | number
export type ITimer = null | NodeJS.Timeout
export type IOption<V = IKey, L = IKey> = { label: L; value: V } & IObj
export type REST<T = any> = T[]
export type LikeDom = HTMLElement | typeof window | Document
export type Fn<P = unknown[], R = unknown> = (...rest: P) => R

export type Tuple2<T> = [T, T]
export type Tuple3<T> = [T, T, T]
export type Tuple4<T> = [T, T, T, T]

export type Num2 = Tuple2<number>
export type Num3 = Tuple3<number>
export type Num4 = Tuple4<number>

export type Merge<T> = {
  [K in keyof T]: T[K]
}
export type PartialByKeys<O, K extends keyof O> = Merge<Partial<O> & Omit<O, K>>
