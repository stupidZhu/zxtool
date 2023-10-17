import { ListenValueHelper } from "@zxtool/utils"
import * as Cesium from "cesium"
import { ZCUConfig } from "../util/ZCUConfig"

export const cesiumValueHelper = new ListenValueHelper()

class ViewerHelper {
  private viewer?: Cesium.Viewer

  init = (id: string, options?: Cesium.Viewer.ConstructorOptions) => {
    const token =
      ZCUConfig.getConfig("CESIUM_TOKEN", false) ??
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNjZmNmYzMi1iMWIwLTRlMmEtYWE1OC1mY2U0ZmVmMDk4ZWQiLCJpZCI6MzQyMzcsImlhdCI6MTY5NzIwMzk0MX0.BwX4c-xXJemVGcPhSD2dnntstoLyED9fUaYnoNHLwWM"
    Cesium.Ion.defaultAccessToken = token

    this.viewer = new Cesium.Viewer(id, options)
    cesiumValueHelper.setValue("viewer", this.viewer)

    this.viewer.scene.globe.depthTestAgainstTerrain = true

    // const supportsImageRenderingPixelated = this.viewer.cesiumWidget._supportsImageRenderingPixelated
    // @ts-ignore 是否支持图像渲染像素化处理
    if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
      this.viewer.resolutionScale = window.devicePixelRatio
    }
    this.viewer.scene.postProcessStages.fxaa.enabled = true

    this.viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("rgba(0,0,0,0)")
  }

  setViewer = (viewer: Cesium.Viewer) => {
    this.viewer = viewer
    cesiumValueHelper.setValue("viewer", viewer)
  }

  destroy = () => {
    this.viewer?.destroy()
    this.viewer = undefined
    cesiumValueHelper.setValue("viewer", null)
  }

  getViewer = (): Cesium.Viewer | undefined => this.viewer

  getViewerPromise = () => cesiumValueHelper.addListener<Cesium.Viewer>("viewer")

  flyToHome = () => {
    const homeView = ZCUConfig.getConfig("homeView", false)
    homeView && this.viewer?.camera.flyTo(homeView)
  }
}

export default new ViewerHelper()
