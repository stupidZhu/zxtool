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
  readonly texture!: WebGLTexture
  readonly textures!: WebGLTexture[]
  private framebuffer!: WebGLFramebuffer
  private depthbuffer!: WebGLRenderbuffer
  needUpdate = true

  constructor(gl: WebGL2RenderingContext, textureCount = 1) {
    super(gl)
    this.textures = Array.from(Array(textureCount), () => gl.createTexture()!)
    this.texture = this.textures[0]
    this.framebuffer = gl.createFramebuffer()!
    this.depthbuffer = gl.createRenderbuffer()!
  }

  useFrame() {
    const { gl, textures, framebuffer, depthbuffer, size } = this

    textures.forEach((texture, index) => {
      gl.activeTexture(gl.TEXTURE0 + index)
      gl.bindTexture(gl.TEXTURE_2D, texture)
    })

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)

    gl.bindRenderbuffer(gl.RENDERBUFFER, depthbuffer)

    gl.viewport(0, 0, ...size)

    if (this.needUpdate) {
      this.needUpdate = false

      const buffers: number[] = []
      textures.forEach((texture, index) => {
        buffers.push(gl.COLOR_ATTACHMENT0 + index)

        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ...size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

        gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 4, gl.RGBA8, ...size)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, texture, 0)
      })
      gl.drawBuffers(buffers)

      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, ...size)
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthbuffer)
    }
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
