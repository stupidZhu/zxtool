import { CommonUtil, FileUtil } from "@zxtool/utils"

const { onSet } = CommonUtil

const setUpdate = onSet<ZTexture>({
  after: tex => {
    tex.needUpdate = true
  },
})
const setUpdateAndLoaded = onSet<ZTexture>({
  after: tex => {
    tex.needUpdate = true
    // @ts-ignore
    tex.loaded = true
  },
})

export interface TexturePixels {
  data: ArrayBufferView
  texImage2DFn: (gl: WebGL2RenderingContext, data: ArrayBufferView) => void
}

export interface ZTextureProps {
  path?: string
  img?: TexImageSource
  texture?: WebGLTexture
  pixels?: TexturePixels
}

export class ZTexture {
  private anisotropicExt?: EXT_texture_filter_anisotropic

  @onSet<ZTexture>({ after: tex => tex.load() })
  accessor path: string | null = null

  @setUpdateAndLoaded
  accessor img: TexImageSource | null = null

  @setUpdateAndLoaded
  accessor texture: WebGLTexture | null = null

  @setUpdateAndLoaded
  accessor pixels: TexturePixels | null = null

  @setUpdate
  accessor mipmap = false

  @setUpdate
  accessor anisotropic = false

  @setUpdate
  accessor flip = true

  readonly configMap = new Proxy(
    new Map<number, number>([
      [0x2801, 0x2601], // gl.TEXTURE_MIN_FILTER, gl.LINEAR
      [0x2800, 0x2601], // gl.TEXTURE_MAG_FILTER, gl.LINEAR
      [0x2802, 0x812f], // gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE
      [0x2803, 0x812f], // gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE
    ]),
    {
      get: (target, key, receiver) => {
        if (key === "set" || key === "clear" || key === "delete") {
          this.needUpdate = true
        }
        return Reflect.get(target, key, receiver).bind(target)
      },
    },
  )

  protected loaded = false
  needUpdate = true
  loadSucc?: (texture: ZTexture) => void
  loadFail?: (e: any, texture: ZTexture) => void

  constructor(props: ZTextureProps) {
    const { path, img, texture, pixels } = props
    if (path) this.path = path
    if (img) this.img = img
    if (texture) this.texture = texture
    if (pixels) this.pixels = pixels
  }

  private async load() {
    if (!this.path) return
    FileUtil.loadImage(this.path)
      .then(img => {
        this.loadSucc?.(this)
        this.img = img
      })
      .catch(e => {
        this.loadFail?.(e, this)
        throw e
      })
  }

  updateConfig(gl: WebGL2RenderingContext) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.flip)
    if (this.mipmap && this.img) {
      gl.generateMipmap(gl.TEXTURE_2D)
      this.configMap.set(gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    }

    if (!this.anisotropicExt) this.anisotropicExt = gl.getExtension("EXT_texture_filter_anisotropic")!
    if (this.anisotropicExt && this.anisotropic) {
      gl.texParameterf(gl.TEXTURE_2D, this.anisotropicExt.TEXTURE_MAX_ANISOTROPY_EXT, 4)
    }

    this.configMap.forEach((v, k) => {
      gl.texParameteri(gl.TEXTURE_2D, k, v)
    })
  }

  useTexture(gl: WebGL2RenderingContext, location: WebGLUniformLocation, index: number) {
    const { loaded, img, pixels } = this
    if (!this.texture) this.texture = gl.createTexture()!
    if (!loaded) return

    gl.activeTexture(gl.TEXTURE0 + index)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.uniform1i(location, index)

    if (this.needUpdate) {
      if (pixels) pixels.texImage2DFn(gl, pixels.data)
      else if (img) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      this.updateConfig(gl)
      this.needUpdate = false
    }
  }
}
