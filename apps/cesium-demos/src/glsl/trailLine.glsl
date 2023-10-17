precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
  float percent = 0.2;
  bool gradient = false;
  vec3 lineColor = vec3(0.6588, 0.8784, 0.5137);
  vec4 bgColor = vec4(0.1529, 0.5412, 0.8588, 0.2);
  
  vec2 st = gl_FragCoord.xy / u_resolution;
  
  float t = fract(u_time / 5.0);
  // 延长动画周期, 从 1 延长到 percent + 1.0
  t *= (percent + 1.0);
  
  float alpha = 0.0;
  if (gradient) {
    // smoothstep(t - percent, t, st.s): x 坐标小于 t - percent 时的值为 0, 大于等于 t 时值为 1, 中间值根据 st.s 的值线性变化
    // step(t, st.s): x 坐标大于等于 t 时值为 1, 小于 t 时值为 0
    alpha = smoothstep(t - percent, t, st.s) * step(-t, - st.s);
  }else {
    alpha = step(t - percent, st.s) * step(-t, - st.s);
  }
  
  vec4 v_lineColor = vec4(lineColor, alpha);
  
  gl_FragColor = mix(bgColor, v_lineColor , alpha);
}