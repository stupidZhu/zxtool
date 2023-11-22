import { UseDialogProps, useDialog } from "@zxtool/react-utils"
import { IPosition } from "@zxtool/react-utils/dist/hook/useDialog/util"
import React, { PropsWithChildren, useRef } from "react"
import "./index.scss"

interface Props extends UseDialogProps, PropsWithChildren {
  close: () => void
  position?: IPosition
}

export const MyDialog: React.FC<Props> = props => {
  const { close, position = { left: 0, top: 0 }, children, onMoving, onMoveEnd, onResizing, onResizeEnd, ...rest } = props
  const changingRef = useRef(false)

  const { setRef } = useDialog({
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

  return (
    <div className="use-dialog " ref={node => setRef(node, "dialog")} style={{ ...position }}>
      <div
        className="move-field"
        ref={node => setRef(node, "moveHandler")}
        onClick={() => {
          if (!changingRef.current) console.log("hello")
        }}
      >
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
      <span className="desc">鼠标移动到此处 resize -&gt;</span>
      <div
        className="resize-field"
        ref={node => setRef(node, "resizeHandler")}
        onClick={() => {
          if (!changingRef.current) console.log("world")
        }}
      ></div>
    </div>
  )
}
