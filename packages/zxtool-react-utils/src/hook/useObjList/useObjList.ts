import { useMemoizedFn } from "ahooks"
import { isNil, merge } from "lodash"
import { useState } from "react"

export const useObjList = <T extends object>(initialState?: T[] | (() => T[])) => {
  const [list, setList] = useState<T[]>(initialState ?? [])

  const add = useMemoizedFn((props: { value: T; addType: "push" | "unshift" | number }) => {
    const { value, addType } = props
    if (addType === "push") setList(l => [...l, value])
    else if (addType === "unshift") setList(l => [value, ...l])
    else setList(l => [...l.splice(addType, 0, value)])
  })

  const del = useMemoizedFn((props: { index?: number; condition?: (item: T) => boolean }) => {
    const { index, condition } = props
    if (!isNil(index)) {
      setList(l => {
        l.splice(index, 1)
        return [...l]
      })
    } else if (!isNil(condition)) setList(l => l.filter(condition))
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
