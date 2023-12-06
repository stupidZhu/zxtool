export type IObj<T = any> = Record<string, T>
export type IKey = string | number
export type ITimer = null | NodeJS.Timeout
export type IOption<V = IKey, L = IKey> = { label: L; value: V } & IObj
export type REST<T = any> = T[]

export type Merge<T> = {
  [K in keyof T]: T[K]
}
export type PartialByKeys<O, K extends keyof O> = Merge<Partial<O> & Omit<O, K>>

// interface RejectedPromise<E> {
//   reject(reason: E): void
// }

// declare module "PromiseConstructor" {
//   interface PromiseConstructor {
//     reject<E = any>(reason?: E): Promise<T>
//   }
// }

interface Promise<T, E> extends Promise<T> {
  reject<E = any>(reason?: E): Promise<T>
}

export as namespace ZU
