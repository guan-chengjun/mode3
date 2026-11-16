uniform vec3 uColor;
uniform float uOpacity;

varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vViewDirW;

void main() {
  // 沿光柱纵向衰减（顶端最亮）
  float grad = pow(vUv.y, 1.8);
  // 轮廓边缘柔化，模拟体积散射
  float facing = abs(dot(normalize(vNormalW), normalize(vViewDirW)));
  float edge = smoothstep(0.0, 0.45, facing);
  gl_FragColor = vec4(uColor, uOpacity * grad * edge);
}
