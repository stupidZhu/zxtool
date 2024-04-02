import { Num3 } from "@zxtool/utils"

export const lonLat2vec = (r: number, lon: number, lat: number) => {
  const [_lon, _lat] = [lon, lat].map(item => (item * Math.PI) / 180)
  return lonLatRad2vec(r, _lon, _lat)
}

export const lonLatRad2vec = (r: number, lon: number, lat: number): Num3 => {
  const x = r * Math.cos(lat) * Math.cos(lon)
  const y = r * Math.sin(lat)
  const z = -r * Math.cos(lat) * Math.sin(lon)
  return [x, y, z]
}
