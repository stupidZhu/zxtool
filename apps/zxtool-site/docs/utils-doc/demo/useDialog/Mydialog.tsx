import { UseDialogProps, useDialog } from "@zxtool/react-utils"
import { IPosition } from "@zxtool/react-utils/dist/hook/useDialog/util"
import React, { PropsWithChildren, useRef } from "react"
import "./index.scss"

const joinCls = (...rest: string[]) => ["ud-comp", ...rest].join("-")

interface Props extends UseDialogProps, PropsWithChildren {
  visible: boolean
  close: () => void
  title?: React.ReactNode
  position?: IPosition
  mask?: boolean
}

export const MyDialog: React.FC<Props> = props => {
  const {
    visible,
    close,
    title,
    position = {},
    mask,
    children,
    onMoving,
    onMoveEnd,
    onResizing,
    onResizeEnd,
    ...rest
  } = props
  const changingRef = useRef(false)

  const { setDialogRef, setMoveHandleRef, setResizeHandleRef, toBottom } = useDialog({
    onMoving(...rest) {
      changingRef.current = true
      onMoving?.(...rest)
    },
    onMoveEnd(...rest) {
      setTimeout(() => (changingRef.current = false))
      onMoveEnd?.(...rest)
    },
    onResizing(...rest) {
      changingRef.current = true
      onResizing?.(...rest)
    },
    onResizeEnd(...rest) {
      setTimeout(() => (changingRef.current = false))
      onResizeEnd?.(...rest)
    },
    ...rest,
  })

  if (!visible) return null

  return (
    <div className="use-dialog-comp" ref={setDialogRef} style={{ ...position }}>
      <div className={joinCls("dialog-wrapper")}>
        <div
          className={joinCls("move-field")}
          ref={setMoveHandleRef}
          onClick={() => {
            if (!changingRef.current) console.log("hello")
          }}
        >
          <div className={joinCls("title")}>{title}</div>
          <button
            className={joinCls("close-btn")}
            onClick={e => {
              e.stopPropagation()
              close()
            }}
          >
            x
          </button>
        </div>
        <div className={joinCls("content")}>{children}</div>
        <span className={joinCls("resize-desc")}>resize -&gt;</span>
        <span className={joinCls("to-bottom-desc")}>&lt;- to bottom</span>
        <div
          className={joinCls("resize-field")}
          ref={setResizeHandleRef}
          onClick={() => {
            if (!changingRef.current) console.log("world")
          }}
        ></div>
        <div className={joinCls("to-bottom-field")} onClick={() => toBottom()}></div>
      </div>
      {mask && <div className={joinCls("mask")} onClick={() => close()}></div>}
    </div>
  )
}
