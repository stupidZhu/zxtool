#define PI 3.14159265358979323846

precision lowp float;

uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv -= 0.5;
  vec3 color = vec3(0.4824, 0.8196, 0.451);
  
  // [0,1]
  float radius = length(uv) * 2.0;
  // [-PI, PI]
  float angle = atan(uv.y, uv.x);
  
  // float t = cos(angle * 4.0);
  float t = abs(cos(angle * 6.0) * sin(angle * 3.0));
  
  // color = vec3(1.0 - smoothstep(t, t + 0.001, radius));
  t = step(radius, t);
  
  gl_FragColor = vec4(color, t);
  
}