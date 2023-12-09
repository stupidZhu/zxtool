import { ViewerHelper } from "@zxtool/cesium-utils"

class MultiViewerService {
  moduleEnter() {
    this.init()
  }

  moduleExit() {}

  init() {
    // viewer同步()
    ViewerHelper.SyncHelper.startSync()

    setTimeout(() => {
      ViewerHelper.SyncHelper.stopSync()
    }, 5 * 1000)
  }
}

export default new MultiViewerService()
