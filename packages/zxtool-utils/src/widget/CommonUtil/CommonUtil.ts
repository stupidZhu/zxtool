import { isNil } from "lodash"
import { IObj, Num2 } from "../../type"
import * as ArrUtil from "./ArrUtil"
import * as DecoratorsUtil from "./DecoratorsUtil"
import * as NumUtil from "./NumUtil"
import * as ObjUtil from "./ObjUtil"
import * as StrUtil from "./StrUtil"
import { hashCacheKey } from "./StrUtil"
import * as TreeUtil from "./TreeUtil"

const addCacheWrapper = <T extends (...rest: any[]) => any>(func: T): T => {
  const cache: IObj = {}

  return function (...rest: any[]) {
    const key = hashCacheKey(rest)
    if (cache[key]) return cache[key]
    cache[key] = (func as unknown as Function)(...rest)
    return cache[key]
  } as T
}

const getDom = (id: string, option: { className?: string; tag?: keyof HTMLElementTagNameMap } = {}) => {
  const { className, tag = "div" } = option

  let dom = document.querySelector(`#${id}`)
  if (!dom) {
    dom = document.createElement(tag)
    dom.id = id
    document.body.appendChild(dom)
  }
  className && dom.classList.add(className)
  return dom as HTMLElement
}

// https://juejin.cn/post/7140558929750130719
const abortablePromise = <T>(promise: Promise<T>) => {
  const abortController = new AbortController()
  const { signal } = abortController

  return {
    promise: new Promise<T>((resolve, reject) => {
      signal.addEventListener("abort", () => reject(signal?.reason))
      promise.then(resolve).catch(reject)
    }),
    abortController,
  }
}

/**
 * 取默认值的工具函数
 */
interface GetValueOrDefaultProps<T> {
  value: T
  defaultValue: T
  condition?: (v: T) => boolean
}
export interface GetNumberProps {
  value: number
  defaultValue: number
  min?: number
  max?: number
  intStrategy?: "floor" | "ceil" | "round" | "trunc"
}
const getValueUtil = {
  getValueOrDefault<T>(props: GetValueOrDefaultProps<T>) {
    const { value, defaultValue, condition } = props
    if (condition) {
      return condition(value) ? value : defaultValue
    }
    return value ?? defaultValue
  },
  getNumber(props: GetNumberProps) {
    const { value, defaultValue, min, max, intStrategy } = props
    let res = value
    if (intStrategy) res = Math[intStrategy](value)
    if (Number.isNaN(res)) return defaultValue
    if ((!isNil(min) && res < min) || (!isNil(max) && res > max)) return defaultValue
    return res
  },
}

const lineFn = (P1: Num2, P2: Num2) => {
  // (y-y1)/(y2-y1) = (x-x1)/(x2-x1)
  const [x1, y1] = P1
  const [x2, y2] = P2
  const deltaX = x2 - x1
  const deltaY = y2 - y1
  const getX = (y: number) => ((y - y1) * deltaX) / deltaY + x1
  const getY = (x: number) => ((x - x1) * deltaY) / deltaX + y1
  return { getX, getY }
}

export const CommonUtil = {
  addCacheWrapper,
  abortablePromise,
  getDom,
  lineFn,
  getValueUtil,
  ...DecoratorsUtil,
  ...ArrUtil,
  ...ObjUtil,
  ...StrUtil,
  ...NumUtil,
  ...TreeUtil,
}
