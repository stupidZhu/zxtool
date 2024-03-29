/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom"
import { DialogMoveCb, useDialog } from "../useDialog"

type MoveProps = Parameters<DialogMoveCb>[0]

const movePointer = (x: number, y: number) => {
  document.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y, screenX: x, screenY: y }))
}

const originalWarn = console.warn
beforeAll(() => {
  console.warn = (...args) => {}
})
afterAll(() => {
  console.error = originalWarn
})

describe("useDialog", () => {
  test("should be defined", () => {
    expect(useDialog).toBeDefined()
  })

  // test("dialog 移动会设置正确的 style", () => {
  //   const func = jest.fn((type: string, props: MoveProps) => {})

  //   const { result } = renderHook(() =>
  //     useDialog({
  //       onMoveStart: props => func("start", props),
  //       onMoving: props => func("moving", props),
  //       onMoveEnd: props => func("end", props),
  //     }),
  //   )

  //   const { setDialogRef, setMoveHandleRef } = result.current

  //   const { getByTestId } = render(
  //     <div data-testid="dialog" ref={setDialogRef} style={{ width: 100, height: 100 }}>
  //       <div data-testid="move-field" ref={setMoveHandleRef} style={{ width: 100, height: 50 }}></div>
  //     </div>,
  //   )

  //   fireEvent.pointerDown(getByTestId("move-field"))
  //   expect(func).toHaveBeenCalledTimes(1)

  //   act(() => {
  //     document.dispatchEvent(new MouseEvent("mousemove", { clientX: 200, clientY: 200, screenX: 200, screenY: 200 }))
  //   })
  //   expect(func).toHaveBeenCalledWith("moving")
  //   expect(result.current.state.isMoving).toBe(true)

  //   fireEvent.mouseUp(getByTestId("move-field"))
  //   expect(func).toHaveBeenCalledWith("moveEnd")
  //   expect(getByTestId("dialog")).toHaveStyle({ left: "200px", top: "200px" })
  // })

  // test("dialog 可以改变大小", () => {
  //   const func = jest.fn((type: string) => {})
  //   const { getByTestId } = render(
  //     <div data-testid="dialog" style={{ width: 100, height: 100, position: "relative" }}>
  //       <div data-testid="resize-field" style={{ width: 10, height: 10, position: "absolute", right: 0, bottom: 0 }}></div>
  //     </div>,
  //   )

  //   const { result } = renderHook(() =>
  //     useDialog({
  //       dialogRef: () => getByTestId("dialog"),
  //       resizeFieldRef: () => getByTestId("resize-field"),
  //       resizeCb: ({ type }) => func(type),
  //     }),
  //   )

  //   fireEvent.mouseDown(getByTestId("resize-field"))
  //   expect(func).toHaveBeenCalledWith("resizeStart")

  //   act(() => {
  //     document.dispatchEvent(new MouseEvent("mousemove", { clientX: 200, clientY: 200, screenX: 200, screenY: 200 }))
  //   })
  //   expect(func).toHaveBeenCalledWith("resizing")
  //   expect(result.current.state.isResizing).toBe(true)

  //   fireEvent.mouseUp(getByTestId("resize-field"))
  //   expect(func).toHaveBeenCalledWith("resizeEnd")
  //   expect(getByTestId("dialog")).toHaveStyle({ height: "205px", width: "205px" })
  // })

  // test("测试搭配 ConfigProvider", () => {
  //   const wrapper: React.FC<WithChildren> = ({ children }) => (
  //     <ConfigProvider initialZIndex={2000}>{children}</ConfigProvider>
  //   )

  //   const { getByTestId } = render(
  //     <div data-testid="dialog">
  //       <div data-testid="move-field"></div>
  //       <div data-testid="resize-field"></div>
  //     </div>,
  //   )

  //   renderHook(
  //     () =>
  //       useDialog({
  //         dialogRef: () => getByTestId("dialog"),
  //         moveFieldRef: () => getByTestId("move-field"),
  //         resizeFieldRef: () => getByTestId("resize-field"),
  //       }),
  //     { wrapper },
  //   )
  //   expect(getByTestId("dialog")).toHaveStyle({ "z-index": "2001" })

  //   fireEvent.mouseDown(getByTestId("resize-field"))
  //   act(() => {
  //     document.dispatchEvent(new MouseEvent("mousemove", { clientX: 200, clientY: 200, screenX: 200, screenY: 200 }))
  //   })
  //   expect(getByTestId("dialog")).toHaveStyle({ "z-index": "2002" })

  //   fireEvent.mouseUp(getByTestId("resize-field"))

  //   fireEvent.mouseDown(getByTestId("move-field"))
  //   act(() => {
  //     document.dispatchEvent(new MouseEvent("mousemove", { clientX: 200, clientY: 200, screenX: 200, screenY: 200 }))
  //   })
  //   expect(getByTestId("dialog")).toHaveStyle({ "z-index": "2003" })
  //   fireEvent.mouseUp(getByTestId("move-field"))
  // })
})
