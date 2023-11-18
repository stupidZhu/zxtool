/**
 * title: EmitterHelper 基本使用
 * desc: 打开控制台查看。
 */

import { EmitterHelper } from "@zxtool/utils"

const emitter = new EmitterHelper()

const BaseDemo = () => {
  return (
    <div>
      <p>添加一个事件订阅, 可以使用泛型指定参数类型</p>
      <button onClick={() => emitter.on<[string, { hello: number }]>("test1", console.log)}>on - test1</button>
      <p>移除事件订阅</p>
      <button onClick={() => emitter.off("test1")}>off - test1</button>
      <p>添加一个事件订阅, 并接收历史消息(支持先发布, 后订阅)</p>
      <button onClick={() => emitter.on("test2", console.log, true)}>on - with history - test2</button>
      <p>添加一个只执行一次事件订阅</p>
      <button onClick={() => emitter.once("test3", console.log)}>once - test3</button>
      <p>添加一个能够接收所有事件的订阅</p>
      <button onClick={() => emitter.on("*", (type, ...rest) => console.log(`${type}-all`, ...rest), true)}>on - all</button>
      <hr />
      <div className="btn-wrapper">
        <button onClick={() => emitter.emit<[string, { hello: number }]>("test1", "tets1", { hello: 1 })}>
          emit - test1
        </button>
        <button onClick={() => emitter.emit("test2", "tets2")}>emit - test2</button>
        <button onClick={() => emitter.emit("test3", "tets3")}>emit - test3</button>
      </div>
      <hr />
      <div className="btn-wrapper">
        <button onClick={() => console.log(emitter)}>打印 emitter 对象</button>
        <button onClick={() => emitter.clearHandle()}>清除所有事件订阅</button>
        <button onClick={() => emitter.clearHistory()}>清除所有历史消息</button>
      </div>
    </div>
  )
}

export default BaseDemo
