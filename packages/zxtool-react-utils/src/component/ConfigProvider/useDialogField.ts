import { useMemoizedFn } from "ahooks"
import { useRef } from "react"

const useDialogField = (initialZIndex: number) => {
  const zIndexRange = useRef<number[]>([initialZIndex, initialZIndex])
  const dialogKeys = useRef<Set<PropertyKey>>(new Set([]))

  const addKey = useMemoizedFn((key: PropertyKey) => {
    dialogKeys.current.add(key)
  })
  const delKey = useMemoizedFn((key: PropertyKey) => {
    dialogKeys.current.delete(key)
    if (dialogKeys.current.size === 0) {
      zIndexRange.current = [initialZIndex, initialZIndex]
    }
  })
  const getMaxZIndex = useMemoizedFn(() => {
    zIndexRange.current[1] += 1
    return String(zIndexRange.current[1])
  })
  const getMinZIndex = useMemoizedFn(() => {
    zIndexRange.current[0] -= 1
    return String(zIndexRange.current[0])
  })

  return {
    addKey,
    delKey,
    getMaxZIndex,
    getMinZIndex,
  }
}

export default useDialogField
