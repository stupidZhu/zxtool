#define PI 3.14159265358979323846

precision lowp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_texture_0;

mat2 rotate2d(float angle) {
  return mat2(
    cos(angle), - sin(angle),
    sin(angle), cos(angle)
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  
  uv -= vec2(0.5);
  uv *= rotate2d(u_time * 0.5);
  uv += vec2(0.5);
  
  vec4 color = texture2D(u_texture_0, uv);
  
  gl_FragColor = color;
}