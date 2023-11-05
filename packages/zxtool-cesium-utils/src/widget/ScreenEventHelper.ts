import { IObj } from "@zxtool/utils/dist/type"
import * as Cesium from "cesium"
import ViewerHelper from "./ViewerHelper"

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
export type ScreenEventType = keyof typeof ScreenSpaceEventType

interface AddEventProps {
  key: string
  type: ScreenEventType
  cb: (movement: IObj) => void
}

interface RemoveEventProps {
  key: string
  type?: ScreenEventType
}

class ScreenEventHelper {
  private handlerCollection: IObj<Cesium.ScreenSpaceEventHandler> = {}

  addEvent = async ({ key, type, cb }: AddEventProps) => {
    const viewer = await ViewerHelper.getViewerPromise()
    let handler = this.handlerCollection[key]
    if (!handler) {
      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      this.handlerCollection[key] = handler
    }
    handler.setInputAction(cb, ScreenSpaceEventType[type])
  }

  removeEvent = async ({ key, type }: RemoveEventProps) => {
    const handler = this.handlerCollection[key]
    if (!handler) return
    if (type) handler.removeInputAction(ScreenSpaceEventType[type])
    else {
      handler.destroy()
      Reflect.deleteProperty(this.handlerCollection, key)
    }
  }
}

export default new ScreenEventHelper()
