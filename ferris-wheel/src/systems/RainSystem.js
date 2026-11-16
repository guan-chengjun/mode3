import * as THREE from 'three';
import rainVert from '../shaders/rain.vert?raw';
import rainFrag from '../shaders/rain.frag?raw';

/**
 * RainSystem ——  GPU 雨粒子（自定义着色器 Points）
 * 4000 个雨丝粒子在 120×60×120 区域内循环下落，带风偏移。
 */
export class RainSystem {
  constructor(count = 4000) {
    const area = 120;
    const height = 60;

    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * area;
      positions[i * 3 + 1] = Math.random() * height;
      positions[i * 3 + 2] = (Math.random() - 0.5) * area;
      seeds[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader: rainVert,
      fragmentShader: rainFrag,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 28 },
        uHeight: { value: height },
        uArea: { value: area },
        uWind: { value: new THREE.Vector2(3.0, 0.8) },
        uOpacity: { value: 0 }
      }
    });

    this.object = new THREE.Points(geo, this.material);
    this.object.frustumCulled = false;
    this.object.visible = false;
  }

  setOpacity(v) {
    this.material.uniforms.uOpacity.value = v * 0.75;
    this.object.visible = v > 0.02; // 无雨时关闭绘制
  }

  update(dt, t) {
    if (this.object.visible) {
      this.material.uniforms.uTime.value = t;
    }
  }
}
