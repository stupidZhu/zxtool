import { useDialog } from "@zxtool/react-utils"
import { CommonUtil } from "@zxtool/utils"
import { useBoolean } from "ahooks"
import React, { PropsWithChildren, useRef } from "react"
import ReactDOM from "react-dom"
import { SettingSvg } from "../../svgs"

const joinCls = (...rest: string[]) => ["rc-dp", ...rest].join("-")

export const DevPanel: React.FC<PropsWithChildren> = ({ children }) => {
  const changingRef = useRef(false)

  const { setDialogRef, setMoveHandleRef, toBottom } = useDialog({
    onMoving() {
      changingRef.current = true
    },
    onMoveEnd() {
      setTimeout(() => (changingRef.current = false))
    },
    onResizing() {
      changingRef.current = true
    },
    onResizeEnd() {
      setTimeout(() => (changingRef.current = false))
    },
  })

  const [panelVisible, { toggle }] = useBoolean(false)

  return ReactDOM.createPortal(
    <div ref={setDialogRef} className="rc-dev-panel">
      <SettingSvg
        width={35}
        height={35}
        className={joinCls("icon")}
        // @ts-ignore
        ref={setMoveHandleRef}
        onClick={() => !changingRef.current && toggle()}
      />
      {panelVisible && <div className={joinCls("content")}>{children}</div>}
    </div>,
    CommonUtil.getDom("rc-portal-wrapper"),
  )
}

export const ToolWrapper: React.FC<PropsWithChildren<{ name: string }>> = ({ name, children }) => {
  return (
    <fieldset>
      <legend>{name}</legend>
      {children}
    </fieldset>
  )
}
