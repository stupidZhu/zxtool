import { ZAttribute } from "../ZAttribute"
import { ZProgram } from "../ZProgram"

const _vs = `#version 300 es
in vec4 a_position;
in vec4 a_color;
uniform mat4 u_pvMat;
uniform mat4 u_modelMat;
out vec4 v_color;

void main(){
  v_color = a_color;
  gl_Position = u_pvMat * u_modelMat * a_position;
}`
const _fs = `#version 300 es
precision lowp float;

in vec4 v_color;
out vec4 fragColor;

void main(){
  fragColor = v_color;
}`

export interface ZAxisProps {
  size?: number
  vs?: string
  fs?: string
}

export class ZAxis extends ZProgram {
  readonly size: number
  readonly vertices: number[][] = []
  readonly colors: number[][] = []

  constructor(props: ZAxisProps = {}) {
    const { size = 10, vs = _vs, fs = _fs } = props
    super(vs, fs)
    this.size = size
    this._init()
  }

  private _init() {
    const { gl, vertices, colors, size } = this
    vertices.push([0, 0, 0], [size, 0, 0], [0, 0, 0], [0, size, 0], [0, 0, 0], [0, 0, size])
    colors.push([1, 0, 0], [1, 0, 0], [0, 1, 0], [0, 1, 0], [0, 0, 1], [0, 0, 1])

    this.addAttribute(new ZAttribute("a_position", { data: vertices }), new ZAttribute("a_color", { data: colors }))
    this.name = "ZAxis"
    this.renderTypes = [gl.LINES]
  }
}
