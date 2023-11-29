#define PI 3.14159265358979323846

precision lowp float;

uniform float u_time;
uniform vec2 u_resolution;

float circle(in vec2 uv, in float radius) {
  vec2 dist = uv - vec2(0.5);
  return 1.0 - smoothstep(radius - (radius * 0.01), radius + (radius * 0.01), dot(dist, dist) * 4.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 color = vec3(0.4824, 0.8196, 0.451);
  
  // 矩形框
  // vec2 s = step(vec2(0.1), uv);
  // vec2 s1 = 1.0 - step(vec2(0.9), uv);
  // // 1.0 - uv 相当于把圆点移动到右上角
  // // vec2 s1 = step(vec2(0.1), 1.0 - uv);
  // float t = s.x * s.y * s1.x * s1.y;
  
  // 矩形框2
  // vec2 s = smoothstep(vec2(0.0), vec2(0.1), uv);
  // vec2 s1 = smoothstep(vec2(0.0), vec2(0.1), 1.0 - uv);
  // float t = s.x * s.y * s1.x * s1.y;
  
  // 圆
  // float t = distance(uv, vec2(0.5));
  // // t = step(t, 0.5);
  // t = smoothstep(0.49, 0.5, t);
  
  // 圆2
  // float t = circle(uv, 1.0);
  
  uv = uv * 2.0 - 1.0;
  float t = length(abs(uv) - 0.5);
  // float t = length(uv + 0.5);
  // float t = length(min(abs(uv) - 0.3, 0.0));
  t = fract(t * 10.0 - u_time * 3.0);
  gl_FragColor = vec4(color, t);
  
  // gl_FragColor = vec4(vec3(t), 1.0);
}