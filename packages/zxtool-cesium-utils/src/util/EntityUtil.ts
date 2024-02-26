import * as Cesium from "cesium"

export type IEntities = Cesium.Entity[] | Cesium.DataSource | Cesium.EntityCollection

const getProperties = (entity: Cesium.Entity) => {
  return entity.properties?.getValue(new Cesium.JulianDate()) ?? {}
}

const getEntities = (target: IEntities) => {
  if (Array.isArray(target)) return target
  if (target instanceof Cesium.EntityCollection) return target.values
  return target.entities?.values ?? []
}

export const EntityUtil = {
  getProperties,
  getEntities,
}
