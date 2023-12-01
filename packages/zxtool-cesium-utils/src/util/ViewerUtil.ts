import * as Cesium from "cesium"
import ViewerHelper from "../widget/ViewerHelper"
import { ViewerUtilSync } from "./ViewerUtilSync"

export const ViewerUtil = {
  hideWidget(viewer?: Cesium.Viewer) {
    setTimeout(() => {
      ViewerHelper.getViewerPromise(viewer).then(ViewerUtilSync.hideWidget)
    })
  },
  fxaa(viewer?: Cesium.Viewer) {
    ViewerHelper.getViewerPromise(viewer).then(ViewerUtilSync.fxaa)
  },
  setSkyBox({ viewer, urls }: { viewer?: Cesium.Viewer; urls: string[] }) {
    ViewerHelper.getViewerPromise(viewer).then(viewer => ViewerUtilSync.setSkyBox(viewer, urls))
  },
  getScreenRect(viewer?: Cesium.Viewer, type: "degree" | "radian" = "degree") {
    return ViewerHelper.getViewerPromise(viewer).then(viewer => ViewerUtilSync.getScreenRect(viewer, type))
  },
}
