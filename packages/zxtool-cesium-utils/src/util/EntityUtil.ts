import * as Cesium from "cesium"

const EntityUtil = {
  getProperties(entity: Cesium.Entity) {
    return entity.properties?.getValue(new Cesium.JulianDate()) ?? {}
  },
}

export default EntityUtil
