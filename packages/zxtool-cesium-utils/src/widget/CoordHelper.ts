import { Num3 } from "@zxtool/utils"
import * as Cesium from "cesium"
import { LonLat, LonLatHeight } from "../type"
import { genZCUInfo } from "../util"

const genInfo = genZCUInfo("CoordHelper")
const noCoordInfo = genInfo("请先设置坐标")

export class CoordHelper {
  private c3: Cesium.Cartesian3 | null = null
  private viewer: Cesium.Viewer

  constructor(viewer: Cesium.Viewer, c3?: Cesium.Cartesian3) {
    this.viewer = viewer
    if (c3) this.c3 = c3
  }

  static translate(c3: Cesium.Cartesian3, xyz: number[]) {
    return Cesium.Matrix4.multiplyByPoint(
      Cesium.Transforms.eastNorthUpToFixedFrame(c3),
      new Cesium.Cartesian3(...xyz),
      new Cesium.Cartesian3(),
    )
  }

  setFromCartesian3(c3: Cesium.Cartesian3) {
    this.c3 = c3
    return this
  }
  setFromLonLatHeight(lonLatHeight: LonLat | LonLatHeight) {
    this.c3 = Cesium.Cartesian3.fromDegrees(...(lonLatHeight as Num3))
    return this
  }
  setFromLonLatHeightRadius(lonLatHeight: LonLat | LonLatHeight) {
    this.c3 = Cesium.Cartesian3.fromRadians(...(lonLatHeight as Num3))
    return this
  }
  setFromScreenCoord(screen: Cesium.Cartesian2) {
    const c3 = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(screen)!, this.viewer.scene)
    if (c3) this.c3 = c3
    return this
  }

  getCartesian3() {
    if (!this.c3) throw new Error(noCoordInfo)
    return this.c3
  }
  getLonLatHeight() {
    if (!this.c3) throw new Error(noCoordInfo)
    const lonLatHeightRadian = this.getLonLatHeightRadian()
    const lon = Cesium.Math.toDegrees(lonLatHeightRadian[0])
    const lat = Cesium.Math.toDegrees(lonLatHeightRadian[1])
    return [lon, lat, lonLatHeightRadian[2]] as Num3
  }
  getLonLatHeightRadian() {
    if (!this.c3) throw new Error(noCoordInfo)
    const ellipsoid = this.viewer.scene.globe.ellipsoid
    const cartographic = ellipsoid.cartesianToCartographic(this.c3)
    return [cartographic.longitude, cartographic.latitude, cartographic.height] as Num3
  }
  getScreenCoord() {
    if (!this.c3) throw new Error(noCoordInfo)
    return Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, this.c3)
  }

  translate(xyz: number[]) {
    if (!this.c3) throw new Error(noCoordInfo)
    this.c3 = CoordHelper.translate(this.c3, xyz)
    return this
  }
  setHeight(height: number) {
    if (!this.c3) throw new Error(noCoordInfo)
    const coord = this.getLonLatHeightRadian()
    coord[2] = height
    this.setFromLonLatHeightRadius(coord)
    return this
  }
}
