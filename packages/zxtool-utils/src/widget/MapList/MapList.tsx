export class MapList<T> {
  readonly list: T[] = []
  readonly map: Map<PropertyKey, T> = new Map()

  has(key: PropertyKey) {
    return this.map.has(key)
  }

  get(key: PropertyKey) {
    return this.map[key]
  }

  set(key: PropertyKey, value: T) {
    const _v = this.map.get(key)
    if (_v !== value) {
      this.delete(key)
      this.list.push(value)
      this.map.set(key, value)
    }
  }

  delete(key: PropertyKey) {
    const value = this.map.get(key)

    if (value) {
      const index = this.list.indexOf(value)
      this.list.splice(index, 1)
      this.map.delete(key)
    }
  }

  clear() {
    this.list.length = 0
    this.map.clear()
  }
}
