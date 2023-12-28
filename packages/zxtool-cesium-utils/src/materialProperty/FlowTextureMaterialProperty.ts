import * as Cesium from "cesium"
import { merge } from "lodash"
import { MaterialUtil } from "../util/MaterialUtil"

const glsl = /* glsl */ `
uniform float speed;
uniform sampler2D img;
uniform bool yAxis;

czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;

  float t = fract(czm_frameNumber * speed / 500.0);
  vec4 color = vec4(0.0);
  if(yAxis) {
    color = texture(img, vec2(fract(st.t - t), st.s));
  } else {
    color = texture(img, vec2(fract(st.s - t), st.t));
  }

  material.diffuse = color.rgb;
  material.alpha = color.a;
  return material;
}`

export interface FlowTextureMaterialPropertyOptions {
  img: string
  speed?: number
  yAxis?: boolean
}

export class FlowTextureMaterialProperty {
  private static readonly type = "FlowTextureMaterial"
  private static readonly defaultOptions: Required<FlowTextureMaterialPropertyOptions> = {
    img: "",
    speed: 1.0,
    yAxis: false,
  }

  private _definitionChanged: Cesium.Event
  private options: Required<FlowTextureMaterialPropertyOptions>

  constructor(options: FlowTextureMaterialPropertyOptions) {
    this.options = merge({ ...FlowTextureMaterialProperty.defaultOptions }, options)
    this._definitionChanged = new Cesium.Event()

    MaterialUtil.addMaterial(FlowTextureMaterialProperty.type, {
      fabric: {
        type: FlowTextureMaterialProperty.type,
        uniforms: { ...FlowTextureMaterialProperty.defaultOptions },
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
    return FlowTextureMaterialProperty.type
  }

  getValue(time: any, result: any) {
    if (!Cesium.defined(result)) result = {}
    return merge(result, this.options)
  }

  equals(other: any) {
    return this === other && this.options === other.options
  }
}
