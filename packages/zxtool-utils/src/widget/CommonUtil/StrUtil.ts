import { isPlainObject } from "lodash"

// https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
export const hashStr = (str: string, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

export const hashCacheKey = (cacheKey: any[]): string => {
  return JSON.stringify(cacheKey, (_, val) =>
    isPlainObject(val)
      ? Object.keys(val)
          .sort()
          .reduce((result, key) => {
            result[key] = val[key]
            return result
          }, {} as any)
      : val,
  )
}

export const parseJson = <T = any>(json: string, preventLog = false): T | null => {
  let res: T | null = null
  if (!json) return res
  try {
    res = JSON.parse(json)
  } catch (e) {
    !preventLog && console.error(e)
  }
  return res
}

export const removeStr = (str: string, config: { removeStart?: string; removeEnd?: string }) => {
  const { removeStart, removeEnd } = config
  if (!removeStart && !removeEnd) return str
  const regStrList = []
  removeStart && regStrList.push(`^(${removeStart})+`)
  removeEnd && regStrList.push(`(${removeEnd})+$`)
  const reg = new RegExp(regStrList.join("|"), "g")
  return str.replace(reg, "")
}
