import EmitterHelper from "../EmitterHelper"

const originalWarn = console.warn
beforeAll(() => {
  console.warn = (...args) => {}
})
afterAll(() => {
  console.error = originalWarn
})

describe("EmitterHelper", () => {
  test("should be defined", () => {
    expect(EmitterHelper).toBeDefined()
  })

  const emitter = new EmitterHelper()
  const fn1 = jest.fn()
  const fn2 = jest.fn()
  const fn3 = jest.fn()
  const symbol = Symbol("test")

  afterEach(() => {
    // 这里可以顺带测试 clearHandle 和 clearHistory 方法
    emitter.clearHandle()
    emitter.clearHistory()
    fn1.mockReset()
    fn2.mockReset()
    fn3.mockReset()
  })

  test("on off once all", () => {
    emitter.on(symbol, fn1)
    emitter.once(symbol, fn2)
    emitter.on("*", fn3)
    emitter.emit(symbol, 1)
    emitter.emit(symbol, {})
    emitter.emit("test", 999)

    expect(() => {
      emitter.emit("*", {})
    }).toThrow("key 不允许为 *")

    // fn1 执行 2 次; fn2 执行 1 次
    expect(fn1.mock.calls).toEqual([[1], [{}]])
    expect(fn2.mock.calls).toEqual([[1]])
    expect(fn3.mock.calls).toEqual([
      [symbol, 1],
      [symbol, {}],
      ["test", 999],
    ])

    const res1 = emitter.off(symbol, fn1)
    const res2 = emitter.off(symbol, fn2)
    const res3 = emitter.off("*", fn3)
    const res4 = emitter.off("test")

    expect(res1).toBe(true)
    expect(res2).toBe(false)
    expect(res3).toBe(true)
    expect(res4).toBe(false)

    emitter.emit(symbol, 2)

    expect(fn1).toBeCalledTimes(2)
    expect(fn2).toBeCalledTimes(1)
    expect(fn3).toBeCalledTimes(3)

    fn2.mockReset()
    emitter.once(symbol, fn2)
    emitter.off(symbol, fn2)
    emitter.emit(symbol, 3)

    expect(fn2).toBeCalledTimes(0)
  })

  test("history", () => {
    emitter.emit(symbol, 1)
    emitter.emit(symbol, {})

    expect(fn1.mock.calls).toEqual([])

    emitter.on(symbol, fn1, true)
    emitter.once(symbol, fn2, true)
    emitter.on("*", fn3, true)

    // fn1 执行 2 次; fn2 执行 1 次
    expect(fn1.mock.calls).toEqual([[1], [{}]])
    expect(fn2.mock.calls).toEqual([[1]])
    expect(fn3).toHaveBeenCalledTimes(0)

    emitter.emit(symbol, 2)

    // fn1 执行 3 次; fn2 不再执行
    expect(fn1.mock.calls).toEqual([[1], [{}], [2]])
    expect(fn2.mock.calls).toEqual([[1]])
    expect(fn3.mock.calls).toEqual([[symbol, 2]])
  })

  test("clear with key", () => {
    emitter.on(symbol, fn1)
    emitter.on("test", fn2)
    emitter.emit(symbol, "s-1")
    emitter.emit("test", "t-1")

    emitter.clearHandle(symbol)
    emitter.emit(symbol, "s-2")
    emitter.emit("test", "t-2")

    // fn1 执行一次以后被清除, 第二次 emit 不触发
    expect(fn1.mock.calls).toEqual([["s-1"]])
    expect(fn2.mock.calls).toEqual([["t-1"], ["t-2"]])

    fn1.mockReset()
    fn2.mockReset()
    emitter.clearHistory("test")
    emitter.on(symbol, fn1, true)
    emitter.on("test", fn2, true)

    // fn1 执行 2 次历史记录; fn2 历史记录被清除, 不执行
    expect(fn1.mock.calls).toEqual([["s-1"], ["s-2"]])
    expect(fn2).toHaveBeenCalledTimes(0)
  })

  test("props", () => {
    const emitter1 = new EmitterHelper({
      maxCount: { history: 1, handler: 1 },
      overflowStrategy: { history: "prevent", handler: "prevent" },
    })
    const emitter2 = new EmitterHelper({
      maxCount: { history: 1, handler: 1 },
      overflowStrategy: { history: "shift", handler: "shift" },
    })

    emitter1.on(symbol, fn1)
    expect(() => {
      emitter1.on(symbol, fn1)
    }).toThrow("handler 数量已达到上限")

    emitter1.emit(symbol, 1)
    expect(() => {
      emitter1.emit(symbol, 1)
    }).toThrow("history 数量已达到上限")

    expect(fn1.mock.calls).toEqual([[1]])

    emitter2.on(symbol, fn2)
    emitter2.emit(symbol, 2)
    emitter2.emit(symbol, 3)

    emitter2.on(symbol, fn3, true)
    emitter2.emit(symbol, 4)

    // fn2 被清除, 不执行 [4]
    expect(fn2.mock.calls).toEqual([[2], [3]])
    // on 的时候执行历史记录 [3], 后 emit 执行 [4]
    expect(fn3.mock.calls).toEqual([[3], [4]])

    const emitter3 = new EmitterHelper({
      maxCount: { history: -1, handler: 2.5 },
    })

    // @ts-ignore
    expect(emitter3.maxCount.history).toBe(0)
    // @ts-ignore
    expect(emitter3.maxCount.handler).toBe(2)
    // @ts-ignore
    expect(emitter3.overflowStrategy.history).toBe("shift")
  })
})
