import { Matrix4, Vector3 } from "@zxtool/three-math"
import { Num3 } from "@zxtool/utils"
import { cloneDeep } from "lodash"

export interface BoundingInfo {
  min: Num3
  max: Num3
  center: Num3
  size: Num3
  r: number
}

const defaultBoundingInfo: BoundingInfo = {
  min: [Infinity, Infinity, Infinity],
  max: [-Infinity, -Infinity, -Infinity],
  center: [0, 0, 0],
  size: [0, 0, 0],
  r: 0,
}

export class ZBounding {
  vertices?: number[][]
  modelMat?: Matrix4

  readonly rawInfo = cloneDeep(defaultBoundingInfo)
  readonly info = cloneDeep(defaultBoundingInfo)

  private updated = false

  constructor(vertices?: number[][], modelMat?: Matrix4) {
    vertices && this.update(vertices, modelMat)
  }

  update(vertices: number[][], modelMat?: Matrix4) {
    this.reset()
    this.vertices = vertices
    this.modelMat = modelMat
    const { rawInfo } = this

    setBoundingInfo(vertices, rawInfo)
    this.updated = true

    if (modelMat) this.updateModelMat(modelMat)
    else {
      Object.keys(defaultBoundingInfo).forEach(key => {
        this.info[key] = cloneDeep(this.rawInfo[key])
      })
    }
  }

  updateModelMat(modelMat: Matrix4) {
    this.modelMat = modelMat
    if (!this.updated) return
    Object.entries(defaultBoundingInfo).forEach(([key, value]) => {
      this.info[key] = cloneDeep(value)
    })
    const { info, rawInfo } = this
    const { max, min } = rawInfo

    const points = [
      new Vector3(min[0], min[1], min[2]).applyMatrix4(modelMat).toArray(),
      new Vector3(min[0], min[1], max[2]).applyMatrix4(modelMat).toArray(),
      new Vector3(min[0], max[1], min[2]).applyMatrix4(modelMat).toArray(),
      new Vector3(min[0], max[1], max[2]).applyMatrix4(modelMat).toArray(),
      new Vector3(max[0], min[1], min[2]).applyMatrix4(modelMat).toArray(),
      new Vector3(max[0], min[1], max[2]).applyMatrix4(modelMat).toArray(),
      new Vector3(max[0], max[1], min[2]).applyMatrix4(modelMat).toArray(),
      new Vector3(max[0], max[1], max[2]).applyMatrix4(modelMat).toArray(),
    ]

    setBoundingInfo(points, info)
  }

  reset() {
    Object.entries(defaultBoundingInfo).forEach(([key, value]) => {
      this.rawInfo[key] = cloneDeep(value)
      this.info[key] = cloneDeep(value)
    })
    this.vertices = undefined
    this.modelMat = undefined
  }
}

const setBoundingInfo = (points: number[][], info: BoundingInfo) => {
  const { min, max } = info
  points.forEach(item => {
    const [x = 0, y = 0, z = 0] = item
    if (x < min[0]) min[0] = x
    if (x > max[0]) max[0] = x
    if (y < min[1]) min[1] = y
    if (y > max[1]) max[1] = y
    if (z < min[2]) min[2] = z
    if (z > max[2]) max[2] = z
  })

  info.center = [(min[0] + max[0]) * 0.5, (min[1] + max[1]) * 0.5, (min[2] + max[2]) * 0.5]
  info.size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]]
  const { center } = info
  info.r = Math.sqrt((center[0] - min[0]) ** 2 + (center[1] - min[1]) ** 2 + (center[2] - min[2]) ** 2)
}
