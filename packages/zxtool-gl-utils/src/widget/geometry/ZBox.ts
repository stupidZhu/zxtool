import { ZGeom } from "./ZGeom"

const POINTS = [
  [1, 1, 1],
  [-1, 1, 1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, -1],
]

const NORMALS = [
  [0, 0, 1],
  [1, 0, 0],
  [0, 0, -1],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
]

const UVS = [
  [0, 1],
  [0, 0],
  [1, 0],
  [1, 1],
]

export class ZBox extends ZGeom {
  readonly w: number
  readonly h: number
  readonly d: number

  constructor(w = 2, h = 2, d = 2) {
    super()
    this.w = w
    this.h = h
    this.d = d
    this.init()
  }

  private init() {
    const { w, h, d, vertices, normals, uvs, indices } = this
    const PS = POINTS.map(item => {
      return [item[0] * (w * 0.5), item[1] * (h * 0.5), item[2] * (d * 0.5)]
    })

    // prettier-ignore
    vertices.push(
      PS[1],PS[2],PS[3],PS[0],
      PS[0],PS[3],PS[4],PS[5],
      PS[5],PS[4],PS[7],PS[6],
      PS[6],PS[7],PS[2],PS[1],
      PS[6],PS[1],PS[0],PS[5],
      PS[2],PS[7],PS[4],PS[3],
    )
    // prettier-ignore
    normals.push(
      NORMALS[0],NORMALS[0],NORMALS[0],NORMALS[0],
      NORMALS[1],NORMALS[1],NORMALS[1],NORMALS[1],
      NORMALS[2],NORMALS[2],NORMALS[2],NORMALS[2],
      NORMALS[3],NORMALS[3],NORMALS[3],NORMALS[3],
      NORMALS[4],NORMALS[4],NORMALS[4],NORMALS[4],
      NORMALS[5],NORMALS[5],NORMALS[5],NORMALS[5],
    )
    // prettier-ignore
    uvs.push(
      UVS[0],UVS[1],UVS[2],UVS[3],
      UVS[0],UVS[1],UVS[2],UVS[3],
      UVS[0],UVS[1],UVS[2],UVS[3],
      UVS[0],UVS[1],UVS[2],UVS[3],
      UVS[0],UVS[1],UVS[2],UVS[3],
      UVS[0],UVS[1],UVS[2],UVS[3],
    )
    // prettier-ignore
    indices.push(
      0, 1, 2, 2, 3, 0,
      4, 5, 6, 6, 7, 4,
      8, 9, 10, 10, 11, 8,
      12, 13, 14, 14, 15, 12,
      16, 17, 18, 18, 19, 16,
      20, 21, 22, 22, 23, 20,
    )
  }
}
