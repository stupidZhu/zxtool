import type { Cartesian2, Cartesian3, CustomDataSource, Entity, Primitive, Viewer } from "cesium"
import * as Cesium from "cesium"
import { nanoid } from "nanoid"
import { ViewerUtil } from "../util"
import { genZCUInfo } from "../util/util"
import { CoordHelper } from "./CoordHelper"
import { MouseEventHelper } from "./MouseEventHelper"
import { PrimitiveManager } from "./PrimitiveManager"

const genInfo = genZCUInfo("DrawHelper")

export interface EventCbs {
  onClick?: (position: Cartesian3, screenCoord: Cartesian2) => void
  onMove?: (position: Cartesian3, screenCoord: Cartesian2) => void
  onRecall?: (position: Cartesian3, screenCoord: Cartesian2) => void
  onFinish?: (primitive: Primitive | null, positions: Cartesian3[] | null) => void
  onCancel?: () => void
}

export interface DrawProps extends Omit<EventCbs, "onFinish"> {
  onFinish?: (props: { primitive: Primitive | null; entity: Entity | null; positions: Cartesian3[] | null }) => void
}

export class DrawHelper {
  private static isDrawing = false

  private key: string
  private viewer: Viewer
  private eventHelper: MouseEventHelper
  private dataSource: CustomDataSource
  private primitiveManager: PrimitiveManager

  private positions: Cartesian3[] = []
  private mode: "polygon" | "polyline" | "" = ""

  constructor(viewer: Viewer) {
    this.viewer = viewer
    this.key = nanoid()
    this.eventHelper = new MouseEventHelper(viewer)
    this.dataSource = ViewerUtil.getCustomDataSource({ viewer, name: this.key, autoCreate: true })!
    this.primitiveManager = new PrimitiveManager(viewer)
  }

  drawPolyline(props: DrawProps = {}) {
    if (DrawHelper.isDrawing) return console.error(genInfo("已经有一个 DrawHelper 的实例正在绘制"))
    DrawHelper.isDrawing = true
    this.mode = "polyline"

    const { onFinish, ...rest } = props
    this.addEvent({
      ...rest,
      onFinish(primitive, positions) {
        onFinish?.({ primitive, positions, entity: null })
      },
    })
  }

  drawPolygon(props: DrawProps = {}) {
    if (DrawHelper.isDrawing) return console.error(genInfo("已经有一个 DrawHelper 的实例正在绘制"))
    DrawHelper.isDrawing = true
    this.mode = "polygon"

    const entity = this.dataSource.entities.add({
      polygon: {
        hierarchy: new Cesium.CallbackProperty(() => {
          const positions = this.positions.map(item => item.clone())
          return new Cesium.PolygonHierarchy(positions)
        }, false),
        material: Cesium.Color.CYAN.withAlpha(0.4),
      },
    })

    const { onFinish, ...rest } = props
    this.addEvent({
      ...rest,
      onFinish: (primitive, positions) => {
        // @ts-ignore
        entity.polygon!.hierarchy = new Cesium.PolygonHierarchy(positions?.map(item => item.clone()))
        onFinish?.({ primitive, entity, positions })
      },
    })
  }

  private addEvent(props: EventCbs) {
    const { onClick, onFinish, onMove, onRecall, onCancel } = props
    this.eventHelper.addEvent({
      key: this.key,
      type: "LEFT_CLICK",
      cb: ({ position }) => {
        const c3 = CoordHelper.screenCoord2sceneC3(position, this.viewer)
        if (c3) {
          onClick?.(c3, position)
          if (!this.positions.length) this.positions.push(c3)
          this.positions.push(c3)
          this.updatePolyline()
        }
      },
    })
    this.eventHelper.addEvent({
      key: this.key,
      type: "MOUSE_MOVE",
      cb: ({ endPosition }) => {
        const c3 = CoordHelper.screenCoord2sceneC3(endPosition, this.viewer)
        if (c3) {
          onMove?.(c3, endPosition)
          this.positions[this.positions.length - 1] = c3
          this.updatePolyline()
        }
      },
    })
    this.eventHelper.addEvent({
      key: this.key,
      type: "RIGHT_CLICK",
      cb: ({ position }) => {
        const c3 = CoordHelper.screenCoord2sceneC3(position, this.viewer)
        this.positions.pop()
        if (this.positions.length === 1) this.positions = []
        else if (c3) {
          onRecall?.(c3, position)
          this.positions[this.positions.length - 1] = c3
          this.updatePolyline()
        }
      },
    })
    window.addEventListener("keydown", e => {
      if (e.key === " ") {
        e.preventDefault()
        const { primitive, positions } = this.finish() ?? {}
        onFinish?.(primitive ?? null, positions ?? null)
      } else if (e.key === "Escape") {
        e.preventDefault()
        this.cancel()
        onCancel?.()
      }
    })
  }

  private updatePolyline() {
    const key = `${this.key}_polyline`
    this.primitiveManager.removeByCondition({ key })
    if (this.positions.length < 2) return null

    const positions = [...this.positions]
    if (this.mode === "polygon") positions.push(this.positions[0])

    const primitive = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineGeometry({ positions, width: 2 }),
      }),
      appearance: new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType("Color", { color: Cesium.Color.CYAN }),
        renderState: { depthTest: { enabled: false } },
      }),
      asynchronous: false,
    })
    this.primitiveManager.add({ primitive, key })
    return { primitive, positions }
  }

  /**
   * 结束绘制并保留绘制结果
   */
  finish() {
    if (!DrawHelper.isDrawing) {
      throw new Error("")
    }
    this.positions.pop()
    const primitive = this.updatePolyline()
    this.eventHelper.clear()
    this.positions = []
    DrawHelper.isDrawing = false
    this.mode = ""
    return primitive
  }

  /**
   * 停止并清除绘制
   */
  cancel() {
    if (!DrawHelper.isDrawing) {
      throw new Error("")
    }
    this.primitiveManager.removeAll()
    this.dataSource.entities.removeAll()
    this.eventHelper.clear()
    this.positions = []
    DrawHelper.isDrawing = false
    this.mode = ""
  }

  /**
   * 清除绘制结果, 只能结束绘制后调用
   */
  clear() {
    this.primitiveManager.removeAll()
    this.dataSource.entities.removeAll()
  }
}
