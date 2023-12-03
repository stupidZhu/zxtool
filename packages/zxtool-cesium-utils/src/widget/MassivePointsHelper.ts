import * as Cesium from "cesium"
import { ViewerUtilSync } from "../util/ViewerUtilSync"

const { getScreenRect } = ViewerUtilSync

export interface MassivePointsHelperOptions {
  xNums?: number
  yNums?: number
}

export interface RECT {
  minx: number
  maxx: number
  miny: number
  maxy: number
}

export interface PosMapItem {
  key: PropertyKey
  lonLat: LonLat
  posKey: string
}
export interface MostDetailedPosMapItem {
  key: PropertyKey
  lonLat: LonLat
  posKey: string
  dis: number
  gridCenter?: LonLat
}

export interface CalcLonLatsOptions extends MassivePointsHelperOptions {
  keepKeys?: PropertyKey[]
  drawGrid?: boolean
}

export class MassivePointsHelper {
  private viewer: Cesium.Viewer
  private xNums: number
  private yNums: number
  private primitive: Cesium.GroundPrimitive | null = null

  static getDisSquare(lonLat1: LonLat, lonLat2: LonLat) {
    return (lonLat1[0] - lonLat2[0]) ** 2 + (lonLat1[1] - lonLat2[1]) ** 2
  }
  static getPosKey(props: Required<MassivePointsHelperOptions> & { lonLat: LonLat; rect: RECT }) {
    const { lonLat, rect, xNums, yNums } = props
    const xInterval = (rect.maxx - rect.minx) / xNums
    const yInterval = (rect.maxy - rect.miny) / yNums
    if (lonLat[0] > rect.maxx || lonLat[0] < rect.minx || lonLat[1] > rect.maxy || lonLat[1] < rect.miny) return
    return `${Math.floor((lonLat[0] - rect.minx) / xInterval)}-${Math.floor((lonLat[1] - rect.miny) / yInterval)}`
  }
  static initPosMap(
    props: Required<MassivePointsHelperOptions> & { lonLats: LonLatKey[]; rect: RECT; keepKeys: Set<PropertyKey> },
  ) {
    const { lonLats: _lonLats, keepKeys, ...rest } = props
    const posMap = new Map<string, PosMapItem[]>()
    const lonLats = []

    for (const item of _lonLats) {
      const { key, lonLat } = item
      if (!keepKeys.has(key)) {
        lonLats.push(item)
        continue
      }
      const posKey = this.getPosKey({ lonLat, ...rest })
      if (!posKey) continue
      if (!posMap.has(posKey)) posMap.set(posKey, [{ ...item, posKey }])
      else posMap.get(posKey)!.push({ ...item, posKey })
    }

    return { posMap, lonLats }
  }
  static initMostDetailedPosMap(
    props: Required<MassivePointsHelperOptions> & { lonLats: LonLatKey[]; rect: RECT; keepKeys: Set<PropertyKey> },
  ) {
    const { lonLats, posMap: _posMap } = MassivePointsHelper.initPosMap(props)
    const posMap = new Map<string, MostDetailedPosMapItem[]>()

    _posMap.forEach((v, k) => {
      posMap.set(
        k,
        v.map(item => ({ ...item, dis: 0 })),
      )
    })

    return { posMap, lonLats }
  }

  constructor(viewer: Cesium.Viewer, options: MassivePointsHelperOptions = {}) {
    this.viewer = viewer
    const { xNums = 60, yNums = 40 } = options
    this.xNums = xNums
    this.yNums = yNums
  }

  private drawGrid(props: Required<MassivePointsHelperOptions> & { rect: RECT }) {
    this.removeGrid()

    const { rect, xNums, yNums } = props
    const xInterval = (rect.maxx - rect.minx) / xNums
    const yInterval = (rect.maxy - rect.miny) / yNums
    const geomList: Cesium.GeometryInstance[] = []

    for (let i = 0; i < xNums; i++) {
      for (let j = 0; j < yNums; j++) {
        const lonMin = rect.minx + i * xInterval
        const lonMax = rect.minx + (i + 1) * xInterval
        const latMin = rect.miny + j * yInterval
        const latMax = rect.miny + (j + 1) * yInterval

        const pos = [lonMin, latMin, lonMax, latMin, lonMax, latMax, lonMin, latMax, lonMin, latMin]

        const geometry = new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(pos)),
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        })

