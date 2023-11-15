import * as Cesium from "cesium"

const _EntityUtil = {
  pickEntitySync(windowPosition: Cesium.Cartesian2, viewer: Cesium.Viewer) {
    const picked = viewer.scene.pick(windowPosition)
    if (!Cesium.defined(picked)) return null

    const id = Cesium.defaultValue(picked.id, picked.primitive.id)
    if (id instanceof Cesium.Entity) return id
    return null
  },
  drillPickEntitiesSync(windowPosition: Cesium.Cartesian2, viewer: Cesium.Viewer) {
    let picked, entity
    const pickedPrimitives = viewer.scene.drillPick(windowPosition)
    const length = pickedPrimitives.length
    const result = []
    const hash = {}

    for (let i = 0; i < length; i++) {
      picked = pickedPrimitives[i]
      entity = Cesium.defaultValue(picked.id, picked.primitive.id)
      if (entity instanceof Cesium.Entity && !Cesium.defined(hash[entity.id])) {
        result.push(entity)
        hash[entity.id] = true
      }
    }
    return result
  },
}

export default _EntityUtil
