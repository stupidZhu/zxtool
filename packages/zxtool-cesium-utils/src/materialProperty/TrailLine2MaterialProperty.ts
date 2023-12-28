import * as Cesium from "cesium"
import { merge } from "lodash"
import { MaterialUtil } from "../util/MaterialUtil"

const glsl = /* glsl */ `
uniform vec4 color;
uniform vec4 bgColor;
uniform float speed;
uniform float percent;
uniform bool gradient;
uniform float count;

const int N = 10;

czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;

  float t = fract(czm_frameNumber * speed / 500.0);

  float alphas[N];
  float alpha;
  
  int i_count = int(min(float(N), count));
  for(int i = 0; i < N; i ++ ) {
    if(i > i_count) break;

    float ti = fract(t + float(i) / float(i_count));
    ti *= (1.0 + percent);

    if(gradient) {
      alphas[i] = smoothstep(ti - percent, ti , st.s) * step(-ti , - st.s);
    } else {
      alphas[i] = step(ti - percent, st.s) * step(-ti, - st.s);
    }

    alpha += alphas[i] * color.a;
  }

  vec4 mixedColor = mix(bgColor, vec4(color.rgb, 1.0), alpha);

  material.diffuse = mixedColor.rgb;
  material.alpha = mixedColor.a;
  return material;
}`

export interface TrailLine2MaterialPropertyOptions {
  color?: Cesium.Color
  bgColor?: Cesium.Color
  speed?: number
  percent?: number
  gradient?: boolean
  count?: number
}

export class TrailLine2MaterialProperty {
  private static readonly type = "TrailLine2Material"
  private static readonly defaultOptions: Required<TrailLine2MaterialPropertyOptions> = {
    color: Cesium.Color.CYAN,
    bgColor: Cesium.Color.WHITE.withAlpha(0.0),
    speed: 1.0,
    percent: 0.1,
    gradient: true,
    count: 1.0,
  }

  private _definitionChanged: Cesium.Event
  private options: Required<TrailLine2MaterialPropertyOptions>

  constructor(options: TrailLine2MaterialPropertyOptions) {
    this.options = merge({ ...TrailLine2MaterialProperty.defaultOptions }, options)
    this._definitionChanged = new Cesium.Event()

    MaterialUtil.addMaterial(TrailLine2MaterialProperty.type, {
      fabric: {
        type: TrailLine2MaterialProperty.type,
        uniforms: { ...TrailLine2MaterialProperty.defaultOptions },
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
    return TrailLine2MaterialProperty.type
  }

  getValue(time: any, result: any) {
    if (!Cesium.defined(result)) result = {}
    return merge(result, this.options)
  }

  equals(other: any) {
    return this === other && this.options === other.options
  }
}
