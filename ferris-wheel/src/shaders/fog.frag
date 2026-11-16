uniform sampler2D uMap;
varying float vAlpha;

void main() {
  float a = texture2D(uMap, gl_PointCoord).a * vAlpha;
  if (a < 0.005) discard;
  gl_FragColor = vec4(0.85, 0.88, 0.9, a);
}