        geomList.push(
          new Cesium.GeometryInstance({
            geometry,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromRandom({ alpha: 0.2 })),
            },
          }),
        )
      }
    }

    this.primitive = new Cesium.GroundPrimitive({
      geometryInstances: geomList,
      appearance: new Cesium.PerInstanceColorAppearance(),
    })

    this.viewer.scene.primitives.add(this.primitive)
  }

  calcLonLats(_lonLats: LonLatKey[], options: CalcLonLatsOptions = {}) {
    const { keepKeys: _keepKeys, drawGrid, xNums = this.xNums, yNums = this.yNums } = options
    const keepKeys = new Set(_keepKeys)
    const rect = getScreenRect(this.viewer)

    let lonLats = _lonLats
    let posMap = new Map<string, PosMapItem[]>()
    if (keepKeys.size) {
      const { lonLats: l, posMap: p } = MassivePointsHelper.initPosMap({ lonLats, rect, xNums, yNums, keepKeys })
      lonLats = l
      posMap = p
    }

    for (const item of lonLats) {
      const posKey = MassivePointsHelper.getPosKey({ lonLat: item.lonLat, rect, xNums, yNums })
      if (!posKey) continue
      if (!posMap.has(posKey)) posMap.set(posKey, [{ ...item, posKey }])
      if (posMap.size === xNums * yNums) break
    }

    drawGrid && this.drawGrid({ rect, xNums, yNums })

    return Array.from(posMap.values()).flat()
  }

  calcLonLatsMostDetailed(_lonLats: LonLatKey[], options: CalcLonLatsOptions = {}) {
    const { keepKeys: _keepKeys, drawGrid, xNums = this.xNums, yNums = this.yNums } = options
    const keepKeys = new Set(_keepKeys)
    const rect = getScreenRect(this.viewer)

    const xInterval = (rect.maxx - rect.minx) / xNums
    const yInterval = (rect.maxy - rect.miny) / yNums

    let lonLats = _lonLats
    let posMap = new Map<string, MostDetailedPosMapItem[]>()
    if (keepKeys.size) {
      const { lonLats: l, posMap: p } = MassivePointsHelper.initMostDetailedPosMap({ lonLats, rect, xNums, yNums, keepKeys })
      lonLats = l
      posMap = p
    }

    for (const item of lonLats) {
      const { lonLat } = item
      const posKey = MassivePointsHelper.getPosKey({ lonLat, rect, xNums, yNums })
      if (!posKey) continue

      if (!posMap.has(posKey)) {
        const [x, y] = posKey.split("-").map(Number)
        const gridCenter: [number, number] = [rect.minx + xInterval * (x + 0.5), rect.miny + yInterval * (y + 0.5)]
        posMap.set(posKey, [{ ...item, posKey, dis: MassivePointsHelper.getDisSquare(lonLat, gridCenter), gridCenter }])
      } else {
        const posItem = posMap.get(posKey)![0]
        if (posItem.dis === 0) continue

        const dis = MassivePointsHelper.getDisSquare(lonLat, posItem.gridCenter!)
        if (dis < posItem.dis) {
          posMap.set(posKey, [{ ...item, posKey, dis, gridCenter: posItem.gridCenter }])
        }
      }
    }

    drawGrid && this.drawGrid({ rect, xNums, yNums })

    return Array.from(posMap.values()).flat()
  }

  calcEntities() {
    // todo
  }

  removeGrid() {
    if (this.primitive) {
      this.viewer.scene.primitives.remove(this.primitive)
      this.primitive = null
    }
  }

  getGrid() {
    return this.primitive
  }
}
