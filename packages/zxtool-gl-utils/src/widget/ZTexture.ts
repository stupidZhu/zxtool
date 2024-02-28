import { FileUtil } from "@zxtool/utils"

export class ZTexture {
  private _path?: string
  get path(): string | undefined {
    return this._path
  }
  set path(p: string) {
    this._path = p
    this.load()
  }

  private _img?: TexImageSource
  get img(): TexImageSource | undefined {
    return this._img
  }
  set img(i: TexImageSource) {
    this._img = i
    this.needUpdate = true
    this.loaded = true
  }

  private _texture?: WebGLTexture
  get texture(): WebGLTexture | undefined {
    return this._texture
  }
  set texture(i: WebGLTexture) {
    this._texture = i
    this.needUpdate = true
    this.loaded = true
  }

  flip = true
  readonly configMap: Map<number, number> = new Map([
    [0x2801, 0x2601], // gl.TEXTURE_MIN_FILTER, gl.LINEAR
    [0x2800, 0x2601], // gl.TEXTURE_MAG_FILTER, gl.LINEAR
    [0x2802, 0x812f], // gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE
    [0x2803, 0x812f], // gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE
  ])

  private loaded = false
  needUpdate = true
  loadSucc?: (texture: ZTexture) => void
  loadFail?: (e: any, texture: ZTexture) => void

  constructor(props: { path?: string; img?: TexImageSource; texture?: WebGLTexture }) {
    const { path, img, texture } = props
    if (path) this.path = path
    if (img) this.img = img
    if (texture) this.texture = texture
  }

  private async load() {
    if (!this.path) return
    FileUtil.loadImage(this.path)
      .then(img => {
        this.loadSucc?.(this)
        this.img = img
        this.needUpdate = true
        this.loaded = true
      })
      .catch(e => {
        this.loadFail?.(e, this)
      })
  }

  updateConfig(gl: WebGLRenderingContext) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.flip)
    this.configMap.forEach((v, k) => {
      gl.texParameteri(gl.TEXTURE_2D, k, v)
    })
  }

  useTexture(gl: WebGLRenderingContext, location: WebGLUniformLocation, index: number) {
    if (!this.texture) this.texture = gl.createTexture()!
    if (!this.loaded) return

    gl.activeTexture(gl.TEXTURE0 + index)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.uniform1i(location, index)

    if (this.needUpdate) {
      this.updateConfig(gl)
      this.img && gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.img)
      this.needUpdate = false
      return
    }
  }
}
