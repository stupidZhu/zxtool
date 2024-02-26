import * as Cesium from "cesium"
import { merge } from "lodash"
import { MaterialUtil } from "../util/MaterialUtil"

const colorShader = /* glsl */ `
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

const textureShader = /* glsl */ `
uniform sampler2D img;
uniform vec4 color;
uniform float speed;
uniform float scale;
uniform bool opacity;

czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;

  float t = fract(czm_frameNumber * speed * 0.005);
  float _t = 1.0 / (t * scale + 1e-3);

  st -= vec2(0.5);
  st *= _t;
  st += vec2(0.5);

  if(st.x<0.0 || st.x>1.0 || st.y<0.0 || st.y>1.0) discard;

  vec4 _color = texture(img, st);
  _color *= color;

  material.diffuse = _color.rgb;
  material.alpha = _color.a;
  if(opacity) material.alpha *= (1.0 - t);
  return material;
}`

const defaultOptions: Required<DiffuseMaterialPropertyOptions> = {
  img: "",
  color: Cesium.Color.WHITE,
  speed: 1.0,
  opacity: true,
  scale: 1.0,
}

export interface DiffuseMaterialPropertyOptions {
  img?: string
  color?: Cesium.Color
  speed?: number
  opacity?: boolean
  scale?: number
}

export class DiffuseMaterialProperty {
  private _definitionChanged: Cesium.Event
  private options: Required<DiffuseMaterialPropertyOptions>

  constructor(options: DiffuseMaterialPropertyOptions) {
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
    return this.options.img ? "DiffuseTextureMaterial" : "DiffuseColorMaterial"
  }

  getValue(time: any, result: any) {
    if (!Cesium.defined(result)) result = {}
    return merge(result, this.options)
  }

  equals(other: any) {
    return this === other && this.options === other.options
  }
}

MaterialUtil.addMaterial("DiffuseColorMaterial", {
  fabric: {
    type: "DiffuseColorMaterial",
    uniforms: { ...defaultOptions },
    source: colorShader,
  },
  translucent: true,
})

MaterialUtil.addMaterial("DiffuseTextureMaterial", {
  fabric: {
    type: "DiffuseTextureMaterial",
    uniforms: { ...defaultOptions },
    source: textureShader,
  },
  translucent: true,
})
