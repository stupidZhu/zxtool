import { IObj } from "@zxtool/utils/dist/type"
import { useMemoizedFn } from "ahooks"
import { merge as _merge } from "lodash"
import { useState } from "react"

export const useStoreState = <T extends IObj = IObj>(value: T) => {
  const [state, _setState] = useState(value)

  const setState = useMemoizedFn((val: Partial<T> | ((v: T) => T), merge?: boolean) => {
    if (typeof val === "function") _setState(val)
    else {
      if (merge) _setState(v => ({ ..._merge(v, val) }))
      else _setState(v => ({ ...v, ...val }))
    }
  })

  return [state, setState] as const
}
