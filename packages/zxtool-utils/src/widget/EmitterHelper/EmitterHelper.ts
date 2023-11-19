import CommonUtil, { GetNumberProps } from "../CommonUtil/CommonUtil"

export type REST<T = any> = T[]
export type EmitterHandler<T extends REST = REST> = ((...rest: T) => void) & { _raw?: (...rest: T) => void }
export type EmitterKey = string | number | symbol
export type OverflowStrategy = "prevent" | "shift"

// todo 研究一下是否有内存泄漏的风险
export interface EmitterProps {
  maxCount?: { history?: number; handler?: number }
  overflowStrategy?: { history?: OverflowStrategy; handler?: OverflowStrategy }
}

const getNumberProps: Omit<GetNumberProps, "value"> = { defaultValue: 0, min: 0, max: 1000, intStrategy: "trunc" }

export default class EmitterHelper {
  private handlerCollection: Map<EmitterKey, EmitterHandler[]> = new Map()
  private historyCollection: Map<EmitterKey, REST[]> = new Map()

  private maxCount = { history: 0, handler: 0 }
  private overflowStrategy = { history: "shift", handler: "shift" }

  constructor(props: EmitterProps = {}) {
    const { maxCount = {}, overflowStrategy = {} } = props
    let { history: historyC = 0, handler: handlerC = 0 } = maxCount
    const { history: historyS = "shift", handler: handlerS = "shift" } = overflowStrategy
    historyC = CommonUtil.getValueUtil.getNumber({ value: historyC, ...getNumberProps })
    handlerC = CommonUtil.getValueUtil.getNumber({ value: handlerC, ...getNumberProps })

    this.maxCount = { history: historyC, handler: handlerC }
    this.overflowStrategy = { history: historyS, handler: handlerS }
  }

  /**
   * 如果 key 为 *, 不支持触发历史消息 (onHistory 无效)
   * 因为 historyCollection 的 key 不可能为 *
   */
  on<T extends REST>(key: EmitterKey, handler: EmitterHandler<T>, onHistory = false) {
    this.setCollection("handler", key, handler)

    if (onHistory) {
      const history = this.historyCollection.get(key)
      if (history) history.forEach(args => handler(...(args as T)))
    }
  }

  once<T extends REST>(key: EmitterKey, handler: EmitterHandler<T>, onHistory = false) {
    const _handler = (...rest: T) => {
      this.off(key, _handler as EmitterHandler)
      handler(...rest)
    }
    _handler._raw = handler

    this.setCollection("handler", key, _handler)

    if (onHistory) {
      const history = this.historyCollection.get(key)
      if (history?.[0]) _handler(...(history[0] as T))
    }
  }

  onceAsync(key: EmitterKey, onHistory = false) {
    let _reject: (reason?: any) => void = () => {}
    const promise = new Promise((resolve, reject) => {
      _reject = reason => {
        reject(reason)
        this.off(key, resolve)
      }
      this.once(key, resolve, onHistory)
    })

    return { promise, reject: _reject }
  }

  emit<T extends REST>(key: EmitterKey, ...args: T) {
    this.setCollection("history", key, args)

    const handlers = this.handlerCollection.get(key)
    if (handlers) handlers.forEach(handler => handler(...args))

    const aHandlers = this.handlerCollection.get("*")
    if (aHandlers) aHandlers.forEach(handler => handler(key, ...args))
  }

  off(key: EmitterKey, handler?: EmitterHandler) {
    const handlers = this.handlerCollection.get(key)
    if (handlers) {
      if (handler) {
        const i = handlers.findIndex(item => item === handler || item._raw === handler)
        if (i !== -1) {
          handlers.splice(i, 1)
          return true
        }
        return false
      }
      this.handlerCollection.set(key, [])
      return true
    }
    return false
  }

  clearHandle(key?: EmitterKey) {
    if (key) this.off(key)
    else this.handlerCollection.clear()
  }

  clearHistory(key?: EmitterKey) {
    if (key) {
      const history = this.historyCollection.get(key)
      if (history) this.historyCollection.set(key, [])
    } else this.historyCollection.clear()
  }

  private setCollection(type: "history" | "handler", key: EmitterKey, value: any) {
    if (type === "handler") {
      const handlers = this.handlerCollection.get(key)
      if (!handlers) {
        this.handlerCollection.set(key, [value as EmitterHandler])
        return
      }
      if (this.maxCount.handler <= 0) {
        handlers.push(value as EmitterHandler)
        return
      }
      if (handlers.length >= this.maxCount.handler) {
        if (this.overflowStrategy.handler === "prevent") {
          throw new Error("[@zxtool/utils - EmitterHelper] on 调用失败, handler 数量已达到上限")
        }
        console.warn(`[@zxtool/utils - EmitterHelper] key 为 ${String(key)} 的第一个 handler 已被移除`)
        handlers.shift()
        handlers.push(value as EmitterHandler)
        return
      }
    } else {
      if (key === "*") throw new Error("[@zxtool/utils - EmitterHelper] emit 调用失败, key 不允许为 *")
      const history = this.historyCollection.get(key)
      if (!history) {
        this.historyCollection.set(key, [value as REST])
        return
      }
      if (this.maxCount.history <= 0) {
        history.push(value as REST)
        return
      }
      if (history.length >= this.maxCount.history) {
        if (this.overflowStrategy.history === "prevent") {
          throw new Error("[@zxtool/utils - EmitterHelper] emit 调用失败, history 数量已达到上限")
        }
        console.warn(`[@zxtool/utils - EmitterHelper] key 为 ${String(key)} 的第一条 history 已被移除`)
        history.shift()
        history.push(value as REST)
        return
      }
    }
  }
}
