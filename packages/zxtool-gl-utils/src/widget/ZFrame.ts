import { Num2 } from "@zxtool/utils"
import { ZScene } from "./ZScene"

const utils = `
vec4 packDepth(float z){
  const vec4 bitShift = vec4(1.0, 256.0, pow(256.0, 2.0), pow(256.0, 3.0));
  const vec4 bitMask = vec4(vec3(1.0/256.0), 0.0);
  vec4 depth = fract(z * bitShift);
  depth -= depth.gbaa * bitMask;
  return depth;
}

float unpackDepth(vec4 depth){
  const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/pow(256.0,2.0), 1.0/pow(256.0,3.0));
  float z = dot(depth, bitShift);
  return z;
}
`

export class ZFrame extends ZScene {
  size: Num2 = [1024, 1024]
  texture!: WebGLTexture
  framebuffer!: WebGLFramebuffer
  depthbuffer!: WebGLRenderbuffer

  constructor(gl: WebGLRenderingContext) {
    super(gl)
    this.init()
  }

  init() {
    const { gl } = this
    this.texture = gl.createTexture()!
    this.framebuffer = gl.createFramebuffer()!
    this.depthbuffer = gl.createRenderbuffer()!
  }

  useFrame() {
    const { gl, texture, framebuffer, depthbuffer, size } = this

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ...size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)

    gl.bindRenderbuffer(gl.RENDERBUFFER, depthbuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, ...size)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthbuffer)

    gl.viewport(0, 0, ...size)
  }

  clear() {
    const { gl } = this
    const { canvas } = gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.viewport(0, 0, canvas.width, canvas.height)
  }

  render() {
    this.useFrame()
    super.render()
    this.clear()
  }
}
