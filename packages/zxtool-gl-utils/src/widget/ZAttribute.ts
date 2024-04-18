import { CommonUtil } from "@zxtool/utils"
import { genZGUMsg } from "../util/util"
import type { ZGPProgram } from "./ZGPProgram"
import { store } from "./ZGlobalStore"
import type { ZProgram } from "./ZProgram"

const { onSet } = CommonUtil

const setUpdate = onSet<ZAttribute>({
  after: attr => {
    attr.needUpdate = true
  },
})

const genMsg = genZGUMsg("ZAttribute")

export interface DataBuffer<T> {
  data: T
  bufferData?: Float32Array
  buffer?: WebGLBuffer
  getValueFunc?: (data: T) => number[][]
}

export interface CustomBuffer {
  buffer: WebGLBuffer // 直接传入 buffer (GPGPU)
  perSize: number
}

export interface SizeBuffer {
  count: number
  perSize: number
  buffer?: WebGLBuffer
}

export interface ZAttributeOptions<T> {
  data?: T
  customBuffer?: CustomBuffer
  sizeBuffer?: Omit<SizeBuffer, "buffer">
  isInstanceAttr?: boolean
  getValueFunc?: (data: T) => number[][]
}

export interface ProcessAttrProps {
  gl: WebGL2RenderingContext
  program: WebGLProgram
  zProgram: ZProgram | ZGPProgram
}

export interface AttrInfo {
  updated: boolean
  location?: number
}

export class ZAttribute<T = any> {
  readonly name: string

  @setUpdate
  accessor dataBuffer: DataBuffer<T> | null = null

  @setUpdate
  accessor customBuffer: CustomBuffer | null = null

  @setUpdate
  accessor sizeBuffer: SizeBuffer | null = null

  readonly isInstanceAttr: boolean

  needUpdate = true
  private attrInfos: WeakMap<ZProgram | ZGPProgram, AttrInfo> = new WeakMap()

  constructor(name: string, options: ZAttributeOptions<T>) {
    const { data, customBuffer, sizeBuffer, isInstanceAttr = false, getValueFunc } = options
    this.name = name
    if (data) this.dataBuffer = { data, getValueFunc }
    if (customBuffer) this.customBuffer = customBuffer
    if (sizeBuffer) this.sizeBuffer = sizeBuffer
    this.isInstanceAttr = isInstanceAttr
  }

  getData = () => {
    const { dataBuffer } = this
    if (!dataBuffer) return null
    return dataBuffer.getValueFunc?.(dataBuffer.data) ?? (dataBuffer.data as number[][])
  }

  private getAttrLocation(gl: WebGL2RenderingContext, program: WebGLProgram, zProgram: ZProgram | ZGPProgram) {
    const debugMode = zProgram.debugMode ?? store.debugMode
    const { name: programName } = zProgram
    const { name } = this

    let info = this.attrInfos.get(zProgram)!
    if (!info) {
      this.attrInfos.set(zProgram, { updated: false })
      info = this.attrInfos.get(zProgram)!
    }

    if (info.location === undefined) {
      const location = gl.getAttribLocation(program, name)
      if (location === -1 && debugMode) console.log(genMsg(`${programName} 没有找到 name 为 ${name} 的 attribute`, "warn"))
      info.location = location
    }

    return info.location
  }

  processAttr(props: ProcessAttrProps) {
    const { gl, program, zProgram } = props
    const { dataBuffer, customBuffer, sizeBuffer, isInstanceAttr } = this
    if (!this.needUpdate && this.attrInfos.get(zProgram)?.updated) return 0
    this.needUpdate = false

    const location = this.getAttrLocation(gl, program, zProgram)
    if (location === -1) return 0

    let count = 0
    let perSize = 0
    const BYTES = Float32Array.BYTES_PER_ELEMENT

    if (customBuffer) {
      const { buffer } = customBuffer
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

      perSize = customBuffer.perSize
      if (!isInstanceAttr) count = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE) / (customBuffer.perSize * BYTES)
    } else if (dataBuffer) {
      const data = this.getData()!
      if (!data.length) return 0
      if (!dataBuffer.buffer) dataBuffer.buffer = gl.createBuffer()!
      dataBuffer.bufferData = new Float32Array(data.flat())
      const { buffer, bufferData } = dataBuffer

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW)

      perSize = data[0].length
      if (!isInstanceAttr) count = data.length
    } else if (sizeBuffer) {
      if (!sizeBuffer.buffer) sizeBuffer.buffer = gl.createBuffer()!

      gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer.buffer)
      gl.bufferData(gl.ARRAY_BUFFER, sizeBuffer.count * sizeBuffer.perSize * BYTES, gl.STATIC_DRAW)

      perSize = sizeBuffer.perSize
      if (!isInstanceAttr) count = sizeBuffer.count
    }

    if (perSize > 4) {
      for (let i = 0; i < Math.floor(perSize / 4); i++) {
        const loc = location! + i
        const offset = BYTES * 4 * i // 每行 4 个数
        gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, BYTES * perSize, offset)
        gl.enableVertexAttribArray(loc)
        if (isInstanceAttr) gl.vertexAttribDivisor(loc, 1)
      }
    } else {
      gl.vertexAttribPointer(location, perSize, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(location)
      if (isInstanceAttr) gl.vertexAttribDivisor(location, 1)
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    this.attrInfos.get(zProgram)!.updated = true
    return count
  }
}
