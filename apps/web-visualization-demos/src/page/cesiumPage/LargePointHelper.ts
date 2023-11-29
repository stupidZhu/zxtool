import { ViewerHelper } from "@zxtool/cesium-utils"
import * as Cesium from "cesium"

interface RECT {
  minx: number
  maxx: number
  miny: number
  maxy: number
}

const genLargePoint = (nums: number, rect: RECT) => {
  const { minx, maxx, miny, maxy } = rect
  return Array.from(Array(nums), (_, i) => {
    return {
      id: i,
      lonLat: [Math.random() * (maxx - minx) + minx, Math.random() * (maxy - miny) + miny],
    }
  })
}

interface LargePointHelperOptions {
  xNums?: number
  yNums?: number
}

class LargePointHelper {
  viewer: Cesium.Viewer
  xNums: number
  yNums: number

  constructor(viewer: Cesium.Viewer, options: LargePointHelperOptions = {}) {
    this.viewer = viewer
    const { xNums = 60, yNums = 40 } = options
    this.xNums = xNums
    this.yNums = yNums
  }

  drawGrid(rect: RECT) {
    const xInterval = (rect.maxx - rect.minx) / this.xNums
    const yInterval = (rect.maxy - rect.miny) / this.yNums

    for (let i = 0; i < this.xNums; i++) {
      for (let j = 0; j < this.yNums; j++) {
        const lonMin = rect.minx + i * xInterval
        const lonMax = rect.minx + (i + 1) * xInterval
        const latMin = rect.miny + j * yInterval
        const latMax = rect.miny + (j + 1) * yInterval
        const positions = Cesium.Cartesian3.fromDegreesArray([
          lonMin,
          latMin,
          lonMax,
          latMin,
          lonMax,
          latMax,
          lonMin,
          latMax,
          lonMin,
          latMin,
        ])

        this.viewer.entities.add({
          polygon: {
            hierarchy: {
              positions: positions,
              holes: [],
            },
            material: Cesium.Color.fromRandom({ alpha: 0.2 }),
          },
        })
      }
    }
  }

  calcLonLats(lonLats: Array<{ id: PropertyKey; lonLat: number[] }>) {
    const rect = getScreenRect(this.viewer)
    const xInterval = (rect.maxx - rect.minx) / this.xNums
    const yInterval = (rect.maxy - rect.miny) / this.yNums

    const posMap = new Map<string, { id: PropertyKey; lonLat: number[]; posKey: string }>()

    for (const item of lonLats) {
      const { id, lonLat } = item
      if (lonLat[0] > rect.maxx || lonLat[0] < rect.minx || lonLat[1] > rect.maxy || lonLat[1] < rect.miny) continue
      const posKey = `${Math.floor((lonLat[0] - rect.minx) / xInterval)}-${Math.floor((lonLat[1] - rect.miny) / yInterval)}`
      if (!posMap.has(posKey)) posMap.set(posKey, { ...item, posKey })
      if (posMap.size === this.xNums * this.yNums) break
    }

    this.drawGrid(rect)

    return Array.from(posMap.values())
  }

  calcC3s(c3s: Array<{ id: PropertyKey; c3: Cesium.Cartesian3 }>) {}

  calcEntities() {}
}

export default LargePointHelper

const getScreenRect = (viewer: Cesium.Viewer) => {
  const rect = viewer.scene.camera.computeViewRectangle()
  if (rect) {
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

  return {
    minx: Cesium.Math.toDegrees(topLeftCartographic.longitude),
    maxx: Cesium.Math.toDegrees(bottomRightCartographic.longitude),
    miny: Cesium.Math.toDegrees(bottomRightCartographic.latitude),
    maxy: Cesium.Math.toDegrees(topLeftCartographic.latitude),
  }
}

export const test = () => {
  const viewer = ViewerHelper.getViewer()!
  const LPH = new LargePointHelper(viewer, { xNums: 10, yNums: 10 })
  const rect = getScreenRect(viewer)

  const _points = genLargePoint(3000, rect)
  const points = LPH.calcLonLats(_points)

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
