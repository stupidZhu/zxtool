import * as Cesium from "cesium"

class CoordHelper {
  private c3: Cesium.Cartesian3 | null = null
  private viewer: Cesium.Viewer

  constructor(viewer: Cesium.Viewer, c3?: Cesium.Cartesian3) {
    this.viewer = viewer
    if (c3) this.c3 = c3
  }

  static translate(c3: Cesium.Cartesian3, xyz: number[]) {
    const matrix = Cesium.Transforms.eastNorthUpToFixedFrame(c3)
    return Cesium.Matrix4.multiplyByPoint(matrix, new Cesium.Cartesian3(...xyz), new Cesium.Cartesian3())
  }

  setFromCartesian3(c3: Cesium.Cartesian3) {
    this.c3 = c3
  }
  setFromLonLatHeight(lonLatHeight: LonLat | LonLatHeight) {
    // @ts-ignore
    this.c3 = Cesium.Cartesian3.fromDegrees(...lonLatHeight)
  }
  setFromScreenCoord(screen: Cesium.Cartesian2) {
    const c3 = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(screen)!, this.viewer.scene)
    if (c3) this.c3 = c3
  }

  getCartesian3() {
    if (!this.c3) throw new Error("[@zxtool/cesium-utils - CoordHelper] 请先设置坐标")
    return this.c3
  }
  getLonLatHeight() {
    if (!this.c3) throw new Error("[@zxtool/cesium-utils - CoordHelper] 请先设置坐标")
    const lonLatHeightRadian = this.getLonLatHeightRadian()
    const lon = Cesium.Math.toDegrees(lonLatHeightRadian[0])
    const lat = Cesium.Math.toDegrees(lonLatHeightRadian[1])
    return [lon, lat, lonLatHeightRadian[2]]
  }
  getLonLatHeightRadian() {
    if (!this.c3) throw new Error("[@zxtool/cesium-utils - CoordHelper] 请先设置坐标")
    const ellipsoid = this.viewer.scene.globe.ellipsoid
    const cartographic = ellipsoid.cartesianToCartographic(this.c3)
    return [cartographic.longitude, cartographic.latitude, cartographic.height]
  }
  getScreenCoord() {
    if (!this.c3) throw new Error("[@zxtool/cesium-utils - CoordHelper] 请先设置坐标")
    return Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, this.c3)
  }

  translate(xyz: number[]) {
    if (!this.c3) throw new Error("[@zxtool/cesium-utils - CoordHelper] 请先设置坐标")
    this.c3 = CoordHelper.translate(this.c3, xyz)
    return this
  }
  setHeight(height: number) {
    if (!this.c3) throw new Error("[@zxtool/cesium-utils - CoordHelper] 请先设置坐标")
  }
}

export default CoordHelper
