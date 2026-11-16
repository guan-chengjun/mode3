import * as THREE from 'three';
import fogVert from '../shaders/fog.vert?raw';
import fogFrag from '../shaders/fog.frag?raw';

/** 程序化生成柔和圆形雾团贴图（避免外部资源依赖） */
function makeFogTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,0.85)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * FogParticles —— 贴地漂移雾团（自定义着色器 Points）
 * 60 个大尺寸软边雾团在场景低空缓慢漂移，雾天 / 雨天增强。
 */
export class FogParticles {
  constructor(count = 60) {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 12 + Math.random() * 55;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = 0.5 + Math.random() * 5;
      positions[i * 3 + 2] = Math.sin(a) * r;
      scales[i] = 18 + Math.random() * 26;
      seeds[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader: fogVert,
      fragmentShader: fogFrag,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uMap: { value: makeFogTexture() }
      }
    });

    this.object = new THREE.Points(geo, this.material);
    this.object.frustumCulled = false;
    this.object.visible = false;
  }

  setOpacity(v) {
    this.material.uniforms.uOpacity.value = v;
    this.object.visible = v > 0.02;
  }

  update(dt, t) {
    if (this.object.visible) {
      this.material.uniforms.uTime.value = t;
    }
  }
}
