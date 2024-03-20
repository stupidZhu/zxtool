import { Fn } from "../../type"

export const onSet = <T>(props: { before?: Fn<[T]>; after?: Fn<[T]> }) => {
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
