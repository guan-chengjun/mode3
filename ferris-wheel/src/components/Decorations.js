import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/** 外部 GLB 模型地址（Khronos 官方示例资产，支持跨域加载） */
const DUCK_URL =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb';

/**
 * Decorations —— 在线 GLB 装饰模型加载
 * 联网加载外部 GLB（鸭子模型，布置在水池边）；
 * 加载失败（断网 / 跨域受限）时自动回退为程序化岩石装饰，保证场景完整。
 */
export class Decorations {
  constructor() {
    this.group = new THREE.Group();
    this.loader = new GLTFLoader();
  }

  /** onStatus: (msg: string) => void 用于面板 toast 提示 */
  loadExternal(onStatus) {
    onStatus?.('正在联网下载 GLB 模型资产…');
    this.loader.load(
      DUCK_URL,
      (gltf) => {
        const proto = gltf.scene;
        // 统一缩放到 1.4m 高并落地
        const box = new THREE.Box3().setFromObject(proto);
        const h = box.max.y - box.min.y || 1;
        const scale = 1.4 / h;
        proto.traverse((o) => {
          if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
        });

        const spots = [
          { x: 19, z: 13, ry: 0.6 },
          { x: 25, z: 18, ry: -1.8 },
          { x: 21, z: 20.5, ry: 2.6 }
        ];
        for (const s of spots) {
          const duck = proto.clone();
          duck.scale.setScalar(scale);
          duck.position.set(s.x, -box.min.y * scale, s.z);
          duck.rotation.y = s.ry;
          this.group.add(duck);
        }
        onStatus?.('GLB 模型加载完成 ✔');
      },
      undefined,
      () => {
        onStatus?.('GLB 下载失败（网络受限），已使用内置装饰替代');
        this._buildFallback();
      }
    );
  }

  /** 离线回退：程序化岩石 */
  _buildFallback() {
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x8a8d90, roughness: 0.95 });
    const spots = [
      { x: 19, z: 13, s: 0.8 },
      { x: 25, z: 18, s: 1.1 },
      { x: 21, z: 20.5, s: 0.6 }
    ];
    for (const p of spots) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(p.s, 0), rockMat);
      rock.position.set(p.x, p.s * 0.5, p.z);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.group.add(rock);
    }
  }
}
