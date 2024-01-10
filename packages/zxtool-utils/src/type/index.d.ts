export type IObj<T = any> = Record<string, T>
export type IKey = string | number
export type ITimer = null | NodeJS.Timeout
export type IOption<V = IKey, L = IKey> = { label: L; value: V } & IObj
export type REST<T = any> = T[]
export type LikeDom = HTMLElement | typeof window | Document

export type Num2 = [number, number]
export type Num3 = [number, number, number]

export type Merge<T> = {
  [K in keyof T]: T[K]
}
export type PartialByKeys<O, K extends keyof O> = Merge<Partial<O> & Omit<O, K>>
