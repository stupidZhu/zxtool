import { Num3 } from "@zxtool/utils"
import * as Cesium from "cesium"
import { Cartesian2, Cartesian3, Viewer } from "cesium"
import { LonLat, LonLatHeight } from "../type"
import { genZCUInfo } from "../util/util"

const genInfo = genZCUInfo("CoordHelper")
const noCoordInfo = genInfo("请先设置坐标")

export type Local2FixedFunc =
  | "northEastDownToFixedFrame"
  | "northUpEastToFixedFrame"
  | "northWestUpToFixedFrame"
  | "eastNorthUpToFixedFrame"

export class CoordHelper {
  private c3: Cartesian3 | null = null
  private viewer: Viewer

  constructor(viewer: Viewer, c3?: Cartesian3) {
    this.viewer = viewer
    if (c3) this.c3 = c3
  }

  static c32lonLatHeight(c3: Cartesian3, viewer?: Viewer) {
    const lonLatHeightRadian = CoordHelper.c32lonLatHeightRadian(c3, viewer)
    const lon = Cesium.Math.toDegrees(lonLatHeightRadian[0])
    const lat = Cesium.Math.toDegrees(lonLatHeightRadian[1])
    return [lon, lat, lonLatHeightRadian[2]] as Num3
  }
  static lonLatHeight2c3(lonLatHeight: LonLat | LonLatHeight, viewer?: Viewer) {
    const ellipsoid = viewer?.scene.globe.ellipsoid ?? Cesium.Ellipsoid.WGS84
    return Cartesian3.fromDegrees(...(lonLatHeight as Num3), ellipsoid)
  }

  static c32lonLatHeightRadian(c3: Cartesian3, viewer?: Viewer) {
    const ellipsoid = viewer?.scene.globe.ellipsoid ?? Cesium.Ellipsoid.WGS84
    const cartographic = Cesium.Cartographic.fromCartesian(c3, ellipsoid)
    // const cartographic = ellipsoid.cartesianToCartographic(c3)
    return [cartographic.longitude, cartographic.latitude, cartographic.height] as Num3
  }
  static lonLatHeightRadian2c3(lonLatHeight: LonLat | LonLatHeight, viewer?: Viewer) {
    const ellipsoid = viewer?.scene.globe.ellipsoid ?? Cesium.Ellipsoid.WGS84
    return Cartesian3.fromRadians(...(lonLatHeight as Num3), ellipsoid)
  }

  static c32screenCoord(c3: Cartesian3, viewer: Viewer) {
    return Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, c3)
  }
  /** 从地球上选点 */
  static screenCoord2c3(coord: Cartesian2, viewer: Viewer) {
    // viewer.camera.pickEllipsoid(coord, viewer.scene.globe.ellipsoid)
    return viewer.scene.globe.pick(viewer.camera.getPickRay(coord)!, viewer.scene) ?? null
  }
  /** 从 scene 上选点, 包括倾斜和地形等 */
  static screenCoord2sceneC3(coord: Cartesian2, viewer: Viewer) {
    return viewer.scene.pickPosition(coord)
  }

  static local2fixed(
    local: Cartesian3,
    origin: Cartesian3,
    func: Local2FixedFunc = "eastNorthUpToFixedFrame",
    viewer?: Viewer,
  ) {
    const ellipsoid = viewer?.scene.globe.ellipsoid ?? Cesium.Ellipsoid.WGS84
    const transform = Cesium.Transforms[func](origin, ellipsoid)
    return Cesium.Matrix4.multiplyByPoint(transform, local, new Cartesian3())
  }
  static fixed2local(
    fixed: Cartesian3,
    origin: Cartesian3,
    func: Local2FixedFunc = "eastNorthUpToFixedFrame",
    viewer?: Viewer,
  ) {
    const ellipsoid = viewer?.scene.globe.ellipsoid ?? Cesium.Ellipsoid.WGS84
    const transform = Cesium.Matrix4.inverseTransformation(Cesium.Transforms[func](origin, ellipsoid), new Cesium.Matrix4())
    return Cesium.Matrix4.multiplyByPoint(transform, fixed, new Cartesian3())
  }

  static translate(c3: Cartesian3, xyz: Cartesian3, viewer?: Viewer) {
    return CoordHelper.local2fixed(xyz, c3, undefined, viewer)
  }
  static setHeight(c3: Cartesian3, height: number, viewer?: Viewer) {
    const coord = CoordHelper.c32lonLatHeightRadian(c3, viewer)
    coord[2] = height
    return CoordHelper.lonLatHeightRadian2c3(coord)
  }

  setFromC3(c3: Cartesian3) {
    this.c3 = c3
    return this
  }
  setFromLonLatHeight(lonLatHeight: LonLat | LonLatHeight) {
    this.c3 = CoordHelper.lonLatHeight2c3(lonLatHeight, this.viewer)
    return this
  }
  setFromLonLatHeightRadius(lonLatHeight: LonLat | LonLatHeight) {
    this.c3 = CoordHelper.lonLatHeightRadian2c3(lonLatHeight, this.viewer)
    return this
  }
  /** 从地球上选点 */
  setFromScreenCoord(coord: Cartesian2) {
    this.c3 = CoordHelper.screenCoord2c3(coord, this.viewer)
    return this
  }
  /** 从 scene 上选点, 包括倾斜和地形等 */
  setFromSceneScreenCoord(coord: Cartesian2) {
    this.c3 = CoordHelper.screenCoord2sceneC3(coord, this.viewer)
    return this
  }

  getC3() {
    if (!this.c3) throw new Error(noCoordInfo)
    return this.c3
  }
  getLonLatHeight() {
    if (!this.c3) throw new Error(noCoordInfo)
    return CoordHelper.c32lonLatHeight(this.c3, this.viewer)
  }
  getLonLatHeightRadian() {
    if (!this.c3) throw new Error(noCoordInfo)
    return CoordHelper.c32lonLatHeightRadian(this.c3, this.viewer)
  }
  getScreenCoord() {
    if (!this.c3) throw new Error(noCoordInfo)
    return CoordHelper.c32screenCoord(this.c3, this.viewer)
  }

  translate(xyz: Cartesian3) {
    if (!this.c3) throw new Error(noCoordInfo)
    this.c3 = CoordHelper.translate(this.c3, xyz, this.viewer)
    return this
  }
  setHeight(height: number) {
    if (!this.c3) throw new Error(noCoordInfo)
    this.c3 = CoordHelper.setHeight(this.c3, height, this.viewer)
    return this
  }
}
