import { useMemoizedFn } from "ahooks"
import { nanoid } from "nanoid"
import { useEffect, useRef } from "react"
import { useConfigContext } from "../../component/ConfigProvider/ConfigProvider"
import { getCurrent } from "../../util"
import { useWatchRefEffect } from "../effect/useWatchEffect"
import { DialogMoveCb, DialogResizeCb, ISize, moveFunc, resizeFunc } from "./util"
export type { DialogMoveCb, DialogResizeCb, ISize } from "./util"
export interface UseDialogProps {
  minSize?: ISize
  confine?: boolean
  onMoveStart?: DialogMoveCb
  onMoving?: DialogMoveCb
  onMoveEnd?: DialogMoveCb
  onResizeStart?: DialogResizeCb
  onResizing?: DialogResizeCb
  onResizeEnd?: DialogResizeCb
}

const useDialog = (props: UseDialogProps) => {
  const {
    minSize = { width: 200, height: 150 },
    confine = true,
    onMoveStart,
    onMoving,
    onMoveEnd,
    onResizeStart,
    onResizing,
    onResizeEnd,
  } = props
  const { width: minWidth, height: minHeight } = minSize
  const { dialogField } = useConfigContext() ?? {}
  const { getMaxZIndex, addKey, delKey } = dialogField ?? {}

  const uniqueKey = useRef(nanoid())
  const moveHandlerRef = useRef<HTMLElement | null>()
  const resizeHandlerRef = useRef<HTMLElement | null>()
  const dialogRef = useRef<HTMLElement | null>(null)
  const setRef = useMemoizedFn((node: HTMLElement | null, type: "dialog" | "moveHandler" | "resizeHandler") => {
    if (type === "dialog") dialogRef.current = node
    else if (type === "moveHandler") moveHandlerRef.current = node
    else resizeHandlerRef.current = node

    const dialog = getCurrent(dialogRef)
    if (dialog) dialog.style.zIndex = getMaxZIndex?.() ?? "1000"
  })

  const getDialogInfo = useMemoizedFn(() => getCurrent(dialogRef)?.getBoundingClientRect())
  const setDialogInfo = useMemoizedFn((props: { top?: string; left?: string; width?: string; height?: string }) => {
    const dialog = getCurrent(dialogRef)
    if (!dialog) return
    Object.entries(props).forEach(([k, v]) => (dialog.style[k] = v))
  })

  const onMove = useMemoizedFn((e: PointerEvent) => {
    const dialog = getCurrent(dialogRef)
    if (!dialog) return
    dialog.style.zIndex = getMaxZIndex?.() ?? "1000"

    moveFunc(e, {
      dialog,
      confine,
      afterPointerdown(position, pointerPosition) {
        onMoveStart?.({ position, pointerPosition })
      },
      afterPointermove(position, pointerPosition) {
        onMoving?.({ position, pointerPosition })
      },
      afterPointerup(position, pointerPosition) {
        onMoveEnd?.({ position, pointerPosition })
      },
    })
  })

  const onResize = useMemoizedFn((e: PointerEvent) => {
    const dialog = getCurrent(dialogRef)
    if (!dialog) return
    dialog.style.zIndex = getMaxZIndex?.() ?? "1000"

    resizeFunc(e, {
      dialog,
      minWidth,
      minHeight,
      afterPointerdown(size, pointerPosition) {
        onResizeStart?.({ size, pointerPosition })
      },
      afterPointermove(size, pointerPosition) {
        onResizing?.({ size, pointerPosition })
      },
      afterPointerup(size, pointerPosition) {
        onResizeEnd?.({ size, pointerPosition })
      },
    })
  })

  useWatchRefEffect(
    (el, prevEl) => {
      if (el) {
        el.style.touchAction = "none"
        el.addEventListener("pointerdown", onMove)
      }
      prevEl?.removeEventListener("pointerdown", onMove)
    },
    moveHandlerRef,
    true,
  )

  useWatchRefEffect(
    (el, prevEl) => {
      if (el) {
        el.style.touchAction = "none"
        el.addEventListener("pointerdown", onResize)
      }
      prevEl?.removeEventListener("pointerdown", onResize)
    },
    resizeHandlerRef,
    true,
  )

  useEffect(() => {
    const key = uniqueKey.current
    addKey?.(key)
    return () => delKey?.(key)
  }, [])

  return { setRef, getDialogInfo, setDialogInfo }
}

export default useDialog
