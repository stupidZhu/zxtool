import { ScreenEventHelper, ViewerHelper } from "@zxtool/cesium-utils"
import * as Cesium from "cesium"

export const primitive基础 = () => {
  const viewer = ViewerHelper.getViewer()!

  const boxGeom = new Cesium.BoxGeometry({
    // vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
    vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
    maximum: new Cesium.Cartesian3(250000, 250000, 250000),
    minimum: new Cesium.Cartesian3(-250000, -250000, -250000),
  })

  const boxInstance = new Cesium.GeometryInstance({
    geometry: boxGeom,
    modelMatrix: Cesium.Matrix4.multiplyByTranslation(
      Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(0, 0)),
      new Cesium.Cartesian3(0.0, 0.0, 250000),
      new Cesium.Matrix4(),
    ),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED),
    },
  })

  const primitive = new Cesium.Primitive({
    geometryInstances: boxInstance,
    appearance: new Cesium.PerInstanceColorAppearance({
      closed: true,
    }),
  })
  viewer.scene.primitives.add(primitive)

  // ----------------------- RECT
  const rectGeom = new Cesium.RectangleGeometry({
    rectangle: Cesium.Rectangle.fromDegrees(0, 0, 10, 10),
  })
  const rectGeomInstance = new Cesium.GeometryInstance({
    id: "rectGeomInstance",
    geometry: rectGeom,
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.TEAL),
    },
  })
  const appearance = new Cesium.PerInstanceColorAppearance({
    flat: true,
  })
  const rectPrimitive = new Cesium.Primitive({
    geometryInstances: rectGeomInstance,
    appearance,
  })
  viewer.scene.primitives.add(rectPrimitive)

  setInterval(() => {
    rectPrimitive.getGeometryInstanceAttributes("rectGeomInstance").color = Cesium.ColorGeometryInstanceAttribute.toValue(
      Cesium.Color.fromRandom(),
    )
  }, 2000)

  // ----------------------- Entity

  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(20, 20),
    point: {
      pixelSize: 10,
      color: Cesium.Color.fromCssColorString("pink"),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
  })

  // ----------------------- Event

  ScreenEventHelper.addEvent({
    key: "test",
    type: "LEFT_CLICK",
    cb(movement) {
      const pickedObject = viewer.scene.pick(movement.position)
      console.log(pickedObject)
    },
  })
}
