/**
 * title: EmitterHelper 参数
 * desc: 打开控制台查看。
 */

import { EmitterHelper } from "@zxtool/utils"
import React from "react"

const emitter1 = new EmitterHelper({
  maxCount: { history: 1, handler: 1 },
  overflowStrategy: { history: "prevent", handler: "prevent" },
})
const emitter2 = new EmitterHelper({
  maxCount: { history: 1, handler: 1 },
  overflowStrategy: { history: "shift", handler: "shift" },
})
const OptionsDemo = () => {
  return (
    <div>
      <p>超出最大限制后直接抛出异常阻止运行</p>
      <div className="btn-wrapper">
        <button
          onClick={() => {
            const v = `onTime:${Date.now()}`
            emitter1.on("test", (...rest) => console.log(v, ...rest))
          }}
        >
          on
        </button>
        <button
          onClick={() => {
            const v = `emitTime:${Date.now()}`
            emitter1.emit("test", v)
          }}
        >
          emit
        </button>
      </div>

      <hr />
      <p>超出最大限制以后移除最早的订阅/历史, 并插入最新的订阅/历史, 并在控制台打印一条警告</p>
      <div className="btn-wrapper">
        <button
          onClick={() => {
            const v = `onTime:${Date.now()}`
            emitter2.on("test", (...rest) => console.log(v, ...rest))
          }}
        >
          on
        </button>
        <button
          onClick={() => {
            const v = `emitTime:${Date.now()}`
            emitter2.emit("test", v)
          }}
        >
          emit
        </button>
      </div>
      <hr />
      <div className="btn-wrapper">
        <button onClick={() => console.log(emitter1, emitter2)}>打印 emitter 对象</button>
        <button
          onClick={() => {
            emitter1.clearHandle()
            emitter2.clearHandle()
          }}
        >
          清除所有事件订阅
        </button>
        <button
          onClick={() => {
            emitter1.clearHistory()
            emitter2.clearHistory()
          }}
        >
          清除所有历史消息
        </button>
      </div>
    </div>
  )
}

export default OptionsDemo
