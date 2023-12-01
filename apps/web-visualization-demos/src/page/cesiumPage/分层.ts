import { MassivePointsHelper, RECT, ViewerHelper, ViewerUtilSync } from "@zxtool/cesium-utils"
import * as Cesium from "cesium"

const { getScreenRect } = ViewerUtilSync

let MPH: MassivePointsHelper | null = null

const genMassivePoints = (nums: number, rect: RECT) => {
  const { minx, maxx, miny, maxy } = rect
  return Array.from(Array(nums), (_, i) => {
    return {
      key: i,
      lonLat: [Math.random() * (maxx - minx) + minx, Math.random() * (maxy - miny) + miny],
    }
  })
}

export const 添加分层 = () => {
  const viewer = ViewerHelper.getViewer()!
  if (!MPH) MPH = new MassivePointsHelper(viewer, { xNums: 10, yNums: 10 })

  const rect = getScreenRect(viewer)

  const _points = genMassivePoints(3000, rect)
  const points = MPH.calcLonLatsMostDetailed(_points, { drawGrid: true, keepKeys: Array.from(Array(20), (_, i) => i) })

  points.forEach(item => {
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(...(item.lonLat as [number, number])),
      point: {
        pixelSize: 3,
        color: Cesium.Color.TEAL,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      // label: {
      //   text: item.posKey,
      //   font: "14px sans-serif",
      //   pixelOffset: new Cesium.Cartesian2(15, -15),
      // },
    })
  })
}

export const 移除Grid = () => {
  MPH?.removeGrid()
}
