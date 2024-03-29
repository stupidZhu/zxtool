import { MassivePointsHelper, ViewerHelper, ViewerUtilSync } from "@zxtool/cesium-utils"
import { RECT } from "@zxtool/cesium-utils/dist/type/type"
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
  if (!MPH) MPH = new MassivePointsHelper(viewer, { xNums: 30, yNums: 20 })

  const rect = getScreenRect(viewer)

  const _points = genMassivePoints(10000, rect)
  // const points = MPH.calcLonLats(_points, { drawGrid: true, keepKeys: Array.from(Array(20), (_, i) => i) })

  const dataSource = ViewerUtilSync.getCustomDataSource({ viewer, name: "massivePoint", autoCreate: true })!

  _points.forEach(item => {
    dataSource.entities.add({
      position: Cesium.Cartesian3.fromDegrees(...(item.lonLat as [number, number])),
      point: {
        pixelSize: 3,
        color: Cesium.Color.TEAL,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      show: false,
    })
  })

  viewer.camera.moveEnd.addEventListener(() => {
    MPH?.calcEntitiesMostDetailed(dataSource)
  })
}

export const 移除Grid = () => {
  MPH?.removeGrid()
}
