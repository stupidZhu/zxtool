export type EmitterHandler<T extends any[] = any[]> = (...rest: T) => void
export type EmitterKey = string | number | symbol
export type OverflowStrategy = "prevent" | "shift"

export interface EmitterProps {
  maxCount?: {
    history?: number
    handler?: number
  }
  overflowStrategy?: {
    history?: OverflowStrategy
    handler?: OverflowStrategy
  }
}

export default class EmitterHelper {
  private handlerCollection: Map<EmitterKey, EmitterHandler[]> = new Map()
  private historyCollection: Map<EmitterKey, any[][]> = new Map()

  constructor() {}

  on<T extends any[]>(key: EmitterKey, handler: EmitterHandler<T>, onHistory = false) {
    const handlers = this.handlerCollection.get(key)

    if (!handlers) this.handlerCollection.set(key, [handler as EmitterHandler])
    else handlers.push(handler as EmitterHandler)

    if (onHistory) {
      const history = this.historyCollection.get(key)
      if (history) history.forEach(args => handler(...(args as T)))
    }
  }

  once<T extends any[]>(key: EmitterKey, handler: EmitterHandler<T>) {
    const _handler = (...rest: T) => {
      this.off(key, _handler as EmitterHandler)
      handler(...rest)
    }
    this.on(key, _handler)
  }

  emit(key: EmitterKey, ...args: any[]) {
    const history = this.historyCollection.get(key)
    if (!history) this.historyCollection.set(key, [args])
    else history.push(args)

    const handlers = this.handlerCollection.get(key)
    if (handlers) handlers.forEach(handler => handler(...args))

    const aHandlers = this.handlerCollection.get("*")
    if (aHandlers) aHandlers.forEach(handler => handler(key, ...args))
  }

  off(key: EmitterKey, handler?: EmitterHandler) {
    const handlers = this.handlerCollection.get(key)
    if (handlers) {
      if (handler) {
        const i = handlers.indexOf(handler)
        if (i !== -1) handlers.splice(i, 1)
      } else this.handlerCollection.set(key, [])
    }
  }

  clearHandle() {
    this.handlerCollection.clear()
  }

  clearHistory() {
    this.historyCollection.clear()
  }
}
