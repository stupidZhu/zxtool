import * as Cesium from "cesium"
import { cloneDeep, isNil } from "lodash"
import { CoordHelper } from "../widget/CoordHelper"

const padArr = (arr: any[], value: any, length?: number) => {
  return Array.from(Array(length ?? arr.length)).map((item, index) => (isNil(arr[index]) ? value : arr[index]))
}

type TransformModelFunc = (props: {
  tileset: Cesium.Cesium3DTileset
  alpha?: number
  position?: [number, number, number?] // 经 纬 高
  translate?: [number, number, number]
  rotate?: [number, number, number]
  scale?: [number, number, number]
}) => Cesium.Cesium3DTileset

const headingPitchRollToFixedFrame = (origin: Cesium.Cartesian3, headingPitchRoll: [number, number, number]) => {
  return Cesium.Transforms.headingPitchRollToFixedFrame(
    origin,
    new Cesium.HeadingPitchRoll(...headingPitchRoll.map(item => Cesium.Math.toRadians(item))),
  )
}

const transformBIMModel: TransformModelFunc = props => {
  const { tileset, alpha = 1, position: p = [], translate: t = [], rotate: r = [], scale: s = [] } = props
  const [position, translate, rotate] = [padArr(p, 0, 3), padArr(t, 0, 3), padArr(r, 0, 3)]
  const scale = padArr(s, 1, 3).map(item => item || 1)

  if (!(tileset.boundingSphere as any).__center) {
    ;(tileset.boundingSphere as any).__center = cloneDeep(tileset.boundingSphere.center)
  }

  let center = (tileset.boundingSphere as any).__center
  if (position[0] && position[1]) center = Cesium.Cartesian3.fromDegrees(...(p as [number, number, number?]))
  center = CoordHelper.translate(center, translate)

  let modelMatrix = headingPitchRollToFixedFrame(center, rotate as [number, number, number])
  modelMatrix = Cesium.Matrix4.multiply(modelMatrix, Cesium.Matrix4.fromScale(new Cesium.Cartesian3(...scale)), modelMatrix)
  tileset.root.transform = modelMatrix

  alpha && (tileset.style = new Cesium.Cesium3DTileStyle({ color: `color('rgba(255,255,255,${alpha})')` }))

  return tileset
}

const TilesetUtil = {
  transformBIMModel,
}

export default TilesetUtil
