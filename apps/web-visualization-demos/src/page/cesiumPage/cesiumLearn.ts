import { ViewerHelper } from "@zxtool/cesium-utils"
import * as Cesium from "cesium"
import GUI from "lil-gui"
import { tilesetManager } from "src/bootstrap"

export const cesiumFlightTracker = async () => {
  const viewer = ViewerHelper.getViewer()!
  const terrainProvider = await Cesium.createWorldTerrainAsync({ requestVertexNormals: true, requestWaterMask: true })
  viewer.scene.terrainProvider = terrainProvider
  const buildingsTileset = await Cesium.createOsmBuildingsAsync()
  viewer.scene.primitives.add(buildingsTileset)

  async function addBuildingGeoJSON() {
    const geoJSONURL = await Cesium.IonResource.fromAssetId(2352144)
    const geoJSON = await Cesium.GeoJsonDataSource.load(geoJSONURL, { clampToGround: true })
    const dataSource = await viewer.dataSources.add(geoJSON)
    for (const entity of dataSource.entities.values) {
      // @ts-ignore
      entity.polygon.classificationType = Cesium.ClassificationType.TERRAIN
    }
  }
  addBuildingGeoJSON()

  buildingsTileset.style = new Cesium.Cesium3DTileStyle({
    show: {
      conditions: [
        ["${elementId} === 332469316", false],
        ["${elementId} === 332469317", false],
        ["${elementId} === 235368665", false],
        ["${elementId} === 530288180", false],
        ["${elementId} === 530288179", false],
        ["${elementId} === 532245203", false],
        [true, true],
      ],
    },
    // color: "Boolean(${feature['cesium#color']}) ? color(${feature['cesium#color']}) : color('#ffffff')",
  })

  // 新版本可用
  // const newBuildingTileset = await Cesium.Cesium3DTileset.fromIonAssetId(2352154);
  // viewer.scene.primitives.add(newBuildingTileset);

  tilesetManager.add({ url: 2352154, key: "2352154" }).then(({ tileset }) => {
    console.log(tileset)
    viewer.flyTo(tileset)

    const gui = new GUI()
    gui.add(tileset, "show")
  })
}
