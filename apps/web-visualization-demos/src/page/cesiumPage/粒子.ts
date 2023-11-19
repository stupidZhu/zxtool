import { ViewerHelper } from "@zxtool/cesium-utils"
import * as Cesium from "cesium"

export const 粒子初步 = () => {
  const viewer = ViewerHelper.getViewer()!
  viewer.scene.globe.depthTestAgainstTerrain = false

  const gravityVector = new Cesium.Cartesian3()
  const gravity = -(9.8 * 9.8)
  function applyGravity(p, dt) {
    // Compute a local up vector for each particle in geocentric space.
    const position = p.position

    Cesium.Cartesian3.normalize(position, gravityVector)
    Cesium.Cartesian3.multiplyByScalar(gravityVector, gravity * dt, gravityVector)

    p.velocity = Cesium.Cartesian3.add(p.velocity, gravityVector, p.velocity)
  }

  const point = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(100, 21, 0),
    point: {
      pixelSize: 5,
      color: Cesium.Color.TEAL,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
  })

  const particleSystem = new Cesium.ParticleSystem({
    image: "/img/smoke.png",
    imageSize: new Cesium.Cartesian2(20, 20),
    startScale: 0.5,
    endScale: 20,
    startColor: Cesium.Color.RED,
    endColor: Cesium.Color.YELLOW,
    maximumSpeed: 5,
    minimumSpeed: 2,
    maximumParticleLife: 3,
    minimumParticleLife: 1,
    maximumMass: 2,
    minimumMass: 0.5,
    modelMatrix: point.computeModelMatrix(viewer.clock.startTime, new Cesium.Matrix4()),
    lifetime: 10,
    emissionRate: 10.0,
    emitter: new Cesium.CircleEmitter(0.01),
    // emitter: new Cesium.BoxEmitter(new Cesium.Cartesian3(0.5, 0.5, 0.5)),
    // emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(30.0)),
    // emitter: new Cesium.SphereEmitter(5.0),
    bursts: [
      new Cesium.ParticleBurst({ time: 5.0, minimum: 30, maximum: 50 }),
      new Cesium.ParticleBurst({ time: 10.0, minimum: 5, maximum: 10 }),
      new Cesium.ParticleBurst({ time: 15.0, minimum: 20, maximum: 30 }),
    ],
    // updateCallback: applyGravity,
  })

  viewer.scene.primitives.add(particleSystem)

  viewer.flyTo(point)
}
