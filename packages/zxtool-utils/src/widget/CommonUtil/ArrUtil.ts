import { IKey } from "../../type"

/** 求差集 第一个减去第二个 */
export const subSet = <T = IKey>(arr1: T[], arr2: T[]): T[] => {
  const set1 = new Set(arr1)
  const set2 = new Set(arr2)
  const result: T[] = []

  set1.forEach(item => {
    if (!set2.has(item)) result.push(item)
  })

  return result
}

export const union = <T = IKey>(arr1: T[], arr2: T[]) => {
  const set1 = new Set(arr1)
  const set2 = new Set(arr2)
  const result: T[] = []

  set1.forEach(item => {
    if (set2.has(item)) result.push(item)
  })

  return result
}

export function mapOrSetFilter<T>(target: Set<T>, cb: (v: T) => boolean): Set<T>
export function mapOrSetFilter<T, K>(target: Map<K, T>, cb: (v: T) => boolean): Map<K, T>
export function mapOrSetFilter<T, K>(target: Map<K, T> | Set<T>, cb: (v: T) => boolean) {
  if (target instanceof Map) {
    const map = new Map()
    for (const [key, value] of target) cb(value) && map.set(key, value)
    return map
  }
  const set = new Set()
  for (const item of target) cb(item) && set.add(item)
  return set
}

export const padArray = (arr: unknown[], len: number, val: unknown) => {
  if (arr.length >= len) return arr
  const deltaLen = len - arr.length
  for (let i = 0; i < deltaLen; i++) {
    arr.push(val)
  }
  return arr
}
