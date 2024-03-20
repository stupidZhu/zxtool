import { CommonUtil } from "@zxtool/utils"

type UboData = Record<string, number[]> | Array<Record<string, number[]>>

/** 因为不同引擎对于对象的 key 的遍历顺序可能不一样, 所以需要传入一个 structOrder */
export class ZUbo {
  private bufferData!: Float32Array
  private buffer?: WebGLBuffer

  private _data?: UboData
  get data(): UboData | undefined {
    return this._data
  }
  set data(d: UboData) {
    this._data = d
    this.processUboData(d)
    this.needUpdate = true
  }

  readonly structOrder: string[] = []
  needUpdate = true

  constructor(data: UboData, structOrder: string[]) {
    this.structOrder = structOrder
    this.data = data
  }

  private processUboData(data: UboData) {
    const processUboObj = (data: Record<string, number[]>) => {
      const arr: number[] = []
      this.structOrder.forEach(key => {
        const value = data[key]
        if (Array.isArray(value) && typeof value[0] === "number") {
          arr.push(...(CommonUtil.padArray(value.slice(0, 4), 4, 0) as number[]))
        }
      })
      return arr
    }
    if (Array.isArray(data)) {
      const res = data.map(processUboObj)
      this.bufferData = new Float32Array(res.flat())
    } else {
      this.bufferData = new Float32Array(processUboObj(data))
    }
  }

  useUbo(gl: WebGL2RenderingContext, bindingPoint: number) {
    if (!this.buffer) this.buffer = gl.createBuffer()!

    if (this.needUpdate) {
      gl.bindBufferBase(gl.UNIFORM_BUFFER, bindingPoint, this.buffer)
      gl.bufferData(gl.UNIFORM_BUFFER, this.bufferData, gl.DYNAMIC_DRAW)
    }
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer)
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, this.bufferData)
  }
}
