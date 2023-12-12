import { EmitterHelper } from "@zxtool/utils"
import * as Cesium from "cesium"
import { genZCUInfo } from "../util"
import { ViewerUtilSync } from "../util/ViewerUtilSync"
import SyncViewerHelper from "./SyncViewerHelper"

const genInfo = genZCUInfo("ViewerHelper")

export type InitViewerProps = Cesium.Viewer.ConstructorOptions & {
  hideWidget?: boolean
  fxaa?: boolean
  viewerKey?: PropertyKey
}

class _ViewerHelper {
  private readonly KEY: PropertyKey = Symbol("viewer")
  private readonly viewers: Map<PropertyKey, Cesium.Viewer> = new Map()
  private readonly emitter = new EmitterHelper({ maxCount: { history: 1 } })

  readonly SyncHelper = new SyncViewerHelper(this.KEY, this.viewers)

  init = (container: string | Element, options: InitViewerProps = {}) => {
    const { hideWidget, fxaa = true, viewerKey = this.KEY, ...rest } = options
    if (this.viewers.has(viewerKey)) throw new Error(genInfo(`key 为 ${viewerKey.toString()} 的 viewer 已经初始化过`))

    const viewer = new Cesium.Viewer(container, { ...(hideWidget ? ViewerUtilSync.getHideWidgetOption() : null), ...rest })
    // @ts-ignore
    hideWidget && (viewer.cesiumWidget.creditContainer.style.display = "none")
    fxaa && ViewerUtilSync.fxaa(viewer)
    viewer.scene.globe.depthTestAgainstTerrain = true

    this.SyncHelper.refreshSync()
    this.viewers.set(viewerKey, viewer)
    this.emitter.emit(viewerKey, viewer)

    return viewer
  }

  setViewer = (viewer: Cesium.Viewer, viewerKey = this.KEY) => {
    this.SyncHelper.refreshSync()
    this.viewers.set(viewerKey, viewer)
    this.emitter.emit(viewerKey, viewer)
  }

  getViewer = (viewerKey = this.KEY) => {
    return this.viewers.get(viewerKey)
  }

  getViewerPromise = async (viewerKey = this.KEY, viewer?: Cesium.Viewer) => {
    if (viewer) return viewer
    if (this.viewers.has(viewerKey)) return this.viewers.get(viewerKey)!
    return this.emitter.onceAsync<Cesium.Viewer>(viewerKey, true).promise
  }

  destroy = (viewerKey = this.KEY) => {
    this.SyncHelper.refreshSync()

    const viewer = this.viewers.get(viewerKey)
    if (viewer) {
      viewer.destroy()
      this.viewers.delete(viewerKey)
    }

    this.emitter.clearHistory(viewerKey)
  }
}

export const ViewerHelper = new _ViewerHelper()
