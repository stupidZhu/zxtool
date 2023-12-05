import * as Cesium from "cesium"
import { ViewerHelper } from "../widget/ViewerHelper"
import { EntityUtilSync } from "./EntityUtilSync"

export type IEntities = Cesium.Entity[] | Cesium.DataSource | Cesium.EntityCollection

const getProperties = (entity: Cesium.Entity) => {
  return entity.properties?.getValue(new Cesium.JulianDate()) ?? {}
}

const pickEntity = (windowPosition: Cesium.Cartesian2, viewer?: Cesium.Viewer) => {
  return ViewerHelper.getViewerPromise(viewer).then(viewer => {
    return EntityUtilSync.pickEntity(windowPosition, viewer)
  })
}

const drillPickEntities = (windowPosition: Cesium.Cartesian2, viewer?: Cesium.Viewer) => {
  return ViewerHelper.getViewerPromise(viewer).then(viewer => {
    return EntityUtilSync.drillPickEntities(windowPosition, viewer)
  })
}

const getEntities = (target: IEntities) => {
  if (Array.isArray(target)) return target
  if (target instanceof Cesium.EntityCollection) return target.values
  return target.entities?.values ?? []
}

export const EntityUtil = {
  getProperties,
  pickEntity,
  drillPickEntities,
  getEntities,
}
