import { Vector3 } from "@zxtool/three-math"
import { lonLatRad2vec } from "../../util"
import { ZGeom } from "./ZGeom"

export class ZSphere extends ZGeom {
  readonly r: number
  readonly widthSegments: number
  readonly heightSegments: number

  constructor(r = 1, widthSegments = 16, heightSegments = 16) {
    super()
    this.r = r
    this.widthSegments = widthSegments
    this.heightSegments = heightSegments
    this.init()
  }

  init() {
    const { r, widthSegments, heightSegments, vertices, normals, uvs, indices } = this
    const xCount = widthSegments + 1
    const yCount = heightSegments + 1

    const perLon = (Math.PI * 2) / widthSegments
    const perLat = Math.PI / heightSegments

    for (let y = 0; y < yCount; y++) {
      const lat = Math.PI / 2 - y * perLat
      for (let x = 0; x < xCount; x++) {
        const lon = x * perLon - Math.PI
        const v3 = lonLatRad2vec(r, lon, lat)
        vertices.push(v3)
        normals.push([...new Vector3(...v3).normalize()])
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
