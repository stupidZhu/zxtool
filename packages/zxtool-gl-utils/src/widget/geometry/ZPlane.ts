import { ZGeom } from "./ZGeom"

export class ZPlane extends ZGeom {
  readonly w: number
  readonly h: number

  constructor(w = 2, h = 2) {
    super()
    this.w = w
    this.h = h
    this.init()
  }

  private init() {
    const { w, h, vertices, normals, uvs } = this
    const [x, y] = [w / 2, h / 2]
    vertices.push([-x, y, 0], [-x, -y, 0], [x, -y, 0], [x, y, 0])
    normals.push([0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1])
    uvs.push([0, 1], [0, 0], [1, 0], [1, 1])
    this.indices.push(0, 1, 2, 2, 3, 0)
  }
}
