import * as Cesium from "cesium"

const _ViewerUtil = {
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
}

export default _ViewerUtil
