import { isTypedArray as _isTypedArray, isNil } from "lodash"
import { genZGUMsg } from "../util/util"
import type { ZGPProgram } from "./ZGPProgram"
import { store } from "./ZGlobalStore"
import type { ZProgram } from "./ZProgram"
import { ZTexture } from "./ZTexture"
import { ZUbo } from "./ZUbo"

const genMsg = genZGUMsg("ZUniform")

export type TypedArray =
  | Float32Array
  | Uint16Array
  | Int32Array
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint32Array
  | Float64Array
const isTypedArray = (v: any): v is TypedArray => _isTypedArray(v)

export type UniformSetType = "vec" | "mat" | "int" | "float"
export interface UseUniformProps {
  gl: WebGL2RenderingContext
  program: WebGLProgram
  zProgram: ZProgram | ZGPProgram
  index?: number
}

export interface ZUniformOptions<T> {
  type?: UniformSetType
  getValueFunc?: (data: T) => unknown
  needUpdate?: boolean
}

export interface UniformInfo {
  updated: boolean
  location?: number | WebGLUniformLocation | null
}

/**
 * - 可以处理的类型: `ZTexture`, `ZUbo`, `number`, `boolean`, `number[]`, `number[][]`
 * - 如果存在 `options.getValueFunc`, 可以处理的类型为 `getValueFunc` 的返回值, 否则为 `data` 的类型
 * - 如果类型为 `number[]` 或者 `number[][]`, 则必
 * 须传入 `options.type`, 且值为 `"vec" | "mat"`
 */
export class ZUniform<T = any> {
  readonly name: string
  readonly type?: UniformSetType
  readonly getValueFunc?: (data: T) => unknown

  needUpdate = true
  private uniformInfos: WeakMap<ZProgram | ZGPProgram, UniformInfo> = new WeakMap()

  private _data!: T
  get data() {
    return this._data
  }
  set data(v: T) {
    this._data = v
    if (v instanceof ZTexture) this._isTexture = true
    if (v instanceof ZUbo) this._isUbo = true
  }

  private _isTexture = false
  get isTexture() {
    return this._isTexture
  }

  private _isUbo = false
  get isUbo() {
    return this._isUbo
  }

  constructor(name: string, data: T, options: ZUniformOptions<T> = {}) {
    this.name = name
    this.data = data
    const { type, getValueFunc, needUpdate = true } = options
    this.type = type
    this.getValueFunc = getValueFunc
    this.needUpdate = needUpdate
  }

  getData() {
    return this.getValueFunc?.(this.data) ?? this.data
  }

  private getUniformLocation(gl: WebGL2RenderingContext, program: WebGLProgram, zProgram: ZProgram | ZGPProgram) {
    const debugMode = zProgram.debugMode ?? store.debugMode
    const { name: programName } = zProgram
    const { name, isUbo } = this

    let info = this.uniformInfos.get(zProgram)!
    if (!info) {
      this.uniformInfos.set(zProgram, { updated: false })
      info = this.uniformInfos.get(zProgram)!
    }

    if (info.location === undefined) {
      const location = isUbo ? gl.getUniformBlockIndex(program, name) : gl.getUniformLocation(program, name)
      if ((location === null || location === -1) && debugMode) {
        console.log(genMsg(`${programName} 没有找到 name 为 ${name} 的 uniform`, "warn"))
      }
      info.location = location
    }

    return info.location
  }

  processUniform(props: UseUniformProps) {
    const { gl, program, zProgram, index } = props
    const { needUpdate, type } = this
    if (!needUpdate && this.uniformInfos.get(zProgram)?.updated) return

    const location = this.getUniformLocation(gl, program, zProgram)
    if (location === -1 || isNil(location)) return

    const value = this.getData()
    if (isNil(value)) return

    textureChain.run({ gl, program, location, value, updated: this.uniformInfos.get(zProgram)!.updated, index, type })
    this.uniformInfos.get(zProgram)!.updated = true
  }
}

interface UniformChainParams {
  gl: WebGL2RenderingContext
  program: WebGLProgram
  location: WebGLUniformLocation | number
  value: unknown
  updated: boolean
  index?: number
  type?: UniformSetType
}
// uniform 职责链
class UniformChain<T extends any[] = [UniformChainParams]> {
  func: (...rest: T) => boolean | void
  nextChain: UniformChain<T> | null = null

  constructor(func: (...rest: T) => boolean | void) {
    this.func = func
  }

  setNext(chain: UniformChain<T>) {
    this.nextChain = chain
    return chain
  }

  run(...rest: T) {
    if (this.func(...rest) === false) this.nextChain?.run(...rest)
  }
}

const textureChain = new UniformChain(params => {
  const { gl, location, value, index } = params
  if (value instanceof ZTexture && !isNil(index)) value.useTexture(gl, location, index)
  else return false
})

const uboChain = new UniformChain(params => {
  const { gl, program, location, value, index, updated } = params
  if (value instanceof ZUbo && !isNil(index)) {
    if (!updated) gl.uniformBlockBinding(program, location as number, index)
    value.processUbo(gl, index)
  } else return false
})

const numChain = new UniformChain(params => {
  const { gl, location, value, type } = params
  if (typeof value === "number" || typeof value === "boolean") {
    if (type === "int") gl.uniform1i(location, Number(value))
    else gl.uniform1f(location, Number(value))
  } else return false
})

const arrayChain = new UniformChain(params => {
  const { gl, location, value, type, updated } = params
  if (isTypedArray(value) || Array.isArray(value)) {
    if (!type) {
      if (!updated) console.error(genMsg("data 是数组的情况下, 需要传入 options.type", "error"))
      return
    }
    const first = value[0]
    if (type === "mat") {
      if (Array.isArray(first)) {
        const len = Math.trunc(Math.sqrt(first.length))
        const fn = `uniformMatrix${len}fv`
        gl[fn](location, false, [...value].flat())
      } else {
        const len = Math.trunc(Math.sqrt(value.length))
        const fn = `uniformMatrix${len}fv`
        gl[fn](location, false, value)
      }
    } else if (type === "vec") {
      if (Array.isArray(first)) {
        const len = first.length
        const fn = `uniform${len}fv`
        gl[fn](location, [...value].flat())
      } else {
        const len = value.length
        const fn = `uniform${len}fv`
        gl[fn](location, value)
      }
    } else {
      if (!updated) console.error(genMsg("data 是数组的情况下, options.type 只接受 'mat' | 'vec'", "error"))
      return
    }
  } else return false
})

const unknownChain = new UniformChain(params => {
  const { value, updated } = params
  if (!updated) console.error(genMsg("不支持的类型"), value)
})

textureChain.setNext(uboChain).setNext(numChain).setNext(arrayChain).setNext(unknownChain)
