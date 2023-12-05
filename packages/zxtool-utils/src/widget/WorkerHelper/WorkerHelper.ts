// https://zhuanlan.zhihu.com/p/83001302

import { nanoid } from "nanoid"

export class WorkerHelper {
  worker: Worker
  jobMap: Map<PropertyKey, Function> = new Map()

  static fn2url(fn: Function) {
    return URL.createObjectURL(new Blob([`(${fn.toString()})()`]))
  }

  constructor(fn: Function) {
    this.worker = new Worker(WorkerHelper.fn2url(fn))

    this.worker.onmessage = ({ data: { result, key } }) => {
      this.jobMap.get(key)?.(result)
      this.jobMap.delete(key)
    }
  }

  postMessage(message: any) {
    return new Promise(resolve => {
      const key = nanoid()
      this.jobMap.set(key, resolve)
      this.worker.postMessage({ key, message })
    })
  }
}
