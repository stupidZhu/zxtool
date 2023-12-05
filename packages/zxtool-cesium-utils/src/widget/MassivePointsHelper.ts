import * as Cesium from "cesium"
import { EntityUtil, IEntities } from "../util/EntityUtil"
import { ViewerUtilSync } from "../util/ViewerUtilSync"

const { getScreenRect } = ViewerUtilSync

export interface MassivePointsHelperOptions {
  xNums?: number
  yNums?: number
}

export interface PosMapItem extends LonLatKey {
  posKey: string
}
export interface MostDetailedPosMapItem extends LonLatKey {
  posKey: string
  dis: number
  gridCenter?: LonLat
}

export interface CalcLonLatsOptions extends MassivePointsHelperOptions {
  keepKeys?: PropertyKey[]
  drawGrid?: boolean
  lonLatType?: LonLatType
}

export interface calcEntitiesOptions extends Omit<CalcLonLatsOptions, "keepKeys" | "lonLatType"> {
  keepEntities?: Cesium.Entity[] | string[]
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
  static initPosMap<T extends LonLatKey>(
    props: Required<MassivePointsHelperOptions> & { lonLats: T[]; rect: RECT; keepKeys: Set<PropertyKey> },
  ) {
    const { lonLats: _lonLats, keepKeys, ...rest } = props
    const posMap = new Map<string, Array<T & PosMapItem>>()
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
  static initMostDetailedPosMap<T extends LonLatKey>(
    props: Required<MassivePointsHelperOptions> & { lonLats: T[]; rect: RECT; keepKeys: Set<PropertyKey> },
  ) {
    const { lonLats, posMap: _posMap } = MassivePointsHelper.initPosMap(props)
    const posMap = new Map<string, Array<T & MostDetailedPosMapItem>>()

    _posMap.forEach((v, k) => {
      posMap.set(
        k,
        v.map(item => ({ ...item, dis: 0 })),
      )
    })

    return { posMap, lonLats }
  }
  static entities2LonLats(entities: Cesium.Entity[], viewer: Cesium.Viewer) {
    return entities
      .filter(e => Boolean(e.position))
      .map(entity => {
        const cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(
          entity.position!.getValue(new Cesium.JulianDate())!,
        )
        return {
          lonLat: [cartographic.longitude, cartographic.latitude] as [number, number],
          key: entity.id,
          entity,
        }
      })
  }

  constructor(viewer: Cesium.Viewer, options: MassivePointsHelperOptions = {}) {
    this.viewer = viewer
    const { xNums = 30, yNums = 20 } = options
    this.xNums = xNums
    this.yNums = yNums
  }

  private drawGrid(props: Required<MassivePointsHelperOptions> & { rect: RECT; lonLatType: LonLatType }) {
    this.removeGrid()

    const { rect, xNums, yNums, lonLatType } = props
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
        const position =
          lonLatType === "degree" ? Cesium.Cartesian3.fromDegreesArray(pos) : Cesium.Cartesian3.fromRadiansArray(pos)

        const geometry = new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(position),
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        })

        geomList.push(
          new Cesium.GeometryInstance({
            geometry,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromRandom({ alpha: 0.1 })),
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

  calcLonLats<T extends LonLatKey>(_lonLats: T[], options: CalcLonLatsOptions = {}) {
    const { keepKeys: _keepKeys, drawGrid, xNums = this.xNums, yNums = this.yNums, lonLatType = "degree" } = options
    const keepKeys = new Set(_keepKeys)
    const rect = getScreenRect(this.viewer, lonLatType)

    let lonLats = _lonLats
    let posMap = new Map<string, Array<T & PosMapItem>>()
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

    drawGrid && this.drawGrid({ rect, xNums, yNums, lonLatType })

    return Array.from(posMap.values()).flat()
  }

  calcLonLatsMostDetailed<T extends LonLatKey>(_lonLats: T[], options: CalcLonLatsOptions = {}) {
    const { keepKeys: _keepKeys, drawGrid, xNums = this.xNums, yNums = this.yNums, lonLatType = "degree" } = options
    const keepKeys = new Set(_keepKeys)
    const rect = getScreenRect(this.viewer, lonLatType)

    const xInterval = (rect.maxx - rect.minx) / xNums
    const yInterval = (rect.maxy - rect.miny) / yNums

    let lonLats = _lonLats
    let posMap = new Map<string, Array<T & MostDetailedPosMapItem>>()
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

    drawGrid && this.drawGrid({ rect, xNums, yNums, lonLatType })

    return Array.from(posMap.values()).flat()
  }

  calcEntities(target: IEntities, options: calcEntitiesOptions = {}) {
    const { keepEntities, ...rest } = options
    const entities = EntityUtil.getEntities(target)
    const keepKeys = keepEntities?.map(e => (typeof e === "string" ? e : e.id))

    const lonLats = MassivePointsHelper.entities2LonLats(entities, this.viewer)

    const res = this.calcLonLats(lonLats, { lonLatType: "radian", keepKeys, ...rest })
    const reservedEntities = new Set(res.map(item => item.entity))

    entities.forEach(entity => {
      entity.show = reservedEntities.has(entity)
    })

    return res
  }

  calcEntitiesMostDetailed(target: IEntities, options: calcEntitiesOptions = {}) {
    const { keepEntities, ...rest } = options
    const entities = EntityUtil.getEntities(target)
    const keepKeys = keepEntities?.map(e => (typeof e === "string" ? e : e.id))

    const lonLats = MassivePointsHelper.entities2LonLats(entities, this.viewer)

    const res = this.calcLonLatsMostDetailed(lonLats, { lonLatType: "radian", keepKeys, ...rest })
    const reservedEntities = new Set(res.map(item => item.entity))

    entities.forEach(entity => {
      entity.show = reservedEntities.has(entity)
    })

    return res
  }

  removeGrid() {
    if (this.primitive) {
      this.viewer.scene.primitives.remove(this.primitive)
      this.primitive = null
    }
  }
}
