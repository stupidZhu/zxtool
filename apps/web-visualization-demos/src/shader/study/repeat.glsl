#define PI 3.14159265358979323846

precision lowp float;

uniform float u_time;
uniform vec2 u_resolution;

vec2 tile(vec2 uv, float zoom) {
  uv = uv * zoom;
  return fract(uv);
}

float box(vec2 uv, vec2 size) {
  vec2 halfSize = size * 0.5;
  vec2 t = step(uv, halfSize) * step(-halfSize, uv);
  return t.x * t.y;
}

float smoothBox(vec2 uv, vec2 size, float p) {
  vec2 halfSize = size * 0.5;
  vec2 t = smoothstep(halfSize + p, halfSize, uv) * smoothstep(-halfSize - p, - halfSize, uv);
  return t.x * t.y;
}

mat2 rotate2d(float angle) {
  return mat2(
    cos(angle), - sin(angle),
    sin(angle), cos(angle)
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  // uv = tile(uv, 3.0);
  
  uv = uv * 5.0;
  // uv.x += step(1.0, mod(uv.y, 2.0)) * 0.5;
  uv.y += (step(1.0, mod(uv.x, 2.0)) - 0.5) * 2.0 * fract(u_time);
  // uv.y += sin(uv.x * PI);
  uv = fract(uv);
  
  uv -= 0.5;
  
  vec3 color = vec3(0.4824, 0.8196, 0.451);
  
  // uv = rotate2d(u_time) * uv;
  
  float t = smoothBox(uv, vec2(0.7), 0.005);
  
  gl_FragColor = vec4(color, t);
}