import { cloneDeep, isPlainObject, merge } from "lodash"
import { IKey, IObj, IOption } from "../../type"

export interface ClearEmptyValOption<T> {
  /** 是否移除空字符串 */
  clearEmptyStr?: boolean
  /** 如果是字符串是否调用 trim 移除空格 */
  clearSpace?: boolean
  /** 返回：true - 该字段保留；false - 该字段移除 */
  customCb?: <K extends keyof T>(k: K, v: T[K]) => boolean
}
export const clearEmptyVal = <T extends {} = IObj>(obj: T, option: ClearEmptyValOption<T> = {}) => {
  const { clearEmptyStr = true, clearSpace = true, customCb } = option
  if (!isPlainObject(obj)) return obj
  const newObj = cloneDeep(obj)

  const condition = (k: string, v: unknown) => {
    if (v === undefined || v === null || v === "$$") return false
    if (clearEmptyStr && v === "") return false
    if (customCb) return customCb(k as any, v)
    return true
  }

  Object.entries(newObj).forEach(([k, v]) => {
    if (clearSpace && typeof v === "string") newObj[k] = v.trim()
    if (!condition(k, newObj[k])) Reflect.deleteProperty(newObj, k)
  })

  return newObj
}

export const arr2options = <T extends IKey>(arr: T[]): Array<IOption<T, T>> => {
  return arr.map(item => ({ label: item, value: item }))
}

export const enum2options = (e: Record<IKey, IKey>): Array<IOption<IKey, string>> => {
  const keys = Object.keys(e).filter(item => Number.isNaN(+item))
  return keys.map(item => ({ value: e[item], label: item }))
}

export const genMap = <T extends IObj>(map: T) => {
  return new Proxy(map, {
    get(target, prop: string) {
      if (!prop) return
      return target[prop] ?? prop
    },
  })
}

export const genSetRefObjFunc = <T extends IObj>(obj: { current: T }) => {
  return (val: Partial<T> | ((v: T) => T)) => {
    if (typeof val === "function") obj.current = val(obj.current)
    else obj.current = merge(obj.current, val)
  }
}

export const genSetObjFunc = <T extends IObj>(obj: T) => {
  return (val: Partial<T> | ((v: T) => void)) => {
    if (typeof val === "function") val(obj)
    else merge(obj, val)
  }
}
