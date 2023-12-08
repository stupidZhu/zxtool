import { useMemoizedFn } from "ahooks"
import { isNil, merge } from "lodash"
import { useState } from "react"

export const useSetObjList = <T extends object>(initialState?: T[] | (() => T[])) => {
  const [list, setList] = useState<T[]>(initialState ?? [])

  const add = useMemoizedFn((props: { item: T; addType: "push" | "unShift" | number }) => {
    const { item, addType } = props
    if (addType === "push") setList(l => [...l, item])
    else if (addType === "unShift") setList(l => [item, ...l])
    else setList(l => [...l.splice(addType, 0, item)])
  })

  const del = useMemoizedFn((props: { index?: number; condition?: (item: T) => boolean }) => {
    const { index, condition } = props
    if (!isNil(index)) setList(l => [...l.splice(index, 1)])
    else if (!isNil(condition)) setList(l => l.filter(condition))
  })

  const edit = useMemoizedFn(
    (props: { index?: number; condition?: (item: T) => boolean; value: Partial<T> | ((v: T) => T) }) => {
      const { index: i, condition, value } = props
      let index = -1

      if (!isNil(i)) index = i
      else if (!isNil(condition)) index = list.findIndex(condition)

      if (isNil(index) || index === -1) return

      if (typeof value === "function") {
        setList(l => {
          l[index] = value(l[index])
          return [...l]
        })
      } else {
        setList(l => {
          merge(l[index], value)
          return [...l]
        })
      }
    },
  )

  return { list, setList, add, del, edit }
}
