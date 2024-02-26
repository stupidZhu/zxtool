import * as Cesium from "cesium"
import { GlobalMouseEventHelper } from "./MouseEventHelper"

export interface ViewerObj {
  viewer: Cesium.Viewer
  doSync?: boolean
  beSync?: boolean
  control?: boolean
}

export class SyncViewerHelper {
  readonly viewers: Map<PropertyKey, ViewerObj>

  private flag = false
  private curViewer: Cesium.Viewer | null = null
  private globalMouseEventHelper = new GlobalMouseEventHelper()

  constructor(viewers: Map<PropertyKey, ViewerObj>) {
    this.viewers = viewers
  }

  private syncViewer = () => {
    this.viewers.forEach((viewerObj, key) => {
      const { viewer, beSync = true } = viewerObj
      if (!beSync) return
      if (this.curViewer && viewer !== this.curViewer) {
        viewer.camera.flyTo({
          destination: this.curViewer.camera.position,
          orientation: {
            heading: this.curViewer.camera.heading,
            pitch: this.curViewer.camera.pitch,
            roll: this.curViewer.camera.roll,
          },
          duration: 0.0,
        })
      }
    })
  }

  startSync() {
    this.flag = true

    this.viewers.forEach((viewerObj, key) => {
      const { viewer, doSync = true, control = true } = viewerObj

      if (!control) {
        const control = viewer.scene.screenSpaceCameraController
        control.enableRotate = false
        control.enableTranslate = false
        control.enableZoom = false
        control.enableTilt = false
        control.enableLook = false
      }

      if (doSync) {
        this.globalMouseEventHelper.addEvent({
          key,
          viewer,
          type: "MOUSE_MOVE",
          cb: () => (this.curViewer = viewer),
        })

        viewer.camera.changed.addEventListener(this.syncViewer)
        viewer.camera.percentageChanged = 1e-10
      }
    })
  }

  stopSync() {
    this.viewers.forEach((viewerObj, key) => {
      const { viewer } = viewerObj
      this.globalMouseEventHelper.removeEvent({ key, type: "MOUSE_MOVE" })

      viewer.camera.changed.removeEventListener(this.syncViewer)
      viewer.camera.percentageChanged = 0.5
    })
    this.flag = false
  }

  refreshSync() {
    if (!this.flag) return
    this.stopSync()
    setTimeout(() => this.startSync())
  }
}
