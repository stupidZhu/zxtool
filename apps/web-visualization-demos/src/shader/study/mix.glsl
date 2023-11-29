#define PI 3.14159265358979323846

precision lowp float;

uniform float u_time;
uniform vec2 u_resolution;

float plot(vec2 uv, float t) {
  return smoothstep(t - 0.01, t, uv.y) - smoothstep(t, t + 0.01, uv.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  // vec3 color1 = vec3(0.4863, 0.7804, 0.098);
  // vec3 color2 = vec3(0.4, 0.6275, 0.7255);
  vec3 color1 = vec3(0.149, 0.141, 0.912);
  vec3 color2 = vec3(1.000, 0.833, 0.224);
  
  vec3 t = vec3(uv.x);
  
  t.r = smoothstep(0.0, 1.0, uv.x);
  t.g = sin(uv.x * PI);
  t.b = pow(uv.x, 0.5);
  
  vec3 color = mix(color1, color2, t);
  
  color = mix(color, vec3(1.0, 0.0, 0.0), plot(uv, t.r));
  color = mix(color, vec3(0.0, 1.0, 0.0), plot(uv, t.g));
  color = mix(color, vec3(0.0, 0.0, 1.0), plot(uv, t.b));
  
  gl_FragColor = vec4(color, 1.0);
}