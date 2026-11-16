import * as THREE from 'three';

/**
 * Ground —— 地面场景：草地 / 广场 / 步道 / 水池 / 程序化树木
 */
export class Ground {
  constructor() {
    this.group = new THREE.Group();

    // 草地
    const grass = new THREE.Mesh(
      new THREE.CircleGeometry(160, 64),
      new THREE.MeshStandardMaterial({ color: 0x7d9b6a, roughness: 1, metalness: 0 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;
    this.group.add(grass);

    // 摩天轮广场
    const plaza = new THREE.Mesh(
      new THREE.CylinderGeometry(11, 11, 0.4, 48),
      new THREE.MeshStandardMaterial({ color: 0xb9b3a8, roughness: 0.9 })
    );
    plaza.position.y = 0.2;
    plaza.receiveShadow = true;
    plaza.castShadow = true;
    this.group.add(plaza);

    // 步道
    const path = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.12, 40),
      new THREE.MeshStandardMaterial({ color: 0xa9a396, roughness: 0.95 })
    );
    path.position.set(0, 0.06, 30);
    path.receiveShadow = true;
    this.group.add(path);

    // 水池
    const pond = new THREE.Mesh(
      new THREE.CircleGeometry(6, 40),
      new THREE.MeshStandardMaterial({ color: 0x3f6f8f, roughness: 0.15, metalness: 0.4 })
    );
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(22, 0.03, 16);
    pond.receiveShadow = true;
    this.group.add(pond);

    // 程序化树木
    this._buildTrees();
  }

  _makeTree(x, z, s) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18 * s, 0.26 * s, 1.6 * s, 8),
      new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 1 })
    );
    trunk.position.y = 0.8 * s;
    trunk.castShadow = true;
    tree.add(trunk);

    const leafMat = new THREE.MeshStandardMaterial({ color: 0x3f7a3a, roughness: 0.9 });
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry((1.5 - i * 0.35) * s, 1.6 * s, 10),
        leafMat
      );
      cone.position.y = (1.6 + i * 1.0) * s;
      cone.castShadow = true;
      tree.add(cone);
    }
    tree.position.set(x, 0, z);
    tree.rotation.y = Math.random() * Math.PI * 2;
    return tree;
  }

  _buildTrees() {
    let placed = 0;
    let guard = 0;
    while (placed < 14 && guard++ < 200) {
      const a = Math.random() * Math.PI * 2;
      const r = 26 + Math.random() * 55;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      // 避开步道与水池
      if (Math.abs(x) < 5 && z > 5) continue;
      if (Math.hypot(x - 22, z - 16) < 9) continue;
      this.group.add(this._makeTree(x, z, 0.9 + Math.random() * 0.9));
      placed++;
    }
  }
}
