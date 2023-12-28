import * as Cesium from "cesium"
import { merge } from "lodash"
import { MaterialUtil } from "../util/MaterialUtil"

const glsl = /* glsl */ `
#define PI 3.14159265358979323846

uniform sampler2D img;
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
  float t = czm_frameNumber * speed * 0.01;
  st *= rotate2d(t);
  st += vec2(0.5);

  vec4 color = texture(img, st);

  material.diffuse = color.rgb;
  material.alpha = color.a;
  return material;
}`

export interface RotateTextureMaterialPropertyOptions {
  img: string
  speed?: number
}

export class RotateTextureMaterialProperty {
  private static readonly type = "RotateTextureMaterial"
  private static readonly defaultOptions: Required<RotateTextureMaterialPropertyOptions> = {
    img: "",
    speed: 1.0,
  }

  private _definitionChanged: Cesium.Event
  private options: Required<RotateTextureMaterialPropertyOptions>

  constructor(options: RotateTextureMaterialPropertyOptions) {
    this.options = merge({ ...RotateTextureMaterialProperty.defaultOptions }, options)
    this._definitionChanged = new Cesium.Event()

    MaterialUtil.addMaterial(RotateTextureMaterialProperty.type, {
      fabric: {
        type: RotateTextureMaterialProperty.type,
        uniforms: { ...RotateTextureMaterialProperty.defaultOptions },
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
    return RotateTextureMaterialProperty.type
  }

  getValue(time: any, result: any) {
    if (!Cesium.defined(result)) result = {}
    return merge(result, this.options)
  }

  equals(other: any) {
    return this === other && this.options === other.options
  }
}
