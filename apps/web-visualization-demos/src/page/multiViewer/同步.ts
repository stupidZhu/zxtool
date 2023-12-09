import { ViewerHelper } from "@zxtool/cesium-utils"
import * as Cesium from "cesium"

export const viewer同步 = async () => {
  let isLeftTrigger = false
  let isRightTrigger = false
  const viewerL = await ViewerHelper.getViewerPromise()
  const viewerR = await ViewerHelper.getViewerPromise("sub")
  //右侧viewer与左侧同步--操作左侧
  const syncLeftViewer = () => {
    const canvasL = viewerL.scene.canvas
    const handlerL = new Cesium.ScreenSpaceEventHandler(canvasL)
    handlerL.setInputAction(() => {
      isLeftTrigger = true
      isRightTrigger = false
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    viewerL.camera.changed.addEventListener(syncViewerL)
    viewerL.scene.preRender.addEventListener(syncViewerL)
  }
  const syncViewerL = () => {
    if (isLeftTrigger) {
      viewerR.camera.flyTo({
        destination: viewerL.camera.position,
        orientation: {
          heading: viewerL.camera.heading,
          pitch: viewerL.camera.pitch,
          roll: viewerL.camera.roll,
        },
        duration: 0.0,
      })
    }
  }
  //左侧viewer与右侧同步--操作右侧
  const syncRightViewer = () => {
    const canvasR = viewerR.scene.canvas
    const handlerR = new Cesium.ScreenSpaceEventHandler(canvasR)
    handlerR.setInputAction(() => {
      isLeftTrigger = false
      isRightTrigger = true
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    viewerR.camera.changed.addEventListener(syncViewerR)
    viewerR.scene.preRender.addEventListener(syncViewerR)
  }
  const syncViewerR = () => {
    if (isRightTrigger) {
      viewerL.camera.flyTo({
        destination: viewerR.camera.position,
        orientation: {
          heading: viewerR.camera.heading,
          pitch: viewerR.camera.pitch,
          roll: viewerR.camera.roll,
        },
        duration: 0.0,
      })
    }
  }

  syncLeftViewer()
  syncRightViewer()
}
