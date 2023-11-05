import * as Cesium from "cesium"
import _ViewerUtil from "../_util/_ViewerUtil"
import ViewerHelper from "../widget/ViewerHelper"

const ViewerUtil = {
  hideWidget(viewer?: Cesium.Viewer) {
    setTimeout(() => {
      ViewerHelper.getViewerPromise(viewer).then(_ViewerUtil.hideWidget)
    })
  },
  fxaa(viewer?: Cesium.Viewer) {
    ViewerHelper.getViewerPromise(viewer).then(_ViewerUtil.fxaa)
  },
  setSkyBox({ viewer, urls }: { viewer?: Cesium.Viewer; urls: string[] }) {
    ViewerHelper.getViewerPromise(viewer).then(viewer => _ViewerUtil.setSkyBox(viewer, urls))
  },
}

export default ViewerUtil
