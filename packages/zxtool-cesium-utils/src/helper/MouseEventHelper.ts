import * as Cesium from "cesium"

// https://juejin.cn/post/7053298681037979678
export enum ScreenSpaceEventType {
  LEFT_DOWN = 0,
  LEFT_UP = 1,
  LEFT_CLICK = 2,
  LEFT_DOUBLE_CLICK = 3,
  RIGHT_DOWN = 5,
  RIGHT_UP = 6,
  RIGHT_CLICK = 7,
  MIDDLE_DOWN = 10,
  MIDDLE_UP = 11,
  MIDDLE_CLICK = 12,
  MOUSE_MOVE = 15,
  WHEEL = 16,
  PINCH_START = 17,
  PINCH_END = 18,
  PINCH_MOVE = 19,
}

// https://www.coder.work/article/1309200
export type MouseEventType = keyof typeof ScreenSpaceEventType

export interface AddEventProps {
  key: PropertyKey
  type: MouseEventType
  cb: (movement: any) => void
}

export interface RemoveEventProps {
  key: PropertyKey
  type?: MouseEventType
}

export class GlobalMouseEventHelper {
  private handlerCollection: Map<PropertyKey, Cesium.ScreenSpaceEventHandler> = new Map()

  addEvent({ key, type, viewer, cb }: AddEventProps & { viewer: Cesium.Viewer }) {
    let handler = this.handlerCollection.get(key)
    if (!handler) {
      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      this.handlerCollection.set(key, handler)
    }
    handler.setInputAction(cb, ScreenSpaceEventType[type])
    return this
  }

  removeEvent({ key, type }: RemoveEventProps) {
    const handler = this.handlerCollection.get(key)
    if (!handler) return
    if (type) handler.removeInputAction(ScreenSpaceEventType[type])
    else {
      handler.destroy()
      this.handlerCollection.delete(key)
    }
  }

  clear() {
    this.handlerCollection.forEach(handler => handler.destroy())
    this.handlerCollection.clear()
  }
}

export class MouseEventHelper extends GlobalMouseEventHelper {
  private viewer: Cesium.Viewer

  constructor(viewer: Cesium.Viewer) {
    super()
    this.viewer = viewer
  }

  addEvent(props: AddEventProps) {
    return super.addEvent({ ...props, viewer: this.viewer })
  }
}
