precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

const int count = 5;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv -= 0.5;
  
  vec4 color = vec4(0.1294, 0.749, 0.9373, 1.0);
  
  float dis = distance(uv, vec2(0.0));
  float per = fract(u_time);
  
  if (dis > 0.5) {
    // 只绘制圆形范围
    discard;
  }else {
    // count = 5 时，perDis = 0.1
    float perDis = 0.5 / float(count);
    float disNum;
    float bl = 0.0;
    
    // for(int i = 0; i <= count; i ++ ) {
      //   // disNum = perDis * float(i) - dis + per / float(count);
      //   disNum = perDis * float(i) - dis ;
      //   if (disNum > 0.0) {
        //     if (disNum < perDis) {
          //       bl = 1.0 - disNum / perDis;
        //     }else if (disNum - perDis < perDis) {
          //       bl = 1.0 - abs(1.0 - disNum / perDis);
        //     }
        //     color.a = pow(bl, 1.0);
      //   }
    // }
    
    disNum = 0.5 - dis ;
    if (disNum > 0.0) {
      
      if (disNum < 0.1) {
        // dis>0.4
        bl = 1.0 - disNum / 0.1;
      }else if (disNum < 0.2) {
        // dis>0.3
        bl = 1.0 - abs(1.0 - disNum / 0.1);
      }
      color.a = pow(bl, 0.5);
      
    }
  }
  
  gl_FragColor = color;
}