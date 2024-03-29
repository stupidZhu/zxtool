import { CommonUtil } from "@zxtool/utils"
import { useMemoizedFn } from "ahooks"
import { DependencyList, useEffect, useRef, useState } from "react"
// TODO: 好像有 bug，暂时不知道原因和解决办法

export type AsyncMemoStatus = "idle" | "error" | "loading" | "success"

export interface UseAsyncMemoOptions<T> {
  /** 初始值，不填初始为 undefined */
  defaultValue?: T
  /** 失败后重试的次数 */
  reFetchTimes?: number
  /** 失败后每次重试的间隔 (ms,默认 100ms) */
  reFetchDelay?: number
}

export function useAsyncMemo<T>(
  factory: () => Promise<T>,
  deps: DependencyList | undefined,
  options: UseAsyncMemoOptions<T> & { defaultValue: T },
): { value: T; status: AsyncMemoStatus }
export function useAsyncMemo<T>(
  factory: () => Promise<T>,
  deps: DependencyList | undefined,
  options?: UseAsyncMemoOptions<T>,
): { value: T | undefined; status: AsyncMemoStatus }
export function useAsyncMemo<T>(
  factory: () => Promise<T>,
  deps: DependencyList | undefined,
  options?: UseAsyncMemoOptions<T>,
) {
  // eslint-disable-next-line prefer-const
  let { defaultValue, reFetchTimes, reFetchDelay } = options ?? {}
  if (reFetchTimes && reFetchTimes < 0) reFetchTimes = 0
  if (reFetchDelay && reFetchDelay < 0) reFetchDelay = 0

  const [value, onChange] = useState<T | undefined>(() => defaultValue)
  const [status, setStatus] = useState<AsyncMemoStatus>("idle")
  const times = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const tryFetch = useMemoizedFn(() => {
    const { promise, abortController } = CommonUtil.abortablePromise(factory())
    abortRef.current = abortController
    setStatus("loading")

    promise
      .then(res => {
        times.current = 0
        setStatus("success")
        onChange(() => res)
      })
      .catch(err => {
        if (err._type !== "abort") {
          if (reFetchTimes && times.current < reFetchTimes) {
            times.current += 1
            setTimeout(tryFetch, reFetchDelay)
          } else {
            setStatus("error")
            times.current = 0
          }
          return Promise.reject(err)
        } else times.current = 0
      })

    return () => abortController
  })

  useEffect(() => {
    tryFetch()
    return () => {
      abortRef.current?.abort({ _type: "abort" })
    }
  }, deps)

  return { value, status }
}
