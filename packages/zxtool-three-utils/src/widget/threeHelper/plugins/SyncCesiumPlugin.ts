import type { Viewer } from "cesium"
import * as THREE from "three"
import type { ThreeHelperPlugin, ThreeHelperPluginProps } from "."

export class SyncCesiumPlugin implements ThreeHelperPlugin {
  private key = Symbol.for("sync_cesium")
  private ac_key = Symbol.for("update_sync_cesium")
  private viewer: Viewer

  constructor(viewer: Viewer) {
    this.viewer = viewer
  }

  add(props: ThreeHelperPluginProps): void {
    const { threeHelper, initializedCache, clearCollection } = props
    const { animationCollection } = threeHelper
    if (initializedCache.get(this.key)) return

    const camera = threeHelper.getWidget("p_camera")!

    const cache = {
      near: camera.near,
      far: camera.far,
      updateRenderer: animationCollection.get(Symbol.for("update_renderer")),
    }
    camera.near = 100
    camera.far = 1e8
    animationCollection.delete(Symbol.for("update_renderer"))

    animationCollection.set(this.ac_key, {
      fn: ({ time, delta }) => {
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
        if (cache.updateRenderer) {
          const { fn, state = {} } = cache.updateRenderer
          fn({ time, delta, state })
        }
      },
    })

    clearCollection.set(this.key, {
      fn: () => {
        cache.updateRenderer && animationCollection.set(Symbol.for("update_renderer"), cache.updateRenderer)
        camera.near = cache.near
        camera.far = cache.far
        animationCollection.delete(this.ac_key)
        initializedCache.set(this.key, false)
      },
    })

    initializedCache.set(this.key, true)
  }

  remove({ clearCollection }: ThreeHelperPluginProps): void {
    const clearObj = clearCollection.get(this.key)
    if (clearObj) clearObj.fn({ state: clearObj.state ?? {} })
  }
}
