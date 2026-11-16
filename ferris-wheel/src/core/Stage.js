import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Stage —— 渲染舞台
 * 负责：渲染器 / 场景 / 透视相机 / 轨道控制器 / 太阳主光 / 半球环境光 / 自适应窗口
 */
export class Stage {
  constructor(container) {
    // ---------- 渲染器 ----------
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 软阴影
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    // ---------- 场景 ----------
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x9fc7ec);
    this.scene.fog = new THREE.FogExp2(0xbfd8ee, 0.0015);

    // ---------- 透视相机 ----------
    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      800
    );
    this.camera.position.set(36, 22, 44);

    // ---------- 轨道控制器：旋转 / 缩放 / 平移 ----------
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.target.set(0, 14, 0);
    this.controls.minDistance = 1.2;   // 允许钻入轮体内部观察结构
    this.controls.maxDistance = 220;
    this.controls.maxPolarAngle = Math.PI * 0.495; // 不钻到地面以下
    this.controls.autoRotateSpeed = 0.8;

    // ---------- 太阳主光（平行光，投影） ----------
    this.sun = new THREE.DirectionalLight(0xfff2dd, 3.0);
    this.sun.position.set(60, 80, 30);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 320;
    this.sun.shadow.camera.left = -50;
    this.sun.shadow.camera.right = 50;
    this.sun.shadow.camera.top = 50;
    this.sun.shadow.camera.bottom = -50;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.02;
    this.scene.add(this.sun);
    this.sun.target.position.set(0, 12, 0);
    this.scene.add(this.sun.target);

    // ---------- 半球环境光 ----------
    this.hemi = new THREE.HemisphereLight(0xcfe5ff, 0x6b7a5f, 0.6);
    this.scene.add(this.hemi);

    // ---------- 自适应窗口 ----------
    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
