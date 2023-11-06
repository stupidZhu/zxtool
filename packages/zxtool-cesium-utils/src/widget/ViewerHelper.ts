import { ListenValueHelper } from "@zxtool/utils"
import * as Cesium from "cesium"
import _ViewerUtil from "../_util/_ViewerUtil"
import { ZCUConfig } from "../util/ZCUConfig"

export const cesiumValueHelper = new ListenValueHelper()

export type InitViewerProps = Cesium.Viewer.ConstructorOptions & { hideWidget?: boolean; fxaa?: boolean }

class ViewerHelper {
  private viewer?: Cesium.Viewer

  init = (container: string | Element, options: InitViewerProps = {}) => {
    const { hideWidget, fxaa = true, ...rest } = options

    const token =
      ZCUConfig.getConfig("CESIUM_TOKEN", false) ??
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNjZmNmYzMi1iMWIwLTRlMmEtYWE1OC1mY2U0ZmVmMDk4ZWQiLCJpZCI6MzQyMzcsImlhdCI6MTY5NzIwMzk0MX0.BwX4c-xXJemVGcPhSD2dnntstoLyED9fUaYnoNHLwWM"
    Cesium.Ion.defaultAccessToken = token

    this.viewer = new Cesium.Viewer(container, { ...(hideWidget ? _ViewerUtil.getHideWidgetOption() : null), ...rest })
    cesiumValueHelper.setValue("viewer", this.viewer)

    // @ts-ignore
    hideWidget && (this.viewer.cesiumWidget.creditContainer.style.display = "none")

    // this.viewer.scene.globe.depthTestAgainstTerrain = true

    fxaa && _ViewerUtil.fxaa(this.viewer)

    this.viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("rgba(0,0,0,0)")

    return this.viewer
  }

  setViewer = (viewer: Cesium.Viewer) => {
    this.viewer = viewer
    cesiumValueHelper.setValue("viewer", viewer)
  }

  getViewer = (): Cesium.Viewer | undefined => this.viewer

  getViewerPromise = async (viewer?: Cesium.Viewer) => {
    if (viewer) return viewer
    if (this.viewer) return this.viewer
    return cesiumValueHelper.addListener<Cesium.Viewer>("viewer")
  }

  flyToHome = () => {
    const homeView = ZCUConfig.getConfig("homeView", false)
    homeView && this.viewer?.camera.flyTo(homeView)
  }

  destroy = () => {
    this.viewer?.destroy()
    this.viewer = undefined
    cesiumValueHelper.setValue("viewer", null)
  }
}

export default new ViewerHelper()
