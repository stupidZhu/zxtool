precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

const int N = 5;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution;
  
  float percent = 0.1;
  vec4 color = vec4(0.6588, 0.8784, 0.5137, 1.0);
  vec4 bgColor = vec4(0.1529, 0.5412, 0.8588, 0.2);
  
  float t = fract(u_time / 5.0);
  
  float alpha;
  
  for(int i = 0; i < N; i ++ ) {
    float ti = fract(t + float(i) / float(N));
    ti *= (1.0 + percent);
    // float _alpha = step(ti - percent, st.s) * step(-ti, - st.s);
    // 线条的宽度为 ti - (ti - percent) = percent, 左界由 smoothstep 第一个参数决定, 右界由 step 第一个参数决定
    float _alpha = smoothstep(ti - percent, ti , st.s) * step(-ti , - st.s);
    alpha += _alpha * color.a;
  }
  
  gl_FragColor = mix(bgColor, vec4(color.rgb, 1.0), alpha);
}
