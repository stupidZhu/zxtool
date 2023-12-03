import { ViewerHelper } from "@zxtool/cesium-utils"
import * as Cesium from "cesium"
import planeData from "src/assets/plane.json"

export const 芜湖起飞 = async () => {
  const viewer = ViewerHelper.getViewer()!
  const terrainProvider = await Cesium.createWorldTerrainAsync({ requestVertexNormals: true, requestWaterMask: true })
  viewer.scene.terrainProvider = terrainProvider
  const buildingsTileset = await Cesium.createOsmBuildingsAsync()
  viewer.scene.primitives.add(buildingsTileset)

  const interval = 30
  const totalTime = (planeData.length - 1) * interval
  const startTime = Cesium.JulianDate.fromDate(new Date("2023-01-01 00:00:00"))
  const endTime = Cesium.JulianDate.addSeconds(startTime, totalTime, new Cesium.JulianDate())

  viewer.clock.startTime = startTime
  viewer.clock.stopTime = endTime
  viewer.clock.currentTime = startTime
  viewer.timeline.zoomTo(startTime, endTime)

  const sampledPositionProperty = new Cesium.SampledPositionProperty()

  planeData.forEach((data, index) => {
    const time = Cesium.JulianDate.addSeconds(startTime, index * interval, new Cesium.JulianDate())
    const position = Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude, data.height)
    sampledPositionProperty.addSample(time, position)

    viewer.entities.add({
      position,
      point: {
        pixelSize: 3,
        color: Cesium.Color.TEAL,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1,
      },
    })
  })

  const plane = viewer.entities.add({
    position: sampledPositionProperty,
    model: { uri: "/model/plane.glb", minimumPixelSize: 64 },
    path: new Cesium.PathGraphics({ width: 3 }),
    availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({ start: startTime, stop: endTime })]),
    orientation: new Cesium.VelocityOrientationProperty(sampledPositionProperty),
  })

  // viewer.trackedEntity = plane

  viewer.flyTo(plane)
}
