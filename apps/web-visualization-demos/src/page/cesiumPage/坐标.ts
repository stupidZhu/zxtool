import { CoordHelper, ScreenEventHelper, ViewerHelper, ViewerUtilSync } from "@zxtool/cesium-utils"
import * as Cesium from "cesium"

const 可复用全排列 = (nums: number[]) => {
  const res: number[][] = []
  const backtrack = (track: number[]) => {
    if (track.length === nums.length) return res.push(track)
    for (let i = 0; i < nums.length; i++) {
      backtrack([...track, nums[i]])
    }
  }
  backtrack([])
  return res
}

export const 世界坐标 = () => {
  const viewer = ViewerHelper.getViewer()!
  const radius = 6378137

  viewer.scene.primitives.add(Cesium.createOsmBuildings({}))

  // viewer.scene.globe.baseColor = new Cesium.Color(0.0, 0.0, 0.0, 1.0)
  viewer.scene.globe.translucency.enabled = true
  viewer.scene.globe.translucency.frontFaceAlpha = 0.8
  // viewer.scene.globe.translucency.backFaceAlpha = 1

  const POINTS: Record<string, { color: string; points: Array<number[]> }> = {
    x0: { color: "pink", points: [] },
    y0: { color: "gold", points: [] },
    z0: { color: "skyblue", points: [] },
    other: { color: "teal", points: [] },
  }

  POINTS.other.points.push(...可复用全排列([0, radius, -radius]))

  for (let i = 0.1; i < Math.PI * 2; i += 0.1) {
    POINTS.x0.points.push([0, Math.sin(i) * radius, Math.cos(i) * radius])
    POINTS.y0.points.push([Math.sin(i) * radius, 0, Math.cos(i) * radius])
    POINTS.z0.points.push([Math.sin(i) * radius, Math.cos(i) * radius, 0])
  }

  Object.values(POINTS).forEach(({ color, points }) => {
    points.forEach(p => {
      viewer.entities.add({
        position: new Cesium.Cartesian3(...p),
        point: {
          pixelSize: 10,
          color: Cesium.Color.fromCssColorString(color),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          // disableDepthTestDistance: Infinity,
        },
        // label: {
        //   text: `${p.x} , ${p.y} , ${p.z}`,
        //   font: "14px sans-serif",
        //   pixelOffset: new Cesium.Cartesian2(15, -15),
        // },
      })
    })
  })

  console.log(viewer.scene.globe.ellipsoid)
}

export const 转坐标 = () => {
  const viewer = ViewerHelper.getViewer()!
  const coordHelper = new CoordHelper(viewer)
  const dataSource = ViewerUtilSync.getCustomDataSource({ name: "test", viewer, autoCreate: true })!
  const drawPoint = (c3: Cesium.Cartesian3) => {
    dataSource.entities.add({
      position: c3,
      point: {
        pixelSize: 5,
        color: Cesium.Color.TEAL,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },
    })
  }

  ScreenEventHelper.addEvent({
    key: "click",
    type: "LEFT_CLICK",
    cb(movement) {
      coordHelper.setFromScreenCoord(movement.position)
      drawPoint(coordHelper.getCartesian3())

      coordHelper.translate([20, 20, 20])
      drawPoint(coordHelper.getCartesian3())

      coordHelper.setHeight(10)
      drawPoint(coordHelper.getCartesian3())
    },
  })
}
