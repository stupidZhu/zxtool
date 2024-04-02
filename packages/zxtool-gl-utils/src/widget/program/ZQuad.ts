import { ZProgram } from "../ZProgram"
import { ZPlane } from "../geometry"

const quadVs = `#version 300 es
in vec4 a_position;
in vec2 a_uv;
uniform mat4 u_pvMat;
uniform mat4 u_modelMat;
out vec2 v_uv;

void main(){
  v_uv = a_uv;
  gl_Position = a_position;
}`
const quadVsWithMat = `#version 300 es
in vec4 a_position;
in vec2 a_uv;
uniform mat4 u_pvMat;
uniform mat4 u_modelMat;
out vec2 v_uv;

void main(){
  v_uv = a_uv;
  gl_Position = u_pvMat * u_modelMat *  a_position;
}`
const quadFs = `#version 300 es
precision lowp float;

in vec2 v_uv;
uniform sampler2D u_tex;
out vec4 fragColor;

void main(){
  fragColor = texture(u_tex, v_uv);
}`

const plane = new ZPlane()

export interface ZQuadProps {
  vs?: string
  fs?: string
  withMat?: boolean
}

export class ZQuad extends ZProgram {
  constructor(props: ZQuadProps = {}) {
    const { vs, fs, withMat } = props
    const _vs = vs ?? (withMat ? quadVsWithMat : quadVs)
    const _fs = fs ?? quadFs
    super(_vs, _fs)

    this._init()
  }

  private _init() {
    const { gl } = this
    this.name = "ZQuad"
    this.setGeom(plane)
    this.beforeRender = () => {
      gl.depthMask(false)
    }
    this.afterRender = () => {
      gl.depthMask(true)
    }
  }
}
