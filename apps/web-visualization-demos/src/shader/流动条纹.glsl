#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution;
  
  // > 0 向右移动, < 0 向左移动
  float flowSpeed = -2.0;
  float stripeWidth = 0.1;
  float stripeGap = 0.1;
  vec3 color1 = vec3(0.1608, 0.4863, 0.2039);
  vec3 color2 = vec3(0.1608, 0.2745, 0.4863);
  
  // 计算流动偏移量
  float offset = flowSpeed / 10.0 * u_time;
  
  // 应用偏移实现流动
  float x = st.x - offset;
  // [0, stripeWidth + stripeGap] => [0, 0.2]
  float alter = mod(x, stripeWidth + stripeGap);
  
  float on = step(alter, stripeWidth);
  
  gl_FragColor = vec4(mix(color1, color2, on), 1.0);
  
  // 两条流动细带
  // vec2 st = gl_FragCoord.xy / u_resolution;
  
  // float speed = 0.2;
  // float bandWidth = 0.1;
  
  // // 计算两个带的偏移量
  // float offset1 = fract(u_time * speed);
  // float offset2 = fract(u_time * speed + 0.5);
  
  // // 对st.x应用偏移实现移动
  // float x1 = st.x + offset1;
  // float x2 = st.x + offset2;
  
  // // 根据x生成两条细带
  // float band1 = step(fract(x1), bandWidth);
  // float band2 = step(fract(x2), bandWidth);
  
  // // 结合两条带
  // float bands = band1 + band2;
  
  // gl_FragColor = vec4(vec3(bands), 1.0);
}