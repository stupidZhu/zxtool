import * as Cesium from "cesium"
import { merge } from "lodash"
import { MaterialUtil } from "../util/MaterialUtil"

const glsl = /* glsl */ `
uniform float speed;
uniform sampler2D img;
uniform float scale;
uniform bool round;
uniform bool opacity;

czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;
  if(round && distance(st, vec2(0.5)) > 0.5) discard;

  float t = fract(czm_frameNumber * speed * 0.005);
  float _t = 1.0 / (t * scale + 1e-3);

  st -= vec2(0.5);
  st *= _t;
  st += vec2(0.5);

  vec4 color = texture(img, st);

  material.diffuse = color.rgb;
  material.alpha = color.a;
  if(opacity) material.alpha *= (1.0 - t);
  return material;
}`

export interface DiffuseTextureMaterialPropertyOptions {
  img: string
  speed?: number
  scale?: number
  round?: boolean
  opacity?: boolean
}

export class DiffuseTextureMaterialProperty {
  private static readonly type = "DiffuseTextureMaterial"
  private static readonly defaultOptions: Required<DiffuseTextureMaterialPropertyOptions> = {
    img: "",
    speed: 1.0,
    scale: 1.0,
    round: true,
    opacity: true,
  }

  private _definitionChanged: Cesium.Event
  private options: Required<DiffuseTextureMaterialPropertyOptions>

  constructor(options: DiffuseTextureMaterialPropertyOptions) {
    this.options = merge({ ...DiffuseTextureMaterialProperty.defaultOptions }, options)
    this._definitionChanged = new Cesium.Event()

    MaterialUtil.addMaterial(DiffuseTextureMaterialProperty.type, {
      fabric: {
        type: DiffuseTextureMaterialProperty.type,
        uniforms: { ...DiffuseTextureMaterialProperty.defaultOptions },
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
    return DiffuseTextureMaterialProperty.type
  }

  getValue(time: any, result: any) {
    if (!Cesium.defined(result)) result = {}
    return merge(result, this.options)
  }

  equals(other: any) {
    return this === other && this.options === other.options
  }
}
