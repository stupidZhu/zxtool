import { Num2 } from "@zxtool/utils"
import { store } from "./ZGlobalStore"
import { ZScene } from "./ZScene"

export class MSAAFrame extends ZScene {
  readonly msaa: number = 0
  readonly size: Num2
  readonly gl: WebGL2RenderingContext

  readonly framebuffer!: WebGLFramebuffer
  readonly msaaFramebuffer!: WebGLFramebuffer
  readonly msaaRenderbuffer!: WebGLRenderbuffer
  readonly msaaDepthbuffer!: WebGLRenderbuffer

  readonly texture!: WebGLTexture

  constructor(msaa = 4, size: Num2 = [2048, 2048]) {
    super()
    const gl = store.gl
    this.msaa = msaa
    this.size = size
    this.gl = store.gl

    this.framebuffer = gl.createFramebuffer()!
    this.msaaFramebuffer = gl.createFramebuffer()!
    this.msaaRenderbuffer = gl.createRenderbuffer()!
    this.msaaDepthbuffer = gl.createRenderbuffer()!
    this.texture = gl.createTexture()!

    this.init()
  }

  init() {
    const { gl, size, msaa, framebuffer, msaaFramebuffer, msaaRenderbuffer, msaaDepthbuffer, texture } = this
    gl.getExtension("EXT_color_buffer_float")

    gl.bindFramebuffer(gl.FRAMEBUFFER, msaaFramebuffer)

    gl.bindRenderbuffer(gl.RENDERBUFFER, msaaRenderbuffer)
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, msaa, gl.RGBA8, ...size)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, msaaRenderbuffer)

    gl.bindRenderbuffer(gl.RENDERBUFFER, msaaDepthbuffer)
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, msaa, gl.DEPTH_COMPONENT16, ...size)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, msaaDepthbuffer)

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    // ---------- texture -----------

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ...size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  useFrame() {
    const { gl, size, msaaFramebuffer } = this

    gl.activeTexture(gl.TEXTURE0)
    gl.bindFramebuffer(gl.FRAMEBUFFER, msaaFramebuffer)
    gl.viewport(0, 0, ...size)
  }

  clear() {
    const { gl } = this
    const { width, height } = gl.canvas as HTMLCanvasElement
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, width, height)
  }

  render() {
    const { gl, size, msaaFramebuffer, framebuffer } = this
    this.useFrame()
    super.render()
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, msaaFramebuffer!)
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffer)
    gl.blitFramebuffer(0, 0, ...size, 0, 0, ...size, gl.COLOR_BUFFER_BIT, gl.LINEAR)
    this.clear()
  }
}
