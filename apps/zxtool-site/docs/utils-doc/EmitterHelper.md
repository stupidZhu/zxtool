---
toc: content
group:
  title: utils
  order: 1
---

# EmitterHelper

类似Node.js 的 EventEmitter

## 示例

<code src="./demo/EmitterHelper/base.tsx"></code>

<code src="./demo/EmitterHelper/options.tsx"></code>

## props

| 参数                   | 说明                                              | 类型                                                         | 默认值                                   |
| :--------------------- | :------------------------------------------------ | :----------------------------------------------------------- | :--------------------------------------- |
| props.maxCount         | 事件订阅和历史记录数量的最大限制 (0 代表不作限制) | `{ history?: number; handler?: number }`                     | `{ history: 0; handler: 0 }`             |
| props.overflowStrategy | 超出限制时的处理策略                              | `{ history?: OverflowStrategy; handler?: OverflowStrategy }` | `{ history: "shift", handler: "shift" }` |

## result

| 数据/方法    | 说明                       | 类型                                                                                            |
| :----------- | :------------------------- | :---------------------------------------------------------------------------------------------- |
| on           | 添加一个订阅               | `<T extends REST<any>>(key: EmitterKey, handler: EmitterHandler<T>, onHistory?: boolean): void` |
| once         | 添加对一个只执行一次的订阅 | `<T extends REST<any>>(key: EmitterKey, handler: EmitterHandler<T>, onHistory?: boolean): void` |
| emit         | 发布一次事件               | `<T extends REST<any>>(key: EmitterKey, ...args: T): void`                                      |
| off          | 移除一个订阅               | `(key: EmitterKey, handler?: EmitterHandler): boolean`                                          |
| clearHandle  | 清除订阅                   | `(key?: EmitterKey): void`                                                                      |
| clearHistory | 清除历史记录               | `(key?: EmitterKey): void`                                                                      |

## types

| 类型                                    | 说明                 | 定义                         |
| :-------------------------------------- | :------------------- | :--------------------------- |
| `REST<T = any>`                         | ...rest 参数的类型   | `T[]`                        |
| `EmitterHandler<T extends REST = REST>` | 订阅函数             | `(...rest: T) => void`       |
| `EmitterKey`                            | key 的类型           | `string \| number \| symbol` |
| `OverflowStrategy`                      | 超出限制时的处理策略 | `"prevent" \| "shift"`       |
