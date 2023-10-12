import { ListenValueHelper } from "@zxtool/utils"
import * as Cesium from "cesium"

export const cesiumValueHelper = new ListenValueHelper()

class ViewerHelper {
  private viewer?: Cesium.Viewer

  init = (id: string) => {
    this.viewer = new Cesium.Viewer(id)
    cesiumValueHelper.setValue("viewer", this.viewer)

    this.viewer.scene.globe.depthTestAgainstTerrain = true
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
}

export default new ViewerHelper()
