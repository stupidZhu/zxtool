import { Matrix4, Vector3 } from "@zxtool/three-math"
import { Num3 } from "@zxtool/utils"

export interface BoundingPoints {
  minx?: Num3
  _minx?: Num3
  miny?: Num3
  _miny?: Num3
  minz?: Num3
  _minz?: Num3
  maxx?: Num3
  _maxx?: Num3
  maxy?: Num3
  _maxy?: Num3
  maxz?: Num3
  _maxz?: Num3
  r?: Num3
  _r?: Num3
}

/**
 * 带 `_` 的属性是初始值, 不带的是经过模型矩阵变换的值
 */
export class ZBounding {
  private completed = false
  vertices: number[][] = []
  modelMat?: Matrix4

  min: Num3 = [Infinity, Infinity, Infinity]
  _min: Num3 = [Infinity, Infinity, Infinity]
  max: Num3 = [-Infinity, -Infinity, -Infinity]
  _max: Num3 = [-Infinity, -Infinity, -Infinity]
  center: Num3 = [0, 0, 0]
  _center: Num3 = [0, 0, 0]

  r: number = 0
  width: number = 0
  height: number = 0
  depth: number = 0

  points: BoundingPoints = {}

  constructor(vertices?: number[][], modelMat?: Matrix4) {
    vertices && this.update(vertices, modelMat)
  }

  private updateRawData = () => {
    this._min = this.min
    this._max = this.max
    this._center = this.center

    const keys = ["minx", "miny", "minz", "maxx", "maxy", "maxz", "r"]
    keys.forEach(key => {
      this.points[`_${key}`] = this.points[key]
    })
  }

  update(vertices: number[][], modelMat?: Matrix4) {
    this.reset()
    this.vertices = vertices
    this.modelMat = modelMat

    const { min, max, points, center } = this

    vertices.forEach(item => {
      const [x = 0, y = 0, z = 0] = item
      if (x < min[0]) {
        min[0] = x
        points.minx = [x, y, z]
      }
      if (x > max[0]) {
        max[0] = x
        points.maxx = [x, y, z]
      }
      if (y < min[1]) {
        min[1] = y
        points.miny = [x, y, z]
      }
      if (y > max[1]) {
        max[1] = y
        points.maxy = [x, y, z]
      }
      if (z < min[2]) {
        min[2] = z
        points.minz = [x, y, z]
      }
      if (z > max[2]) {
        max[2] = z
        points.maxz = [x, y, z]
      }
    })

    center[0] = (min[0] + max[0]) * 0.5
    center[1] = (min[1] + max[1]) * 0.5
    center[2] = (min[2] + max[2]) * 0.5

    this.width = max[0] - min[0]
    this.height = max[1] - min[1]
    this.depth = max[2] - min[2]

    for (const k in points) {
      if (k === "r") continue
      const point = points[k]
      const dis = Math.sqrt((center[0] - point[0]) ** 2 + (center[1] - point[1]) ** 2 + (center[1] - point[1]) ** 2)
      if (dis > this.r) {
        this.r = dis
        points.r = point
      }
    }

    this.updateRawData()
    this.completed = true
    modelMat && this.updateModelMat(modelMat)
  }

  updateModelMat(modelMat: Matrix4) {
    this.modelMat = modelMat
    if (!this.completed) return

    const keys = ["center", "min", "max"]
    keys.forEach(key => {
      const point = this[`_${key}`]
      const pointV3 = new Vector3(...point)
      this[key] = [...pointV3.applyMatrix4(modelMat)] as Num3
    })

    const pointsKeys = ["minx", "miny", "minz", "maxx", "maxy", "maxz", "r"]
    pointsKeys.forEach(key => {
      const point = this.points[`_${key}`]
      const pointV3 = new Vector3(...point)
      this.points[key] = [...pointV3.applyMatrix4(modelMat)] as Num3
    })
  }

  reset() {
    this.completed = false
    this.min = [Infinity, Infinity, Infinity]
    this._min = [Infinity, Infinity, Infinity]
    this.max = [-Infinity, -Infinity, -Infinity]
    this._max = [-Infinity, -Infinity, -Infinity]
    this.center = [0, 0, 0]
    this._center = [0, 0, 0]
    this.r = 0
    this.width = 0
    this.height = 0
    this.depth = 0
    this.points = {}
    this.vertices = []
    this.modelMat = undefined
  }
}
