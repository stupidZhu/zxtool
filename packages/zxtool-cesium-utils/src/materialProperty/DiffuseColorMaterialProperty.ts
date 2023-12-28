import * as Cesium from "cesium"
import { merge } from "lodash"
import { MaterialUtil } from "../util/MaterialUtil"

const glsl = /* glsl */ `
#define PI 3.14159265358979323846

uniform vec4 color;
uniform float speed;
uniform bool opacity;

czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;
  st -= vec2(0.5);
  float t = fract(czm_frameNumber * speed * 0.01);

  float len = length(st);
  if(len > (t * 0.5)) discard;

  material.diffuse = color.rgb;
  material.alpha = color.a;
  if(opacity) material.alpha *= (1.0 - t);
  return material;
}`

export interface DiffuseColorMaterialPropertyOptions {
  color?: Cesium.Color
  speed?: number
  opacity?: boolean
}

export class DiffuseColorMaterialProperty {
  private static readonly type = "DiffuseColorMaterial"
  private static readonly defaultOptions: Required<DiffuseColorMaterialPropertyOptions> = {
    color: Cesium.Color.CYAN,
    speed: 1.0,
    opacity: true,
  }

  private _definitionChanged: Cesium.Event
  private options: Required<DiffuseColorMaterialPropertyOptions>

  constructor(options: DiffuseColorMaterialPropertyOptions) {
    this.options = merge({ ...DiffuseColorMaterialProperty.defaultOptions }, options)
    this._definitionChanged = new Cesium.Event()

    MaterialUtil.addMaterial(DiffuseColorMaterialProperty.type, {
      fabric: {
        type: DiffuseColorMaterialProperty.type,
        uniforms: { ...DiffuseColorMaterialProperty.defaultOptions },
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
    return DiffuseColorMaterialProperty.type
  }

  getValue(time: any, result: any) {
    if (!Cesium.defined(result)) result = {}
    return merge(result, this.options)
  }

  equals(other: any) {
    return this === other && this.options === other.options
  }
}
