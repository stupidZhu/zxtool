import * as Cesium from "cesium"
import MaterialUtil from "../util/MaterialUtil"

const glsl = `
czm_material czm_getMaterial(czm_materialInput materialInput) 
{
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;

  // [0, 1]
  float t = fract(czm_frameNumber * speed / 1000.0);

  vec4 sampledColor = texture2D(image, vec2(fract(st.s - t), st.t));
  material.alpha = sampledColor.a;
  material.diffuse = sampledColor.rgb;
  return material;
}`

class TrailLineMaterialProperty {
  _definitionChanged: Cesium.Event

  _image: string
  _speed: number

  constructor(image: string, speed = 5) {
    this._definitionChanged = new Cesium.Event()

    this._speed = speed
    this._image = image
  }

  get isConstant() {
    return false
  }

  get definitionChanged() {
    return this._definitionChanged
  }

  getType() {
    return "TrailLineMaterial"
  }

  getValue(time: any, result: any) {
    if (!Cesium.defined(result)) result = {}

    result.speed = this._speed
    result.image = this._image
    return result
  }

  equals(other: any) {
    return this === other
  }
}

MaterialUtil.addMaterial("TrailLineMaterial", {
  fabric: {
    type: "TrailLineMaterial",
    uniforms: { image: "", speed: 5 },
    source: glsl,
  },
  translucent() {
    return true
  },
})

export default TrailLineMaterialProperty
