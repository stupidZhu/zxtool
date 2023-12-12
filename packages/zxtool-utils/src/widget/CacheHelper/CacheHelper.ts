import { CommonUtil } from "../CommonUtil/CommonUtil"

const { hashCacheKey } = CommonUtil

export class CacheHelper {
  private readonly store: Map<string, unknown> = new Map()

  set<T>(key: unknown[], value: T): T {
    const hashKey = hashCacheKey(key)
    this.store.set(hashKey, value)
    return value
  }

  delete(key: unknown[]) {
    const hashKey = hashCacheKey(key)
    this.store.delete(hashKey)
  }

  clear() {
    this.store.clear()
  }

  get<T = unknown>(key: unknown[], cb: () => T | Promise<T>): Promise<T>
  get<T = unknown>(key: unknown[]): Promise<T | undefined>
  async get<T = unknown>(key: unknown[], cb?: () => T | Promise<T>) {
    const hashKey = hashCacheKey(key)
    if (!this.store.has(hashKey) && cb) this.store.set(hashKey, await cb())
    return this.store.get(hashKey)
  }
}
