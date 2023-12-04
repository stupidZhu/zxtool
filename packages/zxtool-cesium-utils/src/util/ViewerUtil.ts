import * as Cesium from "cesium"
import { IPrimitive } from "../widget/PrimitiveManager"
import { ViewerHelper } from "../widget/ViewerHelper"
import { ViewerUtilSync } from "./ViewerUtilSync"

const hideWidget = (viewer?: Cesium.Viewer) => {
  setTimeout(() => {
    ViewerHelper.getViewerPromise(viewer).then(ViewerUtilSync.hideWidget)
  })
}

const fxaa = (viewer?: Cesium.Viewer) => {
  ViewerHelper.getViewerPromise(viewer).then(ViewerUtilSync.fxaa)
}

const setSkyBox = ({ viewer, urls }: { viewer?: Cesium.Viewer; urls: string[] }) => {
  ViewerHelper.getViewerPromise(viewer).then(viewer => ViewerUtilSync.setSkyBox(viewer, urls))
}

const getScreenRect = (viewer?: Cesium.Viewer, type: "degree" | "radian" = "degree") => {
  return ViewerHelper.getViewerPromise(viewer).then(viewer => ViewerUtilSync.getScreenRect(viewer, type))
}

const flyToPrimitive = (primitive: IPrimitive, viewer?: Cesium.Viewer) => {
  ViewerHelper.getViewerPromise(viewer).then(viewer => ViewerUtilSync.flyToPrimitive(primitive, viewer))
}

export const ViewerUtil = {
  hideWidget,
  fxaa,
  setSkyBox,
  getScreenRect,
  flyToPrimitive,
}
