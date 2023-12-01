import * as Cesium from "cesium"

export const ViewerUtilSync = {
  getHideWidgetOption() {
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
  },
  hideWidget(viewer: Cesium.Viewer) {
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
  },
  fxaa(viewer: Cesium.Viewer) {
    // const supportsImageRenderingPixelated = viewer.cesiumWidget._supportsImageRenderingPixelated
    // @ts-ignore 是否支持图像渲染像素化处理
    if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
      viewer.resolutionScale = window.devicePixelRatio
    }
    viewer.scene.postProcessStages.fxaa.enabled = true
  },
  setSkyBox(viewer: Cesium.Viewer, urls: string[]) {
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
  },
  getScreenRect(viewer: Cesium.Viewer, type: "degree" | "radian" = "degree") {
    const rect = viewer.scene.camera.computeViewRectangle()
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
    const bottomRight = viewer.camera.pickEllipsoid(
      new Cesium.Cartesian2(canvas.clientWidth, canvas.clientHeight),
      ellipsoid,
    )

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
  },
}
