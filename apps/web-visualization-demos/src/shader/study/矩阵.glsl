#define PI 3.14159265358979323846

precision lowp float;

uniform float u_time;
uniform vec2 u_resolution;

float myBox(vec2 uv, vec2 size) {
  vec2 halfSize = size / 2.0;
  return step(uv.x, halfSize.x) * step(-halfSize.x, uv.x) * step(uv.y, halfSize.y) * step(-halfSize.y, uv.y);
}

float myBox1(vec2 uv, vec2 size) {
  vec2 halfSize = size / 2.0;
  vec2 r = smoothstep(halfSize + 0.001, halfSize, uv) * smoothstep(-halfSize - 0.001, - halfSize, uv);
  return r.x * r.y;
}

float cross(vec2 uv, float size) {
  return myBox1(uv, vec2(size * 0.25, size)) + myBox1(uv, vec2(size, size * 0.25));
}

mat2 rotate2d(float angle) {
  return mat2(
    cos(angle), - sin(angle),
    sin(angle), cos(angle)
  );
}

mat2 scale2d(vec2 scale) {
  return mat2(
    scale.x, 0.0,
    0.0, scale.y
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv -= 0.5;
  
  // vec3 color = vec3(0.4824, 0.8196, 0.451);
  
  uv = rotate2d(sin(u_time) * PI) * uv;
  
  float t = cross(uv, 0.3);
  vec3 color = vec3(uv + 0.5, 1.0);
  color += t;
  
  gl_FragColor = vec4(color, 1.0);
}