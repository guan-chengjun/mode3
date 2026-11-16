import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/**
 * SkySystem —— HDRI 环境贴图系统
 * 联网加载等距柱状 HDR 环境贴图，同时作为 IBL 环境光与天空背景；
 * 加载失败时回退到 RoomEnvironment（中性室内环境）+ 纯色天空，保证 PBR 材质正常反射。
 */
export class SkySystem {
  constructor(stage) {
    this.stage = stage;
    this.loader = new RGBELoader();
    this.cache = new Map();
    this.currentUrl = null;

    // 兜底环境（离线也能得到合理的金属反射）
    const pmrem = new THREE.PMREMGenerator(stage.renderer);
    this.fallbackEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    stage.scene.environment = this.fallbackEnv;
    pmrem.dispose();
  }

  /** 切换环境贴图；onStatus 用于面板提示 */
  setEnvironment(url, fallbackColor, onStatus) {
    this.currentUrl = url;
    const { scene } = this.stage;

    const applyTexture = (tex) => {
      scene.environment = tex;
      scene.background = tex;
    };
    const applyFallback = () => {
      scene.environment = this.fallbackEnv;
      scene.background = new THREE.Color(fallbackColor);
    };

    if (this.cache.has(url)) {
      applyTexture(this.cache.get(url));
      return;
    }

    this.loader.load(
      url,
      (tex) => {
        tex.mapping = THREE.EquirectangularReflectionMapping;
        this.cache.set(url, tex);
        // 若加载期间用户又切换了天气，只应用最新目标
        if (this.currentUrl === url) {
          applyTexture(tex);
          onStatus?.('HDRI 环境贴图加载完成 ✔');
        }
      },
      undefined,
      () => {
        if (this.currentUrl === url) {
          applyFallback();
          onStatus?.('HDRI 加载失败（网络受限），已使用备用环境');
        }
      }
    );
  }
}
