import * as Cesium from "cesium"
import _EntityUtil from "../_util/_EntityUtil"
import ViewerHelper from "../widget/ViewerHelper"

const EntityUtil = {
  getProperties(entity: Cesium.Entity) {
    return entity.properties?.getValue(new Cesium.JulianDate()) ?? {}
  },
  pickEntity(windowPosition: Cesium.Cartesian2, viewer?: Cesium.Viewer) {
    return ViewerHelper.getViewerPromise(viewer).then(viewer => {
      return _EntityUtil.pickEntitySync(windowPosition, viewer)
    })
  },
  drillPickEntities(windowPosition: Cesium.Cartesian2, viewer?: Cesium.Viewer) {
    return ViewerHelper.getViewerPromise(viewer).then(viewer => {
      return _EntityUtil.drillPickEntitiesSync(windowPosition, viewer)
    })
  },
  ..._EntityUtil,
}

export default EntityUtil
