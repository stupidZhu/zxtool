import { isTypedArray as _isTypedArray, isNil } from "lodash"
import { genZGUInfo } from "../util/util"
import { ZTexture } from "./ZTexture"
import { ZUbo } from "./ZUbo"

const genInfo = genZGUInfo("ZUniform")

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

export type UniformSetType = "vec" | "matrix" | "int" | "float"
export interface UseUniformProps {
  gl: WebGL2RenderingContext
  program: WebGLProgram
  location: WebGLUniformLocation
  index?: number
}

export interface ZUniformOptions<T> {
  type?: UniformSetType
  getValueFunc?: (data: T) => unknown
  needUpdate?: boolean
}

/**
 * - 可以处理的类型: `ZTexture`, `ZUbo`, `number`, `boolean`, `number[]`, `number[][]`
 * - 如果存在 `options.getValueFunc`, 可以处理的类型为 `getValueFunc` 的返回值, 否则为 `data` 的类型
 * - 如果类型为 `number[]` 或者 `number[][]`, 则必须传入 `options.type`, 且值为 `"vec" | "matrix"`
 */
export class ZUniform<T = any> {
  readonly name: string
  readonly options: ZUniformOptions<T>
  private updated = false

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
    this.options = options
  }

  useUniform(props: UseUniformProps) {
    const { gl, program, location, index } = props
    const { getValueFunc, needUpdate = true, type } = this.options
    if (!needUpdate && this.updated) return

    const value = getValueFunc?.(this.data) ?? this.data
    if (isNil(value)) return

    textureChain.run({ gl, program, location, value, updated: this.updated, index, type })

    this.updated = true
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
    value.useUbo(gl, index)
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
      if (!updated) console.error(genInfo("data 是数组的情况下, 需要传入 options.type"))
      return
    }
    const first = value[0]
    if (type === "matrix") {
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
      if (!updated) console.error(genInfo("data 是数组的情况下, options.type 只接受 'matrix' | 'vec'"))
      return
    }
  } else return false
})

const unknownChain = new UniformChain(params => {
  const { value, updated } = params
  if (!updated) console.error(genInfo("不支持的类型"), value)
})

textureChain.setNext(uboChain).setNext(numChain).setNext(arrayChain).setNext(unknownChain)
