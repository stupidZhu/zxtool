#define PI 3.14159265358979323846

precision lowp float;

uniform vec2 u_resolution;
uniform float u_time;

float plot(vec2 uv) {
  return smoothstep(0.01, 0.0, abs(uv.x - uv.y));
}

float plot2(vec2 uv, float t) {
  return smoothstep(t - 0.01, t, uv.y) - smoothstep(t, t + 0.01, uv.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 color = vec3(0.0, 1.0, 1.0);
  
  // uv.x = pow(uv.x, 5.0);
  // vec3 c = vec3(uv.x);
  // float t = plot(uv);
  // c = (1.0 - t) * c + t*color;
  
  // float x = pow(uv.x, PI);
  // float x = smoothstep(0.0, 1.0, uv.x);
  // float x = smoothstep(0.0, 0.5, uv.x) - smoothstep(0.5, 1.0, uv.x);
  float x = smoothstep(0.5, 0.0, uv.x) + smoothstep(0.5, 1.0, uv.x);
  vec3 c = vec3(x);
  float t = plot2(uv, x);
  c = (1.0 - t) * c + t * color;
  
  gl_FragColor = vec4(c, 1.0);
}