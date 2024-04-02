import { CommonUtil } from "@zxtool/utils"
import { chunk } from "lodash"

type UboData = Record<string, number[]> | Array<Record<string, number[]>>

/**
 * - 因为不同引擎对于对象的 key 的遍历顺序可能不一样, 所以需要传入一个 structOrder
 * - 只支持 `vec4` 和 `mat4`
 */
export class ZUbo<T> {
  private bufferData!: Float32Array
  private buffer?: WebGLBuffer

  data!: T
  readonly structOrder: string[] = []
  readonly getValueFunc?: (data: T) => UboData

  needUpdate = true
  private updated = false

  constructor(data: T, structOrder: string[], getValueFunc?: (data: T) => UboData) {
    this.structOrder = structOrder
    this.data = data
    this.getValueFunc = getValueFunc
  }

  getData() {
    return this.getValueFunc?.(this.data) ?? (this.data as UboData)
  }

  processUbo(gl: WebGL2RenderingContext, bindingPoint: number) {
    const { structOrder, needUpdate } = this
    if (!needUpdate && this.updated) return

    const data = this.getData()
    if (Array.isArray(data)) {
      const res = data.map(item => processUboObj(item, structOrder))
      this.bufferData = new Float32Array(res.flat())
    } else {
      this.bufferData = new Float32Array(processUboObj(data, structOrder))
    }

    if (!this.buffer) this.buffer = gl.createBuffer()!
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer)
    gl.bufferData(gl.UNIFORM_BUFFER, this.bufferData, gl.DYNAMIC_DRAW)
    gl.bindBufferBase(gl.UNIFORM_BUFFER, bindingPoint, this.buffer)
    gl.bindBuffer(gl.UNIFORM_BUFFER, null)

    this.updated = true
  }
}

const processUboObj = (data: Record<string, number[]>, structOrder: string[]) => {
  const arr: number[] = []
  structOrder.forEach(key => {
    const value = data[key]
    if (Array.isArray(value) && typeof value[0] === "number") {
      if (value.length <= 4) arr.push(...(CommonUtil.padArray(value.slice(0, 4), 4, 0) as number[]))
      else {
        const mat = chunk(value, 4)
        mat.forEach(row => arr.push(...(CommonUtil.padArray(row.slice(0, 4), 4, 0) as number[])))
      }
    }
  })
  return arr
}
