import { ZGeom } from "./ZGeom"

export class ZPlane extends ZGeom {
  readonly w: number
  readonly h: number
  readonly widthSegments: number
  readonly heightSegments: number

  constructor(w = 2, h = 2, widthSegments = 1, heightSegments = 1) {
    super()
    this.w = w
    this.h = h
    this.widthSegments = widthSegments
    this.heightSegments = heightSegments
    this.init()
  }

  private init() {
    const { w, h, widthSegments, heightSegments, vertices, normals, uvs, indices } = this
    const xCount = widthSegments + 1
    const yCount = heightSegments + 1

    for (let y = 0; y < yCount; y++) {
      for (let x = 0; x < xCount; x++) {
        const p = [(x / widthSegments) * w - w / 2, h / 2 - (y / heightSegments) * h, 0]
        vertices.push(p)
        normals.push([0, 0, 1])
        uvs.push([x / widthSegments, 1 - y / heightSegments])
        if (x && y) {
          const lt = (y - 1) * yCount + (x - 1)
          const lb = y * yCount + (x - 1)
          const rt = (y - 1) * yCount + x
          const rb = y * yCount + x
          indices.push(lt, lb, rb, rb, rt, lt)
        }
      }
    }
  }
}
