import * as Cesium from "cesium"
import { merge } from "lodash"
import { MaterialUtil } from "../util/MaterialUtil"

const textureShader = /* glsl */ `
uniform sampler2D img;
uniform vec4 color;
uniform float speed;
uniform bool yoyo;

czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;
  float t = czm_frameNumber * speed * 0.01;
  t = yoyo ? sin(t * 3.14) * 0.5 + 0.5: fract(t);

  vec4 iColor = texture(img, st);
  iColor *= color;

  material.diffuse = iColor.rgb;
  material.alpha = iColor.a * t;
  return material;
}`

const colorShader = /* glsl */ `
uniform vec4 color;
uniform float speed;
uniform bool yoyo;

czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  float t = czm_frameNumber * speed * 0.01;
  t = yoyo ? sin(t * 3.14) * 0.5 + 0.5: fract(t);

  material.diffuse = color.rgb;
  material.alpha = t;
  return material;
}`

const defaultOptions: Required<BlinkMaterialPropertyOptions> = {
  img: "",
  color: Cesium.Color.WHITE,
  speed: 1.0,
  yoyo: true,
}

export interface BlinkMaterialPropertyOptions {
  img?: string
  color?: Cesium.Color
  speed?: number
  yoyo?: boolean
}

export class BlinkMaterialProperty {
  private _definitionChanged: Cesium.Event
  private options: Required<BlinkMaterialPropertyOptions>

  constructor(options: BlinkMaterialPropertyOptions) {
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
    return this.options.img ? "BlinkTextureMaterial" : "BlinkColorMaterial"
  }

  getValue(time: any, result: any) {
    if (!Cesium.defined(result)) result = {}
    return merge(result, this.options)
  }

  equals(other: any) {
    return this === other && this.options === other.options
  }
}

MaterialUtil.addMaterial("BlinkTextureMaterial", {
  fabric: {
    type: "BlinkTextureMaterial",
    uniforms: { ...defaultOptions },
    source: textureShader,
  },
  translucent: true,
})

MaterialUtil.addMaterial("BlinkColorMaterial", {
  fabric: {
    type: "BlinkColorMaterial",
    uniforms: { ...defaultOptions },
    source: colorShader,
  },
  translucent: true,
})
