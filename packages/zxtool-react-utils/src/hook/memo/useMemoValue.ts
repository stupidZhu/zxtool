import { isEqual } from "lodash"
import { useRef } from "react"

export const useMemoValue = <T = any>(value: T) => {
  const ref = useRef(value)
  if (!isEqual(value, ref.current)) ref.current = value
  return ref.current
}
