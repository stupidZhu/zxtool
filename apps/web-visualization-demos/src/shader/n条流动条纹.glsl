precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

const int N = 5;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution;
  
  float percent = 0.1;
  
  // 颜色数组
  vec3 colors[N];
  colors[0] = vec3(0.0, 0.5, 0.5);
  colors[1] = vec3(0.5, 0.0, 0.5);
  colors[2] = vec3(0.5, 0.5, 0.0);
  colors[3] = vec3(0.0, 0.0, 0.5);
  colors[4] = vec3(0.5, 0.0, 0.0);
  
  float t = fract(u_time / 5.0);
  float alphas[N];
  
  float alpha;
  
  for(int i = 0; i < N; i ++ ) {
    float ti = fract(t + float(i) / float(N));
    ti *= (1.0 + percent);
    alphas[i] = smoothstep(ti - percent, ti, st.s) * step(-ti, - st.s);
    alpha += alphas[i];
  }
  
  vec3 color = vec3(0.0);
  
  for(int i = 0; i < N; i ++ ) {
    color += alphas[i] * colors[i];
  }
  
  gl_FragColor = vec4(color, alpha);
}
