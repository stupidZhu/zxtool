precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

mat2 rotate(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, - s, s, c);
}

float sdCircle(vec2 uv, float r) {
    return length(uv) - r;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv *= 2.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    vec4 mixedColor = vec4(0.0);
    vec4 color = vec4(0.0784, 0.1294, 0.3529, 1.0);
    vec4 color2 = vec4(0.0784, 0.3529, 0.2157, 1.0);
    
    float w = 1.0 / u_resolution.x;
    
    float circle = sdCircle(uv, 0.5);
    float circle2 = sdCircle(uv, 0.3);
    
    // --------------------------------------------
    
    // * 以下五种写法等价
    // float alpha = 1.0 - step(0.0, circle);
    // float alpha = step(0.0, - circle);
    // float alpha = smoothstep(-w, w, - circle);
    // float alpha = smoothstep(w, - w, circle);
    // float alpha = 1.0 - smoothstep(-w, w, circle);
    
    // --------------------------------------------
    
    // float c1 = smoothstep(w, - w, circle);
    // float c2 = smoothstep(w, - w, circle2);
    
    // mixedColor = mix(mixedColor, color, c1);
    // mixedColor = mix(mixedColor, color2, c2);
    
    // --------------------------------------------
    
    float d = length(uv);
    // step: 第一个参数大就是 0.0, 第二个参数大就是 1.0
    // float r = step(0.5, d) * smoothstep(0.7, 0.5, d);
    // float r = smoothstep(0.5, 0.5 + 3.0 * w, d) * smoothstep(0.7, 0.5, d);
    
    // float r = step(d, 0.7) * smoothstep(0.5, 0.7, d);
    // float r = smoothstep(0.7 + 3.0 * w, 0.7, d) * smoothstep(0.5, 0.7, d);
    
    // float r = smoothstep(0.7, 0.5, d) * smoothstep(0.5, 0.7, d);
    // float r = smoothstep(w, - w, circle) * smoothstep(w, - w, - circle2);
    
    // float r = step(0.5, d) * step(d, 0.7);
    // float r = smoothstep(0.5, 0.5 + 3.0 * w, d) * smoothstep(0.7 + 3.0 * w, 0.7 , d);
    // float r = smoothstep(0.5, 0.5 + 0.2, d) * smoothstep(0.7 + 0.2, 0.7 , d);
    
    float a = abs(fract(u_time / 2.0));
    float r = step(0.0 + a, d) * step(d, 0.2 + a);
    
    mixedColor = mix(mixedColor, vec4(1.0), r - a);
    // mixedColor.a = 1.0 - a;
    
    // --------------------------------------------
    
    gl_FragColor = mixedColor;
    
}