import type { CustomDataSource, Entity, Viewer } from "cesium"
import * as Cesium from "cesium"
import { CoordHelper, MouseEventHelper } from "../helper"
import { ViewerUtil } from "./ViewerUtil"
import { genZCUInfo } from "./util"

const genInfo = genZCUInfo("Tooltip")

export class Tooltip {
  private static key = "__tooltip__"

  private viewer: Viewer
  private dataSource: CustomDataSource
  private eventHelper: MouseEventHelper
  private hasTooltip = false

  private position = Cesium.Cartesian3.fromDegrees(0, 0)
  private entity: Entity | null = null

  constructor(viewer: Viewer) {
    this.viewer = viewer
    this.dataSource = ViewerUtil.getCustomDataSource({ viewer, name: Tooltip.key, autoCreate: true })!
    this.eventHelper = new MouseEventHelper(viewer)
  }

  create(text: string) {
    if (this.hasTooltip) {
      return console.error(genInfo("已经创建了一个 Tooltip"))
    }
    this.hasTooltip = true

    this.entity = new Cesium.Entity({
      // @ts-ignore
      position: new Cesium.CallbackProperty(() => this.position, false),
      label: {
        text,
        font: "30px sans-serif",
        scale: 0.6,
        showBackground: true,
        backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
        backgroundPadding: new Cesium.Cartesian2(20, 15),
        pixelOffset: new Cesium.Cartesian2(20, 0),
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        disableDepthTestDistance: Number.MAX_SAFE_INTEGER,
      },
    })

    this.dataSource.entities.add(this.entity)

    this.eventHelper.addEvent({
      key: Tooltip.key,
      type: "MOUSE_MOVE",
      cb: ({ endPosition }) => {
        const c3 = CoordHelper.screenCoord2sceneC3(endPosition, this.viewer)
        if (c3) this.position = c3
      },
    })
  }

  update(text: string) {
    if (this.entity) {
      this.entity.label!.text = new Cesium.ConstantProperty(text)
    }
  }

  remove() {
    this.dataSource.entities.removeAll()
    this.eventHelper.clear()
    this.entity = null
    this.position = Cesium.Cartesian3.fromDegrees(0, 0)
    this.hasTooltip = false
  }
}
