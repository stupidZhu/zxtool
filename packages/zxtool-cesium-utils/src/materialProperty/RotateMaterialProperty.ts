import * as Cesium from "cesium"
import { merge } from "lodash"
import { MaterialUtil } from "../util/MaterialUtil"

const shader = /* glsl */ `
#define PI 3.14159265358979323846

uniform sampler2D img;
uniform vec4 color;
uniform float speed;
uniform bool clockwise;

mat2 rotate2d(float angle) {
  return mat2(
    cos(angle), - sin(angle),
    sin(angle), cos(angle)
  );
}

czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;

  float _clockwise = clockwise ? 1.0 : -1.0;
  float t = czm_frameNumber * speed * 0.01 * _clockwise;
  st -= vec2(0.5);
  st *= rotate2d(t);
  st += vec2(0.5);

  vec4 _color = texture(img, st);
  _color *= color;

  material.diffuse = _color.rgb;
  material.alpha = _color.a;
  return material;
}`

const type = "RotateMaterial"

const defaultOptions: Required<RotateMaterialPropertyOptions> = {
  img: "",
  color: Cesium.Color.WHITE,
  speed: 1.0,
  clockwise: true,
}

export interface RotateMaterialPropertyOptions {
  img: string
  color?: Cesium.Color
  speed?: number
  clockwise?: boolean
}

export class RotateMaterialProperty {
  private _definitionChanged: Cesium.Event
  private options: Required<RotateMaterialPropertyOptions>

  constructor(options: RotateMaterialPropertyOptions) {
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
