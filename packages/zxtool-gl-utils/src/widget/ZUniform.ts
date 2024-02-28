import { isTypedArray as _isTypedArray, isNil } from "lodash"
import { ZTexture } from "./ZTexture"

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

export interface ZUniformOptions<T> {
  type?: "vec" | "matrix" | "int" | "float"
  getValueFunc?: (data: T) => any
  needUpdate?: boolean
}

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
  }

  private _isTexture = false
  get isTexture() {
    return this._isTexture
  }

  constructor(name: string, data: T, options: ZUniformOptions<T> = {}) {
    this.name = name
    this.data = data
    this.options = options
  }

  useUniform(gl: WebGLRenderingContext, location: WebGLUniformLocation, index?: number) {
    const { getValueFunc, needUpdate = true, type } = this.options
    if (!needUpdate && this.updated) return

    const value = getValueFunc?.(this.data) ?? this.data
    if (isNil(value)) return
    if (value instanceof ZTexture && !isNil(index)) {
      value.useTexture(gl, location, index)
    } else if (typeof value === "number" || typeof value === "boolean") {
      if (type === "int") gl.uniform1i(location, Number(value))
      else gl.uniform1f(location, Number(value))
    } else if (isTypedArray(value) || Array.isArray(value)) {
      if (!type) {
        if (!this.updated) console.error("请传入 options.type !!!")
        return
      }
      if (type === "matrix") {
        const len = Math.trunc(Math.sqrt(value.length))
        const fn = `uniformMatrix${len}fv`
        gl[fn](location, false, value)
      } else {
        const len = value.length
        const fn = `uniform${len}fv`
        gl[fn](location, value)
      }
    } else {
      if (!this.updated) {
        console.log(this.data)
        console.error("不支持的类型 !!!")
      }
    }

    this.updated = true
  }
}
