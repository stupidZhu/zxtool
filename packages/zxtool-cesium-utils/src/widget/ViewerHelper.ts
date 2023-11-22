import { EmitterHelper } from "@zxtool/utils"
import * as Cesium from "cesium"
import _ViewerUtil from "../_util/_ViewerUtil"
import { ZCUConfig } from "../util/ZCUConfig"

export type InitViewerProps = Cesium.Viewer.ConstructorOptions & { hideWidget?: boolean; fxaa?: boolean }

class ViewerHelper {
  private viewer?: Cesium.Viewer
  private vKey = Symbol("viewer")
  private emitter = new EmitterHelper({ maxCount: { history: 1 } })

  init = (container: string | Element, options: InitViewerProps = {}) => {
    const { hideWidget, fxaa = true, ...rest } = options

    const token = ZCUConfig.getConfig("CESIUM_TOKEN", false)
    if (token) Cesium.Ion.defaultAccessToken = token

    this.viewer = new Cesium.Viewer(container, { ...(hideWidget ? _ViewerUtil.getHideWidgetOption() : null), ...rest })
    this.emitter.emit(this.vKey, this.viewer)

    // @ts-ignore
    hideWidget && (this.viewer.cesiumWidget.creditContainer.style.display = "none")
    fxaa && _ViewerUtil.fxaa(this.viewer)

    this.viewer.scene.globe.depthTestAgainstTerrain = true

    return this.viewer
  }

  setViewer = (viewer: Cesium.Viewer) => {
    this.viewer = viewer
    this.emitter.emit(this.vKey, this.viewer)
  }

  getViewer = (): Cesium.Viewer | undefined => this.viewer

  getViewerPromise = async (viewer?: Cesium.Viewer) => {
    if (viewer) return viewer
    if (this.viewer) return this.viewer
    return this.emitter.onceAsync<Cesium.Viewer>(this.vKey, true).promise
  }

  flyToHome = () => {
    const homeView = ZCUConfig.getConfig("homeView", false)
    homeView && this.viewer?.camera.flyTo(homeView)
  }

  destroy = () => {
    this.viewer?.destroy()
    this.viewer = undefined
    this.emitter.clearHistory()
  }
}

export default new ViewerHelper()
