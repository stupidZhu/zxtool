import { Euler, Matrix4, Vector3 } from "@zxtool/three-math"
import { TRS } from "../TRS"
import { ZProgram } from "../ZProgram"
import { ZPlane } from "../geometry/ZPlane"

const _vs = `#version 300 es
in vec4 a_position;
in vec2 a_uv;
uniform mat4 u_pvMat;
uniform mat4 u_modelMat;
out vec2 v_uv;

void main(){
  v_uv = a_uv;
  gl_Position = u_pvMat * u_modelMat * a_position;
}`

const _fs = `#version 300 es
precision lowp float;
in vec2 v_uv;
uniform sampler2D u_tex;
out vec4 fragColor;

void main(){
  vec4 color = texture(u_tex, v_uv);
  fragColor = color;
}`

const _plane = new ZPlane()

export interface ZBillboardProps {
  plane?: ZPlane
  fixedUp?: boolean
  vs?: string
  fs?: string
}

export class ZBillboard extends ZProgram {
  readonly fixedUp: boolean
  readonly vertices: number[][] = []
  readonly colors: number[][] = []

  constructor(props: ZBillboardProps = {}) {
    const { plane = _plane, fixedUp = false, vs = _vs, fs = _fs } = props
    super(vs, fs)
    this.fixedUp = fixedUp
    this.setGeom(plane)
    this._init()
  }

  private _init() {
    this.name = "ZBillboard"
    this.transparent = true
    this.trs = new TRS()
    this.beforeRender = () => {
      const camera = this.root?.camera
      if (!camera) return

      const eye = camera.config.eye!.clone()
      const target = camera.config.target!.clone()
      if (this.fixedUp) eye.y = target.y

      const mat = new Matrix4().lookAt(eye, target, new Vector3(0, 1, 0))
      const euler = new Euler().setFromRotationMatrix(mat)
      this.trs!.rotation = [euler.x, euler.y, euler.z]
      super.updateWorldMat()
    }
  }
}
