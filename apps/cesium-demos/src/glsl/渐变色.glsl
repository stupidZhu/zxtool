precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  
  vec3 color1 = vec3(0.5, 0.5, 0.8);
  vec3 color2 = vec3(0.5, 0.8, 0.5);
  
  // 渐变
  float d = smoothstep(0.0, 1.0, uv.x);
  // 突变
  float t = step(uv.x, 0.5);
  
  gl_FragColor = vec4(mix(color1, color2, d), 1.0);
}