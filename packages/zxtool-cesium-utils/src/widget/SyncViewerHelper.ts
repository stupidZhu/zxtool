import { MapList } from "@zxtool/utils"
import * as Cesium from "cesium"
import { genZCUInfo } from "../util"
import { _ScreenEventHelper } from "./ScreenEventHelper"

const genInfo = genZCUInfo("SyncViewerHelper")

interface SyncConfigItem {
  doSync?: boolean
  beSync?: boolean
  control?: boolean
}

class SyncViewerHelper {
  private readonly KEY: PropertyKey
  private readonly viewers: MapList<Cesium.Viewer>

  private _flag = false
  private curViewer: Cesium.Viewer | null = null
  private ScreenEventHelper = new _ScreenEventHelper()
  private config: Record<PropertyKey, SyncConfigItem> = {}

  constructor(KEY: PropertyKey, viewers: MapList<Cesium.Viewer>) {
    this.KEY = KEY
    this.viewers = viewers
  }

  get flag() {
    return this._flag
  }

  private syncViewer = () => {
    this.viewers.map.forEach((viewer, key) => {
      const beSync = this.config[key]?.beSync ?? true
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

  setConfig(config: Record<PropertyKey, SyncConfigItem>) {
    this.config = config
    this.refreshSync()
  }

  startSync() {
    this._flag = true
    this.viewers.map.forEach((viewer, key) => {
      const doSync = this.config[key]?.doSync ?? true
      const control = this.config[key]?.control ?? true

      if (!control) {
        const control = viewer.scene.screenSpaceCameraController
        control.enableRotate = false
        control.enableTranslate = false
        control.enableZoom = false
        control.enableTilt = false
        control.enableLook = false
      }

      if (doSync) {
        this.ScreenEventHelper.addEvent({
          key,
          viewer,
          type: "MOUSE_MOVE",
          cb: () => (this.curViewer = viewer),
        })

        // viewer.camera.changed.addEventListener(this.syncViewer)
        // viewer.scene.preRender.addEventListener(this.syncViewer)
        viewer.camera.changed.addEventListener(this.syncViewer)
        viewer.camera.percentageChanged = 1e-10
      }
    })
  }

  stopSync() {
    this.viewers.map.forEach((viewer, key) => {
      this.ScreenEventHelper.removeEvent({ key, type: "MOUSE_MOVE" })

      viewer.camera.changed.removeEventListener(this.syncViewer)
      viewer.camera.percentageChanged = 0.5
      // viewer.scene.preRender.removeEventListener(this.syncViewer)
    })
    this._flag = false
  }

  refreshSync() {
    if (!this._flag) return
    this.stopSync()
    setTimeout(() => this.startSync())
  }
}

export default SyncViewerHelper
