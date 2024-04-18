import { Matrix4 } from "@zxtool/three-math"
import { CommonUtil, Num2 } from "@zxtool/utils"
import { ZProgram } from ".."
import { multiplyMats } from "../../util"
import { ZPlane } from "../geometry"

const { onSet } = CommonUtil

const setUpdate = onSet<ZFixedTex>({
  after: ft => {
    // @ts-ignore
    ft.setModelMat(ft.calcModelMat())
  },
})

const _vs = `#version 300 es
in vec4 a_position;
in vec2 a_uv;
uniform mat4 u_modelMat;
out vec2 v_uv;

void main(){
  v_uv = a_uv;
  gl_Position = u_modelMat * vec4(a_position.xy, -1.0, 1.0);
}`

const _fs = `#version 300 es
precision lowp float;
in vec2 v_uv;
uniform sampler2D u_tex;
out vec4 fragColor;

void main(){
  fragColor = texture(u_tex, v_uv);
}`

export type FixedTexPosition = "TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_LEFT" | "BOTTOM_RIGHT"

const plane = new ZPlane()

const positionMap: Record<FixedTexPosition, Num2> = {
  TOP_LEFT: [-1, 1],
  TOP_RIGHT: [1, 1],
  BOTTOM_LEFT: [-1, -1],
  BOTTOM_RIGHT: [1, -1],
}

export interface ZFixedTexProps {
  texName?: string
  vs?: string
  fs?: string
}

export class ZFixedTex extends ZProgram {
  @setUpdate
  accessor padding: number = 0.01

  @setUpdate
  accessor scale: number = 0.2

  @setUpdate
  accessor position: FixedTexPosition = "TOP_LEFT"

  constructor(props: ZFixedTexProps = {}) {
    // eslint-disable-next-line prefer-const
    let { texName, vs = _vs, fs = _fs } = props
    if (texName) fs = fs.replaceAll("u_tex", texName)
    super(vs, fs)
    this._init()
  }

  private _init() {
    this.name = "ZFixedTex"
    // this.transparent = true
    this.setGeom(plane).setModelMat(this.calcModelMat())
  }

  private calcModelMat() {
    const { padding, scale, position } = this
    const t = 1 - scale - padding
    const p = positionMap[position].map(v => v * t) as Num2
    return multiplyMats(new Matrix4().makeTranslation(...p, 0), new Matrix4().makeScale(scale, scale, 1))
  }
}
