import { DevPlugin } from "@zxtool/three-utils"
import { threeHelper } from "src/bootstrap"
import { 加载gltf } from "./模型"

const flag = { current: false }

class ThreePageService {
  moduleEnter() {
    threeHelper.addPlugin(new DevPlugin())
    this.init()
  }

  moduleExit() {}

  init() {
    // 随机三角形()
    // clipping()
    // 发光()

    加载gltf()
  }
}

export default new ThreePageService()
