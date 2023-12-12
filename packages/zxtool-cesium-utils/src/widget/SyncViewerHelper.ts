import * as Cesium from "cesium"
import { genZCUInfo } from "../util"
import { _ScreenEventHelper } from "./ScreenEventHelper"

const genInfo = genZCUInfo("SyncViewerHelper")

class SyncViewerHelper {
  private readonly KEY: PropertyKey
  private readonly viewers: Map<PropertyKey, Cesium.Viewer>

  private curViewer: Cesium.Viewer | null = null
  private ScreenEventHelper = new _ScreenEventHelper()
  private config: Map<PropertyKey, { sync?: boolean; enable?: boolean }> = new Map()

  constructor(KEY: PropertyKey, viewers: Map<PropertyKey, Cesium.Viewer>) {
    this.KEY = KEY
    this.viewers = viewers
  }

  private syncViewer = () => {
    this.viewers.forEach(viewer => {
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

  setConfig() {}

  startSync() {
    this.viewers.forEach((viewer, key) => {
      this.ScreenEventHelper.addEvent({
        key,
        viewer,
        type: "MOUSE_MOVE",
        cb: () => {
          this.curViewer = viewer
        },
      })

      viewer.camera.changed.addEventListener(this.syncViewer)
      viewer.scene.preRender.addEventListener(this.syncViewer)
    })
  }

  stopSync() {
    this.viewers.forEach((viewer, key) => {
      this.ScreenEventHelper.removeEvent({ key, type: "MOUSE_MOVE" })

      viewer.camera.changed.removeEventListener(this.syncViewer)
      viewer.scene.preRender.removeEventListener(this.syncViewer)
    })
  }
}

export default SyncViewerHelper
