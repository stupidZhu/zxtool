import { CacheHelper } from "../CacheHelper"

describe("CacheHelper", () => {
  test("should be defined", () => {
    expect(CacheHelper).toBeDefined()
  })

  const cacheHelper = new CacheHelper()
  const key1 = [1, { hello: "world", a: [] }]
  const key2 = [{ a: [], hello: "world" }, 1]

  afterEach(() => {
    cacheHelper.clear()
  })

  test("基本 api", async () => {
    cacheHelper.set(key1, "value1")

    await expect(cacheHelper.get(key1)).resolves.toBe("value1")
    await expect(cacheHelper.get([1, { a: [], hello: "world" }])).resolves.toBe("value1")
    await expect(cacheHelper.get([{ a: [], hello: "world" }, 1])).resolves.toBeUndefined()

    cacheHelper.set(key2, "value2")
    cacheHelper.delete([1, { a: [], hello: "world" }])

    await expect(cacheHelper.get(key1)).resolves.toBeUndefined()
    await expect(cacheHelper.get(key2)).resolves.toBe("value2")

    cacheHelper.clear()

    await expect(cacheHelper.get(key2)).resolves.toBeUndefined()
  })

  test("get 的默认值", async () => {
    await expect(cacheHelper.get(key1, () => "value1")).resolves.toBe("value1")
    await expect(cacheHelper.get(key2, async () => "value2")).resolves.toBe("value2")

    await expect(cacheHelper.get(key1, () => "value3")).resolves.toBe("value1")
    await expect(cacheHelper.get(key2, async () => "value4")).resolves.toBe("value2")
  })
})
