import * as Cesium from "cesium"
import { Viewer } from "cesium"
import type { FeatureCollection } from "geojson"
import { IPrimitive } from "../helper/PrimitiveManager"

const getHideWidgetOption = () => {
  return {
    infoBox: false, // 信息窗口
    geocoder: false, // 查询按钮
    homeButton: false, // home按钮
    sceneModePicker: false, // 地图模式
    baseLayerPicker: false, // 图层选择
    navigationHelpButton: false, // 帮助按钮
    animation: false, // 动画控制器
    timeline: false, // 时间轴
    fullscreenButton: false, // 全屏按钮
  }
}

const hideWidget = (viewer: Viewer) => {
  viewer.infoBox.isDestroyed() || viewer.infoBox.destroy()
  viewer.geocoder.isDestroyed() || viewer.geocoder.destroy()
  viewer.homeButton.isDestroyed() || viewer.homeButton.destroy()
  viewer.sceneModePicker.isDestroyed() || viewer.sceneModePicker.destroy()
  viewer.baseLayerPicker.isDestroyed() || viewer.baseLayerPicker.destroy()
  viewer.navigationHelpButton.isDestroyed() || viewer.navigationHelpButton.destroy()
  viewer.animation.isDestroyed() || viewer.animation.destroy()
  viewer.timeline.isDestroyed() || viewer.timeline.destroy()
  viewer.fullscreenButton.isDestroyed() || viewer.fullscreenButton.destroy()
  // @ts-ignore 隐藏 logo
  viewer.cesiumWidget.creditContainer.style.display = "none"
}

const fxaa = (viewer: Viewer) => {
  // const supportsImageRenderingPixelated = viewer.cesiumWidget._supportsImageRenderingPixelated
  // @ts-ignore 是否支持图像渲染像素化处理
  if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
    viewer.resolutionScale = window.devicePixelRatio
  }
  viewer.scene.postProcessStages.fxaa.enabled = true
}

const setSkyBox = (viewer: Viewer, urls: string[]) => {
  viewer.scene.skyBox = new Cesium.SkyBox({
    sources: {
      positiveX: urls[0],
      negativeX: urls[1],
      positiveY: urls[2],
      negativeY: urls[3],
      positiveZ: urls[4],
      negativeZ: urls[5],
    },
  })
}

const getScreenRect = (viewer: Viewer, type: "degree" | "radian" = "degree") => {
  const rect = viewer.camera.computeViewRectangle()
  if (rect) {
    if (type === "radian") return { minx: rect.west, maxx: rect.east, miny: rect.south, maxy: rect.north }
    return {
      minx: Cesium.Math.toDegrees(rect.west),
      maxx: Cesium.Math.toDegrees(rect.east),
      miny: Cesium.Math.toDegrees(rect.south),
      maxy: Cesium.Math.toDegrees(rect.north),
    }
  }

  const canvas = viewer.scene.canvas
  const ellipsoid = viewer.scene.globe.ellipsoid

  const topLeft = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(0, 0), ellipsoid)
  const bottomRight = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(canvas.clientWidth, canvas.clientHeight), ellipsoid)

  const topLeftCartographic = ellipsoid.cartesianToCartographic(topLeft!)
  const bottomRightCartographic = ellipsoid.cartesianToCartographic(bottomRight!)

  if (type === "radian") {
    return {
      minx: topLeftCartographic.longitude,
      maxx: bottomRightCartographic.longitude,
      miny: bottomRightCartographic.latitude,
      maxy: topLeftCartographic.latitude,
    }
  }
  return {
    minx: Cesium.Math.toDegrees(topLeftCartographic.longitude),
    maxx: Cesium.Math.toDegrees(bottomRightCartographic.longitude),
    miny: Cesium.Math.toDegrees(bottomRightCartographic.latitude),
    maxy: Cesium.Math.toDegrees(topLeftCartographic.latitude),
  }
}

const flyToPrimitive = (viewer: Viewer, primitive: IPrimitive) => {
  if (!primitive) return
  if (primitive instanceof Cesium.Primitive) {
    // @ts-ignore
    const boundingSpheres = primitive._boundingSpheres
    if (!boundingSpheres?.length) return
    const boundingSphere = Cesium.BoundingSphere.fromBoundingSpheres(boundingSpheres as any)
    viewer.camera.flyToBoundingSphere(boundingSphere)
    return
  }
  // @ts-ignore
  flyToPrimitive(primitive._primitive, viewer)
}

const getTileLevels = (viewer: Viewer) => {
  const levels = new Set<number>()
  // @ts-ignore
  const tilesToRender = viewer.scene.globe._surface._tilesToRender
  if (Array.isArray(tilesToRender)) {
    tilesToRender.forEach(item => {
      levels.add(item.level)
    })
  }
  return levels
}

export interface GetDataSourceProps {
  viewer: Viewer
  name: string
  autoCreate?: boolean
}

const getCustomDataSource = (props: GetDataSourceProps): Cesium.CustomDataSource | null => {
  const { viewer, name, autoCreate = false } = props
  let dataSource = viewer.dataSources.getByName(name)[0]
  if (!dataSource && autoCreate) {
    dataSource = new Cesium.CustomDataSource(name)
    dataSource.show = true
    viewer.dataSources.add(dataSource)
  }
  return dataSource ?? null
}

const getGeojsonDataSource = (
  props: GetDataSourceProps & { geojson?: string | FeatureCollection },
): Cesium.GeoJsonDataSource | null => {
  const { viewer, name, geojson, autoCreate = false } = props
  let dataSource = viewer.dataSources.getByName(name)[0] as Cesium.GeoJsonDataSource
  if (!dataSource && autoCreate) {
    dataSource = new Cesium.GeoJsonDataSource(name)
    geojson && dataSource.load(geojson)
    dataSource.show = true
    viewer.dataSources.add(dataSource)
  }
  return dataSource ?? null
}

export const ViewerUtil = {
  getHideWidgetOption,
  hideWidget,
  fxaa,
  setSkyBox,
  getScreenRect,
  flyToPrimitive,
  getTileLevels,
  getCustomDataSource,
  getGeojsonDataSource,
}
