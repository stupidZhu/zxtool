import { ViewerHelper } from "@zxtool/cesium-utils"

class MultiViewerService {
  moduleEnter() {
    this.init()
  }

  moduleExit() {}

  init() {
    // viewer同步()
    setTimeout(() => {
      ViewerHelper.SyncHelper.setConfig({
        sub1: { doSync: false },
        sub2: { beSync: false },
        sub3: { control: false },
        sub4: { doSync: false, beSync: false },
        sub5: { doSync: false, beSync: false, control: false },
      })
    }, 10000)
    ViewerHelper.SyncHelper.startSync()
    // setTimeout(() => {
    //   ViewerHelper.SyncHelper.stopSync()
    // }, 5 * 1000)
  }
}

export default new MultiViewerService()
