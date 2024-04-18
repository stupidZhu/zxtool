import { Matrix4, Vector3 } from "@zxtool/three-math"
import { Num2, Num3 } from "@zxtool/utils"

export const lonLatRad2vec = (r: number, lon: number, lat: number): Num3 => {
  const x = r * Math.cos(lat) * Math.cos(lon)
  const y = r * Math.sin(lat)
  const z = -r * Math.cos(lat) * Math.sin(lon)
  return [x, y, z]
}

export const lonLat2vec = (r: number, lon: number, lat: number) => {
  const [_lon, _lat] = [lon, lat].map(item => (item * Math.PI) / 180)
  return lonLatRad2vec(r, _lon, _lat)
}

export const CoordHelper = {
  canvas2ndc(canvas: HTMLCanvasElement, coord: Num2): Num2 {
    const x = (coord[0] / canvas.clientWidth - 0.5) * 2
    const y = (coord[1] / canvas.clientHeight - 0.5) * -2
    return [x, y]
  },
  ndc2canvas(canvas: HTMLCanvasElement, coord: Num2): Num2 {
    const x = (coord[0] + 1) * 0.5 * canvas.clientWidth
    const y = (coord[1] - 1) * -0.5 * canvas.clientHeight
    return [x, y]
  },
  ndc2world(ndc: Num2, pvMatrix: Matrix4) {
    const mat = pvMatrix.clone().invert()
    return new Vector3(...ndc, 0).applyMatrix4(mat)
  },
  world2ndc(world: Vector3, pvMatrix: Matrix4): Num2 {
    const ndc = world.clone().applyMatrix4(pvMatrix)
    return [ndc.x, ndc.y]
  },
  canvas2world(canvas: HTMLCanvasElement, coord: Num2, pvMatrix: Matrix4) {
    const ndc = CoordHelper.canvas2ndc(canvas, coord)
    return CoordHelper.ndc2world(ndc, pvMatrix)
  },
  world2canvas(canvas: HTMLCanvasElement, world: Vector3, pvMatrix: Matrix4) {
    const ndc = CoordHelper.world2ndc(world, pvMatrix)
    return CoordHelper.ndc2canvas(canvas, ndc)
  },
}
