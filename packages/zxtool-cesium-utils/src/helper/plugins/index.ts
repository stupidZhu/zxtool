import type { EmitterHelper, IObj } from "@zxtool/utils"
import type { CesiumHelper } from "../CesiumHelper"

export interface CesiumHelperPluginProps {
  emitter: EmitterHelper
  widgetCollection: Map<PropertyKey, any>
  cesiumHelper: CesiumHelper
}
export interface CesiumHelperPlugin<AO extends IObj = {}, RO extends IObj = {}> {
  add(props: CesiumHelperPluginProps, options?: AO): CesiumHelperPlugin<AO>
  remove(options?: RO): void
}

export * from "./MouseEventPlugin"
export * from "./ViewerPlugin"
export * from "./WidgetPlugin"
