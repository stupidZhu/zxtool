import * as Cesium from "cesium"
import type { FeatureCollection } from "geojson"
import { IPrimitive } from "../widget/PrimitiveManager"
import { ViewerHelper } from "../widget/ViewerHelper"
import { ViewerUtilSync } from "./ViewerUtilSync"

const hideWidget = (viewer?: Cesium.Viewer) => {
  setTimeout(() => {
    ViewerHelper.getViewerPromise(undefined, viewer).then(ViewerUtilSync.hideWidget)
  })
}

const fxaa = (viewer?: Cesium.Viewer) => {
  ViewerHelper.getViewerPromise(undefined, viewer).then(ViewerUtilSync.fxaa)
}

const setSkyBox = ({ viewer, urls }: { viewer?: Cesium.Viewer; urls: string[] }) => {
  ViewerHelper.getViewerPromise(undefined, viewer).then(viewer => ViewerUtilSync.setSkyBox(viewer, urls))
}

const getScreenRect = (viewer?: Cesium.Viewer, type: "degree" | "radian" = "degree") => {
  return ViewerHelper.getViewerPromise(undefined, viewer).then(viewer => ViewerUtilSync.getScreenRect(viewer, type))
}

const flyToPrimitive = (primitive: IPrimitive, viewer?: Cesium.Viewer) => {
  ViewerHelper.getViewerPromise(undefined, viewer).then(viewer => ViewerUtilSync.flyToPrimitive(primitive, viewer))
}

interface GetDataSourceProps {
  viewer?: Cesium.Viewer
  name: string
  autoCreate?: boolean
}

const getCustomDataSource = (props: GetDataSourceProps) => {
  const { viewer, ...rest } = props
  return ViewerHelper.getViewerPromise(undefined, viewer).then(viewer =>
    ViewerUtilSync.getCustomDataSource({ viewer, ...rest }),
  )
}

const getGeojsonDataSource = (props: GetDataSourceProps & { geojson?: string | FeatureCollection }) => {
  const { viewer, ...rest } = props
  return ViewerHelper.getViewerPromise(undefined, viewer).then(viewer =>
    ViewerUtilSync.getGeojsonDataSource({ viewer, ...rest }),
  )
}

export const ViewerUtil = {
  hideWidget,
  fxaa,
  setSkyBox,
  getScreenRect,
  flyToPrimitive,
  getCustomDataSource,
  getGeojsonDataSource,
}
