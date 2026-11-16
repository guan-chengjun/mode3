uniform float uTime;
uniform float uSpeed;
uniform float uHeight;
uniform float uArea;
uniform vec2 uWind;

attribute float aSeed;
varying float vFade;

void main() {
  vec3 p = position;
  // 竖直下落（每颗粒子速度略有差异），到底部后循环回顶部
  float fall = mod(p.y - uTime * uSpeed * (0.7 + 0.6 * aSeed), uHeight);
  p.y = fall;
  // 水平风偏移 + 区域环绕
  p.x = mod(p.x + uWind.x * uTime + aSeed * 10.0, uArea) - uArea * 0.5;
  p.z = mod(p.z + uWind.y * uTime, uArea) - uArea * 0.5;
  // 顶部淡入、底部淡出
  vFade = smoothstep(0.0, 4.0, fall) * (1.0 - smoothstep(uHeight - 6.0, uHeight, fall));

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (200.0 * (0.5 + 0.5 * aSeed)) / -mv.z;
  gl_Position = projectionMatrix * mv;
}
