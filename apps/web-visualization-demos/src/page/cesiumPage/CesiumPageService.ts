import { CommonUtil } from "@zxtool/cesium-utils"
import { 加载3DTiles } from "./3DTiles"

class CesiumPageService {
  moduleEnter() {
    CommonUtil.enableIframe()
    this.init()
  }

  moduleExit() {}

  init() {
    // initCameraGUI()
    // 世界坐标()

    // primitive基础()
    // fabric基础()
    // shader基础()

    // 加载geojson()

    // 芜湖起飞()

    加载3DTiles()
    // 偏移矩阵()

    // cesiumFlightTracker()
  }
}

export default new CesiumPageService()
