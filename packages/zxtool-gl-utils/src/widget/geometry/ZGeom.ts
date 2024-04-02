import { ZAttribute } from "../ZAttribute"
import type { ZGPProgram } from "../ZGPProgram"
import type { ZProgram } from "../ZProgram"

export class ZGeom {
  readonly vertices: number[][] = []
  readonly aPosition = new ZAttribute<any>("a_position", { data: this, getValueFunc: () => this.vertices })

  readonly normals: number[][] = []
  protected _aNormal?: ZAttribute
  get aNormal() {
    return this._aNormal
  }

  readonly uvs: number[][] = []
  protected _aUv?: ZAttribute
  get aUv() {
    return this._aUv
  }

  readonly indices: number[] = []

  setProgramGeom(program: ZProgram | ZGPProgram) {
    program.addAttribute(this.aPosition)
    if (this.normals.length) {
      if (!this._aNormal) this._aNormal = new ZAttribute("a_normal", { data: this, getValueFunc: () => this.normals })
      program.addAttribute(this.aNormal!)
    }
    if (this.uvs.length) {
      if (!this._aUv) this._aUv = new ZAttribute("a_uv", { data: this, getValueFunc: () => this.uvs })
      program.addAttribute(this.aUv!)
    }
    if (this.indices.length) (program as ZProgram).setIndies?.(this.indices)
  }
}
