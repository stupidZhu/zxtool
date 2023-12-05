type Num2 = [number, number]
type Num3 = [number, number, number]

type LonLat = Num2
type LonLatKey = { key: PropertyKey; lonLat: LonLat }
type LonLatObj = {
  lon: number
  lat: number
}
type LonLatHeight = Num3
type LonLatHeightObj = {
  lon: number
  lat: number
  height: number
}
type LonLatType = "degree" | "radian"

interface RECT {
  minx: number
  maxx: number
  miny: number
  maxy: number
}
