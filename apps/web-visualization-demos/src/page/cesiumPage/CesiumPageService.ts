import { CommonUtil, TilesetManager, ViewerHelper } from "@zxtool/cesium-utils"
import * as Cesium from "cesium"
import { 不同的Primitive } from "./primitive"
import "./worker"

class CesiumPageService {
  moduleEnter() {
    CommonUtil.enableIframe()
    const viewer = ViewerHelper.getViewer()!
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(120.65187, 31.145227, 10000),
    })
    viewer.scene.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        url: "//map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
      }),
    )

    // this.loadTileset()
    // this.init()
  }

  moduleExit() {}

  init() {
    const viewer = ViewerHelper.getViewer()!
    viewer.scene.debugShowFramesPerSecond = true

    // initCameraGUI()
    // 世界坐标()

    // primitive基础()
    // fabric基础()
    // shader基础()
    // primitiveV()
    不同的Primitive()

    // 加载geojson()

    // 芜湖起飞()

    // 加载3DTiles()
    // 偏移矩阵()
    // 点云()

    // cesiumFlightTracker()

    // 粒子初步()
  }

  loadTileset() {
    TilesetManager.add({ url: 2373086, flyTo: true, name: "dyt" }).then(() => {
      console.log(TilesetManager.getListByCondition({ name: "dyt" }), TilesetManager)
    })
    ViewerHelper.getViewer()!.scene.setTerrain(new Cesium.Terrain(Cesium.CesiumTerrainProvider.fromIonAssetId(2373160)))
  }
}

export default new CesiumPageService()
