import * as Cesium from "cesium"
import MaterialUtil from "../util/MaterialUtil"

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
  _definitionChanged: Cesium.Event

  _color: Cesium.Color
  _bgColor: Cesium.Color
  _speed: number
  _percent: number
  _gradient: boolean
  _count: number

  constructor(options: TrailLine2MaterialPropertyOptions) {
    const {
      color = Cesium.Color.CYAN,
      bgColor = Cesium.Color.WHITE.withAlpha(0.0),
      speed = 1.0,
      percent = 0.1,
      gradient = true,
      count = 1.0,
    } = options
    this._definitionChanged = new Cesium.Event()

    this._color = color
    this._bgColor = bgColor
    this._speed = speed
    this._percent = percent
    this._gradient = gradient
    this._count = count
  }

  get isConstant() {
    return false
  }

  get definitionChanged() {
    return this._definitionChanged
  }

  getType() {
    return "TrailLine2Material"
  }

  getValue(time: any, result: any) {
    if (!Cesium.defined(result)) result = {}

    result.color = this._color
    result.bgColor = this._bgColor
    result.speed = this._speed
    result.percent = this._percent
    result.gradient = this._gradient
    result.count = this._count
    return result
  }

  equals(other: any) {
    return this === other
  }
}

MaterialUtil.addMaterial("TrailLine2Material", {
  fabric: {
    type: "TrailLine2Material",
    uniforms: {
      color: Cesium.Color.CYAN,
      bgColor: Cesium.Color.WHITE.withAlpha(0),
      speed: 1.0,
      percent: 0.1,
      gradient: true,
      count: 1.0,
    },
    source: glsl,
  },
  translucent: true,
})
