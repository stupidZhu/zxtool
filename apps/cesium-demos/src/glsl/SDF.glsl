// https://zhuanlan.zhihu.com/p/491686813

precision mediump float;

uniform vec2 u_resolution;

float sdCircle(vec2 uv, float r) {
  return length(uv) - r;
}
float sdRect(vec2 uv, float r) {
  return max(abs(uv.x), abs(uv.y)) - r;
}
float sdTriangle(in vec2 uv, in float r) {
  float k = sqrt(3.0);
  uv.x = abs(uv.x) - r;
  uv.y = uv.y + r / k;
  if (uv.x + k*uv.y > 0.0)uv = vec2(uv.x - k*uv.y, - k*uv.x - uv.y) / 2.0;
  uv.x -= clamp(uv.x, - 2.0 * r, 0.0);
  return - length(uv) * sign(uv.y);
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (a - b) / k, 0.0, 1.0);
  return mix(a, b, h) - k*h * (1.0 - h);
}
float smax(float a, float b, float k) {
  return - smin(-a, - b, k);
}

float Scene(vec2 uv) {
  float w = 1.0 / u_resolution.x;
  float rect = sdRect(uv - vec2(0.2, 0.2), 0.4);
  float circle = sdCircle(uv + vec2(0.2, 0.2), 0.4);
  float triangle = sdTriangle(uv - vec2(0.2, 0.2), 0.4);
  
  // !只有d为负数时, 才会绘制出对应片元, 也就是说经过运算后最终结果为负数才会绘制
  
  // 并集
  // 如果点同时在两个形状内 ([-,-] => -)
  // 如果点同时在两个形状外 ([+,+] => +)
  // 如果点只在一个形状内   ([+,-] => -)
  // float d = min(rect, circle);
  
  // 交集
  // 如果点同时在两个形状内 ([-,-] => -)
  // 如果点同时在两个形状外 ([+,+] => +)
  // 如果点只在一个形状内   ([+,-] => +)
  // float d = max(rect, circle);
  
  // 圆形减矩形
  // 如果点同时在两个形状内 ([-,-] => [+,-] => +)
  // 如果点同时在两个形状外 ([+,+] => [-,+] => +)
  // 如果点只在矩形内 ([-,+] => [+,+] => +)
  // 如果点在圆形内 ([+,-] => [-,-] => -)
  // float d = max(-rect, circle);
  
  // 矩形减圆形
  // 如果点同时在两个形状内 ([-,-] => [-,+] => +)
  // 如果点同时在两个形状外 ([+,+] => [+,-] => +)
  // 如果点只在矩形内 ([-,+] => [-,-] => -)
  // 如果点在圆形内 ([+,-] => [+,+] => +)
  // float d = max(rect, - circle);
  
  // 补集
  // 如果点同时在两个形状内 ([-,-] => [+,+] => +)
  // 如果点同时在两个形状外 ([+,+] => [-,-] => -)
  // 如果点只在矩形内 ([-,+] => [+,-] => +)
  // 如果点在圆形内 ([+,-] => [-,+] => +)
  // float d = max(-rect, - circle);
  
  // 如果点同时在两个形状内 ([-,-] => [+,+] => +)
  // 如果点同时在两个形状外 ([+,+] => [-,-] => -)
  // 如果点只在矩形内 ([-,+] => [+,-] => -)
  // 如果点在圆形内 ([+,-] => [-,+] => -)
  // float d = min(-rect, - circle);
  
  float d = smin(triangle, circle, 0.1);
  
  return smoothstep(w, - w, d);
  // return step(0.0, - d);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  // 原点放屏幕中心, 范围 [-1, 1]
  uv *= 2.0;
  uv -= 1.0;
  uv.x *= u_resolution.x / u_resolution.y;
  
  vec3 col = vec3(0.0);
  
  col = mix(col, vec3(0.4471, 0.1686, 0.4471), Scene(uv));
  
  gl_FragColor = vec4(col, 1.0);
  
}