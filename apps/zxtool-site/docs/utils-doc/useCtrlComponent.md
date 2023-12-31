---
order: 800
toc: content
group:
  title: hooks
  order: 1
---

# useCtrlComponent

<code src="./demo/useCtrlComponent/base.tsx"></code>

## props

| 参数    | 说明                                                                       | 类型                         | 默认值 |
| :------ | :------------------------------------------------------------------------- | :--------------------------- | :----- |
| props   | 组件的 props (因为 hook 内部使用了 in 操作符，请直接传入 props 而不要解构) | `IObj`                       | 必填   |
| options | options                                                                    | `UseCtrlComponentOptions<T>` | /      |

## options (UseCtrlComponentOptions\<T\>)

| 参数                 | 说明                                                            | 类型     | 默认值         |
| :------------------- | :-------------------------------------------------------------- | :------- | :------------- |
| defaultValuePropName | 默认值的属性名                                                  | `string` | 'defaultValue' |
| valuePropName        | 值的属性名                                                      | `string` | 'value'        |
| onChangePropName     | 修改 state 的函数名                                             | `string` | 'onChange'     |
| defaultValue         | 默认值，优先级：props.value > props.defaultValue > defaultValue | `T`      | /              |

## result

| 数据/方法 | 说明                          | 类型                                                  |
| :-------- | :---------------------------- | :---------------------------------------------------- |
| value     | 数组第一项，状态值            | `T`                                                   |
| onChange  | 数组第二项，修改 state 的函数 | `(val: T \| ((val: T) => T), ...rest: any[]) => void` |

## 备注

这个 hooks 参考了 ahooks 的 <a href="https://ahooks.js.org/hooks/use-controllable-value" target="_blank">useControllableValue</a>
