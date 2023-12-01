import * as Cesium from "cesium"
import ViewerHelper from "../widget/ViewerHelper"
import { EntityUtilSync } from "./EntityUtilSync"

export const EntityUtil = {
  getProperties(entity: Cesium.Entity) {
    return entity.properties?.getValue(new Cesium.JulianDate()) ?? {}
  },
  pickEntity(windowPosition: Cesium.Cartesian2, viewer?: Cesium.Viewer) {
    return ViewerHelper.getViewerPromise(viewer).then(viewer => {
      return EntityUtilSync.pickEntity(windowPosition, viewer)
    })
  },
  drillPickEntities(windowPosition: Cesium.Cartesian2, viewer?: Cesium.Viewer) {
    return ViewerHelper.getViewerPromise(viewer).then(viewer => {
      return EntityUtilSync.drillPickEntities(windowPosition, viewer)
    })
  },
}
