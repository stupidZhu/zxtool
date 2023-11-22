import type { ThreeHelper } from "../ThreeHelper"
import type { ThreeHelperStore } from "../ThreeHelperStore"

export interface ThreeHelperPlugin {
  add(ThreeHelper: ThreeHelper, THS: ThreeHelperStore): void
  remove(ThreeHelper: ThreeHelper, THS: ThreeHelperStore): void
}

export { default as ClickPlugin } from "./ClickPlugin"
export { default as DevPlugin } from "./DevPlugin"
export { default as OrbitControlsPlugin } from "./OrbitControlsPlugin"
