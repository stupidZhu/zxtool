import { DevPlugin } from "@zxtool/three-utils"
import { threeHelper } from "src/bootstrap"
import { 加载gltf } from "./模型"

const flag = { current: false }

class ThreePageService {
  moduleEnter() {
    threeHelper.add(new DevPlugin())
    this.init()

    // const plugin = new OrbitControlsPlugin()
    // setInterval(() => {
    //   if (flag.current) {
    //     threeHelper.remove(plugin)
    //     flag.current = false
    //   } else {
    //     threeHelper.add(plugin)
    //     flag.current = true
    //   }
    // }, 5000)
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
