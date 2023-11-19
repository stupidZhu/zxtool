precision lowp float;

uniform vec2 u_resolution;
uniform float u_time;

float plot(vec2 uv, float pct) {
  return smoothstep(pct - 0.01, pct, uv.y) - smoothstep(pct , pct + 0.01, uv.y);
  // return smoothstep(0.0, 1.0, uv.x);
  // return 1.0 - step(0.005, abs(uv.y - uv.x));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  
  float x = sin(uv.x * 10.0);
  
  vec3 color = vec3(x);
  float t = plot(uv, x);
  
  color = (1.0 - t) * color + t * vec3(0.0, 1.0, 1.0);
  
  float y = smoothstep(0.2, 0.5, uv.x) - smoothstep(0.5, 0.8, uv.x);
  
  gl_FragColor = vec4(vec3(y), 1.0);
  
}