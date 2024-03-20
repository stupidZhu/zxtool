class _ZGlobalStore {
  readonly programMap: Map<PropertyKey, WebGLProgram> = new Map()
  currentProgram: WebGLProgram | null = null
}

export const store = new _ZGlobalStore()
export type ZGlobalStore = _ZGlobalStore
