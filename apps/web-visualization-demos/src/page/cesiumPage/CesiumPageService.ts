import { CommonUtil, ViewerHelper } from "@zxtool/cesium-utils"
import { EmitterHelper } from "@zxtool/utils"
import * as Cesium from "cesium"
import { primitiveV } from "./primitive"

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

    // this.init()
  }

  moduleExit() {}

  init() {
    const viewer = ViewerHelper.getViewer()!
    viewer.scene.debugShowFramesPerSecond = true
    // viewer.scene.debugShowFrustumPlanes = true
    // viewer.scene.debugShowFrustums = true
    // viewer.scene.debugShowCommands = true

    // initCameraGUI()
    // 世界坐标()

    // primitive基础()
    // fabric基础()
    // shader基础()
    primitiveV()

    // 加载geojson()

    // 芜湖起飞()

    // 加载3DTiles()
    // 偏移矩阵()
    // 点云()

    // cesiumFlightTracker()

    // 粒子初步()
  }
}

export default new CesiumPageService()

const emitter = new EmitterHelper({ maxCount: { history: 1 } })
class VService {
  v?: number
  key = Symbol()

  updateV() {
    if (this.v) this.v++
    else this.v = 1
    emitter.emit(this.key, this.v)
  }

  destroy() {
    this.v = undefined
    emitter.clearHistory()
  }

  getVAsync() {
    const { promise, reject } = emitter.onceAsync(this.key, true)
    setTimeout(() => reject("timeout"), 2000)
    return promise
  }

  log() {
    console.log(emitter)
  }
}

export const vService = new VService()
