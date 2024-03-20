import { Fn } from "@zxtool/utils"

const onSet = <T>(props: { before?: Fn<[T]>; after?: Fn<[T]> }) => {
  return (value: any, context: ClassAccessorDecoratorContext) => {
    if (context.kind === "accessor") {
      const { set } = value
      return {
        set(this: T, val: any) {
          props.before?.(this)
          set.call(this, val)
          props.after?.(this)
        },
      }
    }
  }
}

const setUpdate = onSet<Dec>({
  after: C => {
    // @ts-ignore
    C.needUpdate = true
  },
})

// 单例
function singleton(value: any, context: any) {
  let instance: Dec

  const Wrapper = function (...args: any[]) {
    if (!instance) instance = new value(...args)
    return instance
  } as unknown as typeof Dec

  Wrapper.prototype = value.prototype
  return Wrapper
}

export class Dec {
  private needUpdate = false

  @setUpdate
  accessor name = "hello"
}

const dec = new Dec()
