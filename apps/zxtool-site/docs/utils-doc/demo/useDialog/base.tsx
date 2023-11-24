/**
 * title: 基础用法
 * desc: 可拖拽, 可变大小弹窗。
 */
import React, { useState } from "react"
import { MyDialog } from "./Mydialog"

const BaseDemo = () => {
  const [show, setShow] = useState(false)

  return (
    <div className="dialog-demo">
      <div className="btn-wrapper">
        <button className="common-btn" onClick={() => setShow(s => !s)}>
          toggleDialog
        </button>
      </div>
      <MyDialog visible={show} title="弹窗标题" close={() => setShow(false)}>
        这是一个可拖拽, 可变大小弹窗。需要用户自行编写相关dom组件; useDialog hook 只提供可拖拽和 resize 支持, 其他的诸如样式,
        动画, 蒙版, 鼠标样式等需自行实现。
      </MyDialog>
    </div>
  )
}

export default BaseDemo
