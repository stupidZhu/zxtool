---
order: 1000
toc: content
group:
  title: hooks
  order: 1
---

# useDialog

<code src="./demo/useDialog/base.tsx"></code>

<code src="./demo/useDialog/provider.tsx"></code>

## props

| 参数          | 说明                       | 类型              | 默认值                        |
| :------------ | :------------------------- | :---------------- | :---------------------------- |
| confine       | 是否限制在可视范围内       | `boolean`         | `true`                        |
| minSize       | 可 resize 时，弹窗最小宽高 | `ISize`           | `{ width: 200, height: 150 }` |
| onMoveStart   | MoveStart 回调函数         | `DialogMoveCb`    | /                             |
| onMoving      | Moving 回调函数            | `DialogMoveCb`    | /                             |
| onMoveEnd     | MoveEnd 回调函数           | `DialogMoveCb`    | /                             |
| onResizeStart | ResizeStart 回调函数       | `DialogResizeCb ` | /                             |
| onResizing    | Resizing 回调函数          | `DialogResizeCb ` | /                             |
| onResizeEnd   | ResizeEnd 回调函数         | `DialogResizeCb ` | /                             |

## result

| 数据/方法          | 说明                                     | 类型                                                                                 |
| :----------------- | :--------------------------------------- | :----------------------------------------------------------------------------------- |
| setDialogRef       | 设置 dialog 的 ref                       | `(node: HTMLElement \| null) => void`                                                |
| setMoveHandleRef   | 设置可拖拽区域的 ref                     | `(node: HTMLElement \| null) => void`                                                |
| setResizeHandleRef | 设置可 resize 区域的 ref                 | `(node: HTMLElement \| null) => void`                                                |
| getDialogInfo      | 获取 dialog 的 `BoundingClientRect`      | `() => DOMRect`                                                                      |
| setDialogInfo      | 设置 dialog 的位置和大小                 | `(props: { top?: string; left?: string; width?: string; height?: string; }) => void` |
| toTop              | 将 dialog 置顶 (需要搭配 ConfigProvider) | `() => void`                                                                         |
| toBottom           | 将 dialog 置底 (需要搭配 ConfigProvider) | `() => void`                                                                         |

## about ConfigProvider

| 参数          | 说明                      | 类型     | 默认值 |
| :------------ | :------------------------ | :------- | :----- |
| initialZIndex | 默认初始 dialog 的 zIndex | `number` | `1000` |

## types

| 类型           | 说明                | 类型                                                                   |
| :------------- | :------------------ | :--------------------------------------------------------------------- |
| IPosition      | IPosition           | `{ top: number; left: number }`                                        |
| ISize          | ISize               | `{ width: number; height: number }`                                    |
| DialogMoveCb   | Move 回调函数类型   | `(props: { position: IPosition; pointerPosition: IPosition }) => void` |
| DialogResizeCb | Resize 回调函数类型 | `(props: { size: ISize; pointerPosition: IPosition }) => void`         |

## 备注

如果 confine 为 true，请不要给 dialog 设置 margin 或 translate，否则会计算出错。
