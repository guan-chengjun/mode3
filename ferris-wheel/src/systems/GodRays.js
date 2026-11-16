import * as THREE from 'three';
import godrayVert from '../shaders/godray.vert?raw';
import godrayFrag from '../shaders/godray.frag?raw';

/**
 * GodRays —— 体积光（假体积锥体 + 加色混合）
 * 一个开口圆锥光柱，轴向始终对准太阳方向，黄昏 / 夜晚淡入。
 */
export class GodRays {
  constructor() {
    const geo = new THREE.ConeGeometry(20, 70, 32, 1, true);

    this.material = new THREE.ShaderMaterial({
      vertexShader: godrayVert,
      fragmentShader: godrayFrag,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color(0xffd9a0) },
        uOpacity: { value: 0 }
      }
    });

    this.object = new THREE.Mesh(geo, this.material);
    this.object.position.set(0, 35, 0);
    this.object.visible = false;
    this._up = new THREE.Vector3(0, 1, 0);
    this._dir = new THREE.Vector3();
  }

  /** 让光柱轴向对准太阳方向，并沿该方向偏移出轮心 */
  alignToSun(sunPos) {
    this._dir.copy(sunPos).normalize();
    this.object.quaternion.setFromUnitVectors(this._up, this._dir);
    this.object.position.set(0, 18, 0).addScaledVector(this._dir, 22);
  }

  setOpacity(v) {
    this.material.uniforms.uOpacity.value = v;
    this.object.visible = v > 0.01;
  }
}
