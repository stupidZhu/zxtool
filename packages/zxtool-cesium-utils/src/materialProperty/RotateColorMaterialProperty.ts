import * as Cesium from "cesium"
import { merge } from "lodash"
import { MaterialUtil } from "../util/MaterialUtil"

const glsl = /* glsl */ `
#define PI 3.14159265358979323846

uniform vec4 color;
uniform float speed;

mat2 rotate2d(float angle) {
  return mat2(
    cos(angle), - sin(angle),
    sin(angle), cos(angle)
  );
}

czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;
  st -= vec2(0.5);
  float t = czm_frameNumber * speed * 0.1;
  st *= rotate2d(t);

  float r = length(st);
  if (r > 0.5) discard;

  // [-PI, PI]
  float angle = atan(st.y, st.x);
  angle = (angle + PI) / (PI * 2.0);

  material.diffuse = color.rgb;
  material.alpha = angle;
  return material;
}`

export interface RotateColorMaterialPropertyOptions {
  color?: Cesium.Color
  speed?: number
}

export class RotateColorMaterialProperty {
  private static readonly type = "RotateColorMaterial"
  private static readonly defaultOptions: Required<RotateColorMaterialPropertyOptions> = {
    color: Cesium.Color.CYAN,
    speed: 1.0,
  }

  private _definitionChanged: Cesium.Event
  private options: Required<RotateColorMaterialPropertyOptions>

  constructor(options: RotateColorMaterialPropertyOptions) {
    this.options = merge({ ...RotateColorMaterialProperty.defaultOptions }, options)
    this._definitionChanged = new Cesium.Event()

    MaterialUtil.addMaterial(RotateColorMaterialProperty.type, {
      fabric: {
        type: RotateColorMaterialProperty.type,
        uniforms: { ...RotateColorMaterialProperty.defaultOptions },
        source: glsl,
      },
      translucent: true,
    })
  }

  get isConstant() {
    return false
  }

  get definitionChanged() {
    return this._definitionChanged
  }

  getType() {
    return RotateColorMaterialProperty.type
  }

  getValue(time: any, result: any) {
    if (!Cesium.defined(result)) result = {}
    return merge(result, this.options)
  }

  equals(other: any) {
    return this === other && this.options === other.options
  }
}
