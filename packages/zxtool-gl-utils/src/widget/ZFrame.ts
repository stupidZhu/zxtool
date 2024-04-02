import { Num2 } from "@zxtool/utils"
import { store } from "./ZGlobalStore"
import { ZScene } from "./ZScene"
import { ZTexture } from "./ZTexture"

type TexImage2DFn = (gl: WebGL2RenderingContext, size: Num2) => void

export class ZFrame extends ZScene {
  _size: Num2 = [2048, 2048]
  get size() {
    return this._size
  }
  set size(value: Num2) {
    this._size = value
    this.onResize()
  }
  readonly gl: WebGL2RenderingContext

  readonly framebuffer!: WebGLFramebuffer
  readonly depthbuffer!: WebGLRenderbuffer

  readonly textures: WebGLTexture[] = []
  readonly zTextures: ZTexture[] = []
  readonly depthTexture!: WebGLTexture
  readonly depthZTexture!: ZTexture
  private texturesInfo: WeakMap<WebGLTexture, { texImage2DFn?: TexImage2DFn }> = new WeakMap()

  needUpdate = false
  private updated = false

  constructor(size?: Num2) {
    super()
    const { gl, canvas } = store
    this.size = size ?? [canvas.clientWidth, canvas.clientHeight]
    this.gl = store.gl
    this.name = "ZFrame"

    this.framebuffer = gl.createFramebuffer()!
    this.depthbuffer = gl.createRenderbuffer()!

    const depthTexture = gl.createTexture()!
    const depthZTexture = new ZTexture({ texture: depthTexture })
    depthZTexture.configMap.set(gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    depthZTexture.configMap.set(gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    this.depthTexture = depthTexture
    this.depthZTexture = depthZTexture

    this.init()
  }

  private init() {
    const { gl, size, framebuffer, depthbuffer } = this
    gl.getExtension("EXT_color_buffer_float")

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthbuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, ...size)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthbuffer)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    this.initDepthBuffer()
  }

  private initDepthBuffer() {
    const { gl, size, framebuffer, depthTexture } = this

    gl.bindTexture(gl.TEXTURE_2D, depthTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, ...size, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  private processFrame() {
    const { gl, textures, framebuffer } = this
    if (!this.needUpdate && this.updated) return
    this.needUpdate = false

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    textures.forEach((texture, index) => {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, texture, 0)
    })
    gl.drawBuffers(textures.map((_, index) => gl.COLOR_ATTACHMENT0 + index))
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    this.updated = true
  }

  private onResize() {
    const { gl, size, updated, depthTexture } = this
    if (!updated) return
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, ...size)
    gl.bindTexture(gl.TEXTURE_2D, depthTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, ...size, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null)
    this.textures.forEach((texture, index) => {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      const { texImage2DFn } = this.texturesInfo.get(texture) ?? {}
      if (texImage2DFn) texImage2DFn(gl, size)
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ...size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    })
    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  addTexture(texImage2DFn?: TexImage2DFn) {
    const { gl, size, textures, zTextures, texturesInfo } = this
    this.needUpdate = true
    const texture = gl.createTexture()!
    const zTexture = new ZTexture({ texture })
    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    if (texImage2DFn) texImage2DFn(gl, size)
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ...size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    gl.bindTexture(gl.TEXTURE_2D, null)
    textures.push(texture)
    zTextures.push(zTexture)
    texturesInfo.set(texture, { texImage2DFn })
    return this
  }

  private useFrame() {
    const { gl, size, framebuffer } = this

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.viewport(0, 0, ...size)
  }

  private clear() {
    const { gl } = this
    const { width, height } = gl.canvas as HTMLCanvasElement
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, width, height)
  }

  render(time?: number) {
    this.processFrame()
    this.useFrame()
    super.render(time)
    this.clear()
  }
}

const packShader = /* glsl */ `
const float PackUpscale = 256. / 255.; // fraction -> 0..1 (including 1)
const float UnpackDownscale = 255. / 256.; // 0..1 -> fraction (excluding 1)

const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );

const float ShiftRight8 = 1. / 256.;

vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8; // tidy overflow
	return r * PackUpscale;
}

float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}`
