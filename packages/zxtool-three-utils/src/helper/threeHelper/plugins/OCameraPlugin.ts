import * as THREE from "three"
import { ThreeHelperPlugin, ThreeHelperPluginProps } from "."
import { genZTUInfo } from "../../../util/util"

export interface OCameraPluginAO {
  width?: number
  height?: number
  near?: number
  far?: number
}

const genInfo = genZTUInfo("OCameraPlugin")

export class OCameraPlugin implements ThreeHelperPlugin<OCameraPluginAO> {
  private key = Symbol.for("camera")
  private rc_key = Symbol.for("resize_camera")
  private addProps: ThreeHelperPluginProps | null = null
  private size!: { width?: number; height?: number }

  private _camera?: THREE.OrthographicCamera
  get camera() {
    return this._camera
  }

  private calcConfig(width = 10, height?: number) {
    const aspect = window.innerWidth / window.innerHeight
    if (height) {
      const halfHeight = height * 0.5
      return { left: -aspect * halfHeight, right: aspect * halfHeight, top: halfHeight, bottom: -halfHeight }
    }
    const halfWidth = width * 0.5
    return { left: -halfWidth, right: halfWidth, top: halfWidth / aspect, bottom: -halfWidth / aspect }
  }

  updateSize(width?: number, height?: number) {
    if (!this.camera) throw new Error(genInfo("插件未被添加"))
    this.size = { width, height }
    const { left, right, top, bottom } = this.calcConfig(width, height)
    this.camera.left = left
    this.camera.right = right
    this.camera.top = top
    this.camera.bottom = bottom
  }

  add(props: ThreeHelperPluginProps, options: OCameraPluginAO = {}): OCameraPlugin {
    this.addProps = props
    const { threeHelper, widgetCollection, emitter } = props
    const { resizeCollection, pluginCollection } = threeHelper

    const plugin = pluginCollection.get(this.key) as OCameraPlugin
    if (plugin) {
      console.error(genInfo("已经存在一个 CameraPlugin, 不能重复添加"))
      return plugin
    }

    const { width, height, near = 0.1, far = 1e4 } = options
    this.size = { width, height }
    const { left, right, top, bottom } = this.calcConfig(width, height)

    const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far)
    camera.position.set(0, 0, 10)
    this._camera = camera

    widgetCollection.set("camera", camera)
    emitter.emit("camera", camera)

    resizeCollection.set(this.rc_key, {
      fn: () => {
        const { width, height } = this.size
        const { left, right, top, bottom } = this.calcConfig(width, height)
        camera.left = left
        camera.right = right
        camera.top = top
        camera.bottom = bottom
        camera.updateProjectionMatrix()
      },
    })

    pluginCollection.set(this.key, this)
    return this
  }

  remove(): void {
    if (!this.addProps) throw new Error(genInfo("未添加的插件不能被移除"))
    const { threeHelper, widgetCollection, emitter } = this.addProps
    const { resizeCollection, pluginCollection } = threeHelper

    widgetCollection.delete("camera")
    emitter.clearHistory("camera")

    this._camera?.remove()
    this._camera = undefined
    resizeCollection.delete(this.rc_key)

    pluginCollection.delete(this.key)
    this.addProps = null
  }
}
