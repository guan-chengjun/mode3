uniform float uOpacity;
varying float vFade;

void main() {
  // 把点精灵拉成竖直雨丝：横向压缩后求距离
  vec2 uv = gl_PointCoord - 0.5;
  uv.x *= 3.5;
  float d = length(uv);
  float alpha = smoothstep(0.5, 0.05, d) * uOpacity * vFade;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(0.75, 0.82, 0.9, alpha);
}
