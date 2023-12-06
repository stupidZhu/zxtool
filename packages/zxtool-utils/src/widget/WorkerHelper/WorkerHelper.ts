// https://zhuanlan.zhihu.com/p/83001302

import { genZUInfo } from "../../util"
import { CommonUtil } from "../CommonUtil/CommonUtil"

const genInfo = genZUInfo("WorkerHelper")

function getWorkerUtil<M, R>(e: MessageEvent<{ key: number; message: M }>) {
  const { key, message } = e.data
  return {
    getMsg() {
      return message
    },
    postMsg(message: R) {
      postMessage({ key, message })
    },
    throwError(message: R) {
      throw new Error(JSON.stringify({ key, message }))
    },
  }
}

export type GetWorkerUtilType<M = unknown, R = unknown> = (e: MessageEvent<{ key: number; message: M }>) => {
  getMsg(): M
  postMsg(message: R): void
  throwError(message: R): never
}

export type WorkerFn<T = unknown> = (getWorkerUtil: GetWorkerUtilType<T>) => void

export class WorkerHelper {
  private worker: Worker | null = null
  private jobMap: Map<PropertyKey, Function[]> = new Map()
  private key = 0

  static fn2url(fn: WorkerFn) {
    return URL.createObjectURL(new Blob([`(${fn.toString()})(${getWorkerUtil.toString()})`]))
  }

  constructor(fn: WorkerFn<any>) {
    this.worker = new Worker(WorkerHelper.fn2url(fn))

    this.worker.onmessage = ({ data }) => {
      if ("message" in data && "key" in data) {
        const { message, key } = data
        this.jobMap.get(key)?.[0]?.(message)
        this.jobMap.delete(key)
      }
    }

    this.worker.onerror = e => {
      e.preventDefault()
      const data = CommonUtil.parseJson<{ key: number; message: unknown }>(e.message.replace("Uncaught Error: ", ""))
      if (data && "message" in data && "key" in data) {
        const { message, key } = data
        this.jobMap.get(key)?.[1]?.(message)
        this.jobMap.delete(key)
      }
    }
  }

  postMessage<T>(message: unknown) {
    if (!this.worker) throw new Error(genInfo("worker 没有初始化或者已经销毁"))

    return new Promise<T>((resolve, reject) => {
      const key = this.key++
      this.jobMap.set(key, [resolve, reject])
      this.worker!.postMessage({ key, message })
    })
  }

  terminate() {
    this.worker?.terminate()
    this.worker = null
  }
}
