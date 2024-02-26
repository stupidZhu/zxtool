import * as Cesium from "cesium"
import { merge } from "lodash"
import { MaterialUtil } from "../util/MaterialUtil"

const shader = /* glsl */ `
uniform vec4 color;
uniform vec4 bgColor;
uniform float speed;
uniform float percent;
uniform bool gradient;

vec4 colorSuperposition (vec4 frontColor, vec4 bgColor) {
  float alphaF = frontColor.a + bgColor.a * (1.0 - frontColor.a);
  vec4 color = (frontColor * frontColor.a + bgColor * bgColor.a * (1.0 - frontColor.a)) / alphaF;
  return color;
}

czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;

  float t = fract(czm_frameNumber * speed / 500.0);
  t *= (1.0 + percent);
  float alpha = 1.0;
  if(gradient) alpha = smoothstep(t - percent, t, st.s) * (1.0 - step(t, st.s));
  else alpha = step(t - percent, st.s) * (1.0 - step(t, st.s));

  vec4 mixedColor = colorSuperposition(vec4(color.rgb, color.a * alpha), bgColor);

  material.diffuse = mixedColor.rgb;
  material.alpha = mixedColor.a;
  return material;
}`

const type = "FlowColorMaterial"
const defaultOptions: Required<FlowColorMaterialPropertyOptions> = {
  color: Cesium.Color.WHITE,
  bgColor: Cesium.Color.WHITE.withAlpha(0.0),
  speed: 1.0,
  percent: 0.1,
  gradient: true,
}

export interface FlowColorMaterialPropertyOptions {
  color?: Cesium.Color
  bgColor?: Cesium.Color
  speed?: number
  percent?: number
  gradient?: boolean
}

export class FlowColorMaterialProperty {
  private _definitionChanged: Cesium.Event
  private options: Required<FlowColorMaterialPropertyOptions>

  constructor(options: FlowColorMaterialPropertyOptions) {
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
