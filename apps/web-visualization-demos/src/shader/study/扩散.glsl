#define PI 3.14159265358979323846

precision lowp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_texture_0;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = fract(u_time * 0.5);
  
  uv -= vec2(0.5);
  uv /= t*3.0;
  uv += vec2(0.5);
  
  if (distance(uv, vec2(0.5)) > 0.5)discard;
  
  vec4 color = texture2D(u_texture_0, uv);
  
  gl_FragColor = vec4(color.rgb, color.a * (1.0 - t));
}