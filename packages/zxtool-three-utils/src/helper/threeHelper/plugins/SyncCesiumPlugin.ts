import type { Viewer } from "cesium"
import * as THREE from "three"
import type { ThreeHelperPlugin, ThreeHelperPluginProps } from "."
import { genZTUInfo } from "../../../util/util"

interface SyncCesiumPluginAO {
  viewer: Viewer
}

const genInfo = genZTUInfo("SyncCesiumPlugin")

export class SyncCesiumPlugin implements ThreeHelperPlugin<SyncCesiumPluginAO> {
  private key = Symbol.for("sync_cesium")
  private ac_key = Symbol.for("update_sync_cesium")
  private viewer?: Viewer
  private addProps: ThreeHelperPluginProps | null = null
  private cache?: { near: number; far: number }

  constructor(viewer: Viewer) {
    this.viewer = viewer
  }

  add(props: ThreeHelperPluginProps, options?: SyncCesiumPluginAO): SyncCesiumPlugin {
    this.addProps = props
    const { threeHelper } = props
    const { animationCollection, pluginCollection } = threeHelper

    const plugin = pluginCollection.get(this.key) as SyncCesiumPlugin
    if (plugin) {
      console.error(genInfo("已经存在一个 EffectComposerPlugin, 不能重复添加"))
      return plugin
    }

    const camera = threeHelper.getWidget("camera") as THREE.PerspectiveCamera
    if (!camera) {
      console.error(genInfo("不存在可用的 camera"))
      return this
    }

    this.cache = { near: camera.near, far: camera.far }
    camera.near = 100
    camera.far = 1e8
    // const updateRenderer = animationCollection.get(Symbol.for("update_renderer"))
    // if (updateRenderer) {
    //   if (!updateRenderer.state) updateRenderer.state = {}
    //   updateRenderer.state.enable = false
    // }

    animationCollection.set(this.ac_key, {
      fn: () => {
        if (!this.viewer) return
        /*************** sync camera ***************/
        const viewerCamera = this.viewer.camera
        // @ts-ignore
        camera.fov = THREE.MathUtils.radToDeg(viewerCamera.frustum.fovy)
        camera.matrixAutoUpdate = false
        const cvm = viewerCamera.viewMatrix
        const civm = viewerCamera.inverseViewMatrix

        camera.lookAt(new THREE.Vector3(0, 0, 0))
        // prettier-ignore
        camera.matrixWorld.set(
          civm[0], civm[4], civm[8],  civm[12],
          civm[1], civm[5], civm[9],  civm[13],
          civm[2], civm[6], civm[10], civm[14],
          civm[3], civm[7], civm[11], civm[15]
        )
        // prettier-ignore
        camera.matrixWorldInverse.set(
          cvm[0], cvm[4], cvm[8],  cvm[12],
          cvm[1], cvm[5], cvm[9],  cvm[13],
          cvm[2], cvm[6], cvm[10], cvm[14],
          cvm[3], cvm[7], cvm[11], cvm[15]
        )

        camera.updateProjectionMatrix()

        /*************** update renderer ***************/
        // if (cache.updateRenderer) {
        //   const { fn, state = {} } = cache.updateRenderer
        //   fn({ time, delta, state })
        // }
      },
    })

    return this
  }

  remove(): void {
    if (!this.addProps) throw new Error(genInfo("未添加的插件不能被移除"))
    const { threeHelper } = this.addProps
    const { animationCollection, pluginCollection } = threeHelper

    this.viewer = undefined
    animationCollection.delete(this.ac_key)
    const camera = threeHelper.getWidget("camera") as THREE.PerspectiveCamera
    if (this.cache && camera) {
      camera.near = this.cache.near
      camera.far = this.cache.far
    }

    pluginCollection.delete(this.key)
    this.addProps = null
  }
}
