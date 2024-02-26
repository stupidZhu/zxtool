import * as Cesium from "cesium"
import { merge } from "lodash"
import { MaterialUtil } from "../util/MaterialUtil"

const shader = /* glsl */ `
uniform sampler2D img;
uniform vec4 color;
uniform float speed;
uniform float rotate;

mat2 rotate2d(float angle) {
  return mat2(
    cos(angle), - sin(angle),
    sin(angle), cos(angle)
  );
}

czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;
  st *= rotate2d(rotate);

  float t = fract(czm_frameNumber * speed / 500.0);
  vec4 _color = texture(img, vec2(fract(st.s - t), st.t));
  _color *= color;

  material.diffuse = _color.rgb;
  material.alpha = _color.a;
  return material;
}`

const type = "FlowTextureMaterial"
const defaultOptions: Required<FlowTextureMaterialPropertyOptions> = {
  img: "",
  color: Cesium.Color.WHITE,
  speed: 1.0,
  rotate: 0.0,
}

export interface FlowTextureMaterialPropertyOptions {
  img: string
  color?: Cesium.Color
  speed?: number
  rotate?: number
}

export class FlowTextureMaterialProperty {
  private _definitionChanged: Cesium.Event
  private options: Required<FlowTextureMaterialPropertyOptions>

  constructor(options: FlowTextureMaterialPropertyOptions) {
    this.options = merge({ ...defaultOptions }, options)
    this._definitionChanged = new Cesium.Event()
  }

  get isConstant() {
    return false
  }

  get definitionChanged() {
    return this._definitionChanged
  }

  getType() {
    return type
  }

  getValue(time: any, result: any) {
    if (!Cesium.defined(result)) result = {}
    return merge(result, this.options)
  }

  equals(other: any) {
    return this === other && this.options === other.options
  }
}

MaterialUtil.addMaterial(type, {
  fabric: {
    type: type,
    uniforms: { ...defaultOptions },
    source: shader,
  },
  translucent: true,
})
