
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
float sdRect(vec2 uv, float r) {
    return max(abs(uv.x), abs(uv.y)) - r;
}
float gouyu(vec2 uv, float angle) {
    uv *= rotate(angle);
    
    float w = 1.0 / u_resolution.x;
    float circle1 = sdCircle(uv , 0.2);
    float circle2 = sdCircle(uv - vec2(-0.1, 0.0), 0.103);
    float circle3 = sdCircle(uv - vec2(0.102, 0.0), 0.099);
    
    float s = max(-circle2, circle1);
    s = max(s, uv.y);
    s = min(s, circle3);
    
    return smoothstep(w, - w, s);
}

float gouyu3(vec2 uv) {
    float g = gouyu(uv - vec2(0.00, 0.4), radians(140.0));
    g += gouyu(uv - vec2(1.732 * 0.2, - 0.4 * 0.5), radians(260.0));
    g += gouyu(uv - vec2(-1.732 * 0.2, - 0.4 * 0.5), radians(0.0));
    return g;
}

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (a - b) / k, 0.0, 1.0);
    return mix(a, b, h) - k*h * (1.0 - h);
}
float smax(float a, float b, float k) {
    return - smin(-a, - b, k);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    // 原点放屏幕中心, 范围 [-1, 1]
    uv -= 0.5;
    uv *= 2.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    float w = 1.0 / u_resolution.x;
    
    vec3 col = vec3(0.3137, 0.1333, 0.1333);
    
    // 屎黄背景
    float backGround = smoothstep(+w, - w, sdCircle(uv, 0.8));
    col = mix(col, vec3(0.502, 0.4667, 0.1647), backGround);
    
    // 黑色圆环
    float ring = abs(sdCircle(uv, 0.8)) - 0.02;
    float edge = smoothstep(+w, - w, ring);
    col = mix(col, vec3(0.0), edge);
    
    // 渐变阴影
    float d = length(uv);
    float dark = step(d, 0.79) * smoothstep(0.65, 0.79, d);
    // dark * 0.8 减淡阴影
    col = mix(col, vec3(0.0), dark * 0.8);
    
    // 三勾玉
    vec2 guv = uv;
    guv *= rotate(u_time);
    float g = gouyu3(guv);
    col = mix(col, vec3(0.4471, 0.1686, 0.4471), g);
    // col = mix(col, vec3(0.4471, 0.1686, 0.4471), gouyu3(uv));
    
    // 中间黑点
    float c = smoothstep(+w, - w, sdCircle(uv, 0.1));
    col = mix(col, vec3(0.0, 0.0, 0.0), c);
    
    // 高光
    d = length(uv - vec2(-0.4, 0.3));
    col = mix(col, vec3(1.0), smoothstep(0.3, 0.0, d));
    
    gl_FragColor = vec4(col, 1.0);
    
}