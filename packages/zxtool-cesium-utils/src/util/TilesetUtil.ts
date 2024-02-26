import * as Cesium from "cesium"
import { Cesium3DTileset } from "cesium"
import { CoordHelper } from "../helper"
import { genZCUInfo } from "./util"

const genInfo = genZCUInfo("TilesetUtil")

export interface TransformTilesetOptions {
  position?: Cesium.Cartesian3
  translate?: Cesium.Cartesian3
  scale?: Cesium.Cartesian3
  rotation?: Cesium.HeadingPitchRoll
  viewer?: Cesium.Viewer
}

/**
 * 调整位置, 平移, 缩放
 * 一般用作 3DTile 模型
 */
const transformTileset = (tileset: Cesium.Cesium3DTileset, options: TransformTilesetOptions) => {
  const {
    position,
    translate,
    scale = new Cesium.Cartesian3(1, 1, 1),
    rotation = new Cesium.HeadingPitchRoll(0, 0, 0),
    viewer,
  } = options
  const backup = {
    center: tileset.boundingSphere.center.clone(),
    transform: tileset.root.transform.clone(),
    modelMatrix: tileset.modelMatrix.clone(),
  }
  let center = position ?? tileset.boundingSphere.center
  if (translate) center = CoordHelper.translate(center, translate, viewer)
  const translateMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center)
  const scaleMatrix = Cesium.Matrix4.fromScale(scale)
  const rotationMatrix = Cesium.Matrix4.fromRotation(Cesium.Matrix3.fromHeadingPitchRoll(rotation))

  const temp = Cesium.Matrix4.multiply(rotationMatrix, scaleMatrix, new Cesium.Matrix4())
  const transform = Cesium.Matrix4.multiply(translateMatrix, temp, new Cesium.Matrix4())

  tileset.root.transform = transform
  tileset.modelMatrix = Cesium.Matrix4.IDENTITY
  tileset.__customField = backup
}

export interface TranslateTilesetOptions {
  position?: Cesium.Cartesian3
  translate?: Cesium.Cartesian3
  viewer?: Cesium.Viewer
}
/**
 * 调整位置, 会保持原来的姿态
 * 一般用作 3DTile 倾斜摄影
 */
const translateTileset = (tileset: Cesium3DTileset, options: TranslateTilesetOptions) => {
  const { position, translate, viewer } = options
  const backup = {
    center: tileset.boundingSphere.center.clone(),
    transform: tileset.root.transform.clone(),
    modelMatrix: tileset.modelMatrix.clone(),
  }
  let center = position ?? tileset.boundingSphere.center
  if (translate) center = CoordHelper.translate(center, translate, viewer)

  const subtract = Cesium.Cartesian3.subtract(center, tileset.boundingSphere.center, new Cesium.Cartesian3())
  tileset.modelMatrix = Cesium.Matrix4.fromTranslation(subtract)
  tileset.__customField = backup
}

/**
 * 恢复 3DTile 初始状态
 * 只对使用 transformTileset/translateTileset 调整状态的模型有效
 */
const restoreTileset = (tileset: Cesium3DTileset) => {
  const { transform, modelMatrix } = tileset.__customField ?? ({} as any)
  if (!transform || !modelMatrix) {
    return console.error(genInfo("restoreTileset 只对使用 transformTileset/translateTileset 调整状态的模型有效"))
  }
  tileset.modelMatrix = modelMatrix
  tileset.root.transform = transform
}

export const TilesetUtil = {
  transformTileset,
  translateTileset,
  restoreTileset,
}
