import { ViewerHelper } from "@zxtool/cesium-utils"
import { LoaderUtil, SyncCesiumPlugin } from "@zxtool/three-utils"
import { Num2 } from "@zxtool/utils"
import * as Cesium from "cesium"
import { threeHelper } from "src/bootstrap"
import * as THREE from "three"

const minWGS84 = [115.23, 39.55]
const maxWGS84 = [116.23, 41.55]

const bottomLeft: Num2 = [minWGS84[0], minWGS84[1]]
const topLeft: Num2 = [minWGS84[0], maxWGS84[1]]

/**
 *  three的坐标系（右手坐标系），关键数据结构 Vector3
 *    Y
 *    |
 *    |___ X
 *   /
 * Z
 *
 * Cesium的坐标系，关键数据结构 Cartesian3
 *    Z
 *    |
 *    |__ Y
 *   /
 * X
 *
 */

const calcPosition = (position: Cesium.Cartesian3, lookAtPosition: Cesium.Cartesian3) => {
  const up = Cesium.Cartesian3.subtract(position, new Cesium.Cartesian3(0, 0, 0), new Cesium.Cartesian3())
  const lookAt = Cesium.Cartesian3.subtract(position, lookAtPosition, new Cesium.Cartesian3())
  return {
    position,
    up: Cesium.Cartesian3.normalize(up, new Cesium.Cartesian3()),
    lookAt: Cesium.Cartesian3.normalize(lookAt, new Cesium.Cartesian3()),
  }
}

const cartToVec = function (cart: Cesium.Cartesian3) {
  return new THREE.Vector3(cart.x, cart.y, cart.z)
}

export const 结合1 = async () => {
  const viewer = ViewerHelper.getViewer()!
  threeHelper.add(new SyncCesiumPlugin(viewer))
  const scene = threeHelper.getWidget("scene")!

  const entity = viewer.entities.add({
    name: "Polygon",
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray([
        minWGS84[0],
        minWGS84[1],
        maxWGS84[0],
        minWGS84[1],
        maxWGS84[0],
        maxWGS84[1],
        minWGS84[0],
        maxWGS84[1],
      ]),
      material: Cesium.Color.RED.withAlpha(0.2),
    },
  })
  viewer.flyTo(entity)

  const group = new THREE.Group()
  scene.add(group)

  const Amlight = new THREE.AmbientLight(0xffffff, 2)
  scene.add(Amlight)

  const geometry = new THREE.BoxGeometry(1, 2, 4)
  const mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }))
  const scaleSize = 15000
  mesh.scale.set(scaleSize, scaleSize, scaleSize)
  mesh.position.z += 15000.0
  group.add(mesh)

  LoaderUtil.loadGLTF("/model/parrot.glb").then(gltf => {
    const scaleSize = 1500
    gltf.scene.scale.set(scaleSize, scaleSize, scaleSize)
    gltf.scene.position.z += 15000.0
    gltf.scene.rotation.x = Math.PI / 2
    group.add(gltf.scene)
  })

  const center = Cesium.Cartesian3.fromDegrees((minWGS84[0] + maxWGS84[0]) / 2, (minWGS84[1] + maxWGS84[1]) / 2)
  const centerHigh = Cesium.Cartesian3.fromDegrees((minWGS84[0] + maxWGS84[0]) / 2, (minWGS84[1] + maxWGS84[1]) / 2, 1)
  const bottomLeft = cartToVec(Cesium.Cartesian3.fromDegrees(minWGS84[0], minWGS84[1]))
  const topLeft = cartToVec(Cesium.Cartesian3.fromDegrees(minWGS84[0], maxWGS84[1]))
  const latDir = new THREE.Vector3().subVectors(bottomLeft, topLeft).normalize()
  group.position.copy(center)
  group.up.copy(latDir)
  group.lookAt(centerHigh.x, centerHigh.y, centerHigh.z)
}
