import { UseDialogProps, useDialog } from "@zxtool/react-utils"
import { IPosition } from "@zxtool/react-utils/dist/hook/useDialog/util"
import React, { PropsWithChildren, useRef } from "react"
import "./index.scss"

interface Props extends UseDialogProps, PropsWithChildren {
  visible: boolean
  close: () => void
  title?: React.ReactNode
  position?: IPosition
}

export const MyDialog: React.FC<Props> = React.memo(props => {
  const { visible, close, title, position = {}, children, onMoving, onMoveEnd, onResizing, onResizeEnd, ...rest } = props
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
    <div className="use-dialog" ref={setDialogRef} style={{ ...position }}>
      <div
        className="move-field"
        ref={setMoveHandleRef}
        onClick={() => {
          if (!changingRef.current) console.log("hello")
        }}
      >
        <div className="title-wrapper">{title}</div>
        <button
          onClick={e => {
            e.stopPropagation()
            close()
          }}
        >
          x
        </button>
      </div>
      <div className="use-dialog-content">{children}</div>
      <span className="resize-desc">resize -&gt;</span>
      <span className="to-bottom-desc">&lt;- to bottom</span>
      <div
        className="resize-field"
        ref={setResizeHandleRef}
        onClick={() => {
          if (!changingRef.current) console.log("world")
        }}
      ></div>
      <div className="to-bottom-field" onClick={() => toBottom()}></div>
    </div>
  )
})

MyDialog.displayName = "MyDialog"
