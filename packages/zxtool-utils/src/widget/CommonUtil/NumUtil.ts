export const isGreaterThan = (a: number, b: number, precision = 1e-5) => {
  return a - b > precision
}

export const isGreaterThanOrEqual = (a: number, b: number, precision = 1e-5) => {
  return isGreaterThan(a, b, precision) || isEqual(a, b, precision)
}

export const isLessThan = (a: number, b: number, precision = 1e-5) => {
  return b - a > precision
}

export const isLessThanOrEqual = (a: number, b: number, precision = 1e-5) => {
  return isLessThan(a, b, precision) || isEqual(a, b, precision)
}

export const isEqual = (a: number, b: number, precision = 1e-5) => {
  return Math.abs(a - b) < precision
}

export function mix(a: number, b: number, t: number): number
export function mix(a: number[], b: number[], t: number): number[]
export function mix<T extends number | number[]>(a: T, b: T, t: number): T {
  const mixNum = (a: number, b: number, t: number) => {
    if (t <= 0) return a
    if (t >= 1) return b
    return a * (1 - t) + b * t
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) throw new Error("数组的元素数量必须相同")
    return a.map((itemA, index) => {
      const itemB = b[index]
      return mixNum(itemA, itemB, t)
    }) as T
  }
  return mixNum(a as number, b as number, t) as T
}
