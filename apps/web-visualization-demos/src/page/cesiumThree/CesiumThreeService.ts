import { DevPlugin } from "@zxtool/three-utils"
import { threeHelper } from "src/bootstrap"
import { 结合1 } from "./结合"

class CesiumThreeService {
  moduleEnter() {
    threeHelper.addPlugin(new DevPlugin({ axesSize: 1e7 }))
    this.init()
  }

  moduleExit() {}

  init() {
    结合1()
  }
}

export default new CesiumThreeService()
