import { Num3 } from "@zxtool/utils"
import { cloneDeep } from "lodash"
import { ZAttribute } from "../ZAttribute"
import { ZProgram } from "../ZProgram"
import { ZUniform } from "../ZUniform"

const _vs = `#version 300 es
in vec4 a_position;
uniform mat4 u_pvMat;
uniform mat4 u_modelMat;

void main(){
  gl_Position = u_pvMat * u_modelMat *  a_position;
}`
const _fs = `#version 300 es
precision lowp float;

uniform vec3 u_color;
out vec4 fragColor;

void main(){
  fragColor = vec4(u_color, 1.0);
}`

const lineBoxVertices = [
  [-1, -1, -1],
  [1, -1, -1],
  [-1, 1, -1],
  [1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [-1, 1, 1],
  [1, 1, 1],
]
const lineBoxIndices = [0, 1, 1, 3, 3, 2, 2, 0, 4, 5, 5, 7, 7, 6, 6, 4, 0, 4, 1, 5, 3, 7, 2, 6]

export interface ZLineBoxProps {
  color?: Num3
  vs?: string
  fs?: string
}

export class ZLineBox extends ZProgram {
  readonly vertices: number[][] = cloneDeep(lineBoxVertices)
  readonly indices: number[] = [...lineBoxIndices]
  color: Num3

  constructor(props: ZLineBoxProps = {}) {
    const { color = [0, 1, 1], vs = _vs, fs = _fs } = props
    super(vs, fs)
    this.color = color
    this._init()
  }

  private _init() {
    const { gl, vertices, indices } = this

    this.addAttribute(new ZAttribute("a_position", { data: vertices }))
      .setIndies(indices)
      .addUniform(new ZUniform("u_color", this, { getValueFunc: v => v.color, type: "vec" }))
    this.name = "ZLineBox"
    this.renderTypes = [gl.LINES]
  }
}
