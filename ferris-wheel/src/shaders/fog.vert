uniform float uTime;
uniform float uOpacity;

attribute float aScale;
attribute float aSeed;
varying float vAlpha;

void main() {
  vec3 p = position;
  // 缓慢漂移
  p.x += sin(uTime * 0.05 + aSeed * 6.2831) * 8.0;
  p.z += cos(uTime * 0.04 + aSeed * 6.2831) * 8.0;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aScale * (220.0 / -mv.z);
  vAlpha = uOpacity;
  gl_Position = projectionMatrix * mv;
}
