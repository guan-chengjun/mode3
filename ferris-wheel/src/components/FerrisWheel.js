import * as THREE from 'three';

const CABIN_COUNT = 12;
const CABIN_COLORS = [0xd8443c, 0xe8912d, 0xe8c52d, 0x4caf50, 0x2d9be8, 0x7b5cd6];

/**
 * FerrisWheel —— 摩天轮主体
 * 支架（A 字塔架 + 横梁）/ 轮辐（InstancedMesh）/ 双轮缘 / 座舱（钟摆物理摆动）
 * 轮体绕 Z 轴匀速旋转，座舱反向抵消旋转保持竖直，并叠加弹簧-阻尼摆动。
 */
export class FerrisWheel {
  constructor() {
    this.group = new THREE.Group();
    this.radius = 14;        // 轮体半径
    this.hubHeight = 18;     // 轮毂高度
    this.speed = 0.25;       // 目标角速度 rad/s（滑块设定值）
    this.currentSpeed = 0;   // 当前角速度（平滑逼近）
    this.prevSpeed = 0;
    this.angularAccel = 0;
    this.running = true;

    // ---------- PBR 材质 ----------
    this.steelMat = new THREE.MeshStandardMaterial({ color: 0xe8edf2, metalness: 0.85, roughness: 0.35 });
    this.accentMat = new THREE.MeshStandardMaterial({ color: 0xd8443c, metalness: 0.6, roughness: 0.4 });
    this.darkMat = new THREE.MeshStandardMaterial({ color: 0x3a4149, metalness: 0.7, roughness: 0.5 });
    this.glassMat = new THREE.MeshStandardMaterial({
      color: 0xbfe3f2, metalness: 0.1, roughness: 0.05,
      transparent: true, opacity: 0.4
    });
    // 座舱氛围灯 & 轮缘灯串（夜间发光，强度由天气系统驱动）
    this.cabinLightMat = new THREE.MeshStandardMaterial({
      color: 0xfff1cf, emissive: 0xffc98a, emissiveIntensity: 0
    });
    this.ringLightMat = new THREE.MeshStandardMaterial({
      color: 0xfff6e0, emissive: 0xffd9a0, emissiveIntensity: 0
    });

    this._buildSupports();
    this._buildWheel();
    this._buildCabins();

    // 轮毂暖光点光源（夜间开启）
    this.hubLight = new THREE.PointLight(0xffc98a, 0, 60, 2);
    this.hubLight.position.set(0, this.hubHeight, 0);
    this.group.add(this.hubLight);
  }

  /** A 字塔架 + 底座 + 主轴 */
  _buildSupports() {
    const H = this.hubHeight;
    const legGeo = new THREE.CylinderGeometry(0.28, 0.4, H + 2.5, 12);

    for (const z of [-3.2, 3.2]) {
      for (const side of [-1, 1]) {
        const leg = new THREE.Mesh(legGeo, this.steelMat);
        leg.position.set(side * 3.6, (H + 2.5) / 2 - 0.5, z);
        leg.rotation.z = -side * Math.atan2(3.6, H + 1.5);
        leg.castShadow = true;
        this.group.add(leg);
      }
      // 横向稳定杆
      const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 7.4, 8), this.darkMat);
      brace.position.set(0, H * 0.45, z);
      brace.rotation.z = Math.PI / 2;
      brace.castShadow = true;
      this.group.add(brace);
    }

    // 主轴（贯穿两侧塔架）
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 8.4, 16), this.darkMat);
    axle.rotation.x = Math.PI / 2;
    axle.position.set(0, H, 0);
    axle.castShadow = true;
    this.group.add(axle);

    // 底座
    for (const z of [-3.2, 3.2]) {
      const base = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.6, 2.2), this.darkMat);
      base.position.set(0, 0.3, z);
      base.castShadow = true;
      base.receiveShadow = true;
      this.group.add(base);
    }
  }

  /** 轮体：双轮缘 + 内环 + 轮毂 + 轮辐（实例化）+ 灯串（实例化） */
  _buildWheel() {
    this.wheel = new THREE.Group();
    this.wheel.position.y = this.hubHeight;
    this.group.add(this.wheel);

    const R = this.radius;

    // 双轮缘
    for (const z of [-1.4, 1.4]) {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.16, 12, 96), this.accentMat);
      rim.position.z = z;
      rim.castShadow = true;
      this.wheel.add(rim);
    }
    // 内环
    const inner = new THREE.Mesh(new THREE.TorusGeometry(3, 0.12, 10, 48), this.steelMat);
    inner.castShadow = true;
    this.wheel.add(inner);
    // 轮毂
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 4.2, 20), this.accentMat);
    hub.rotation.x = Math.PI / 2;
    hub.castShadow = true;
    this.wheel.add(hub);

    // 轮辐：24 根，InstancedMesh 一次绘制
    const spokeGeo = new THREE.CylinderGeometry(0.06, 0.06, R, 8);
    const spokes = new THREE.InstancedMesh(spokeGeo, this.steelMat, CABIN_COUNT * 2);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const s = new THREE.Vector3(1, 1, 1);
    let idx = 0;
    for (const z of [-1.4, 1.4]) {
      for (let i = 0; i < CABIN_COUNT; i++) {
        const a = (i / CABIN_COUNT) * Math.PI * 2;
        e.set(0, 0, a - Math.PI / 2);
        q.setFromEuler(e);
        m.compose(new THREE.Vector3(Math.cos(a) * R / 2, Math.sin(a) * R / 2, z), q, s);
        spokes.setMatrixAt(idx++, m);
      }
    }
    spokes.castShadow = true;
    this.wheel.add(spokes);

    // 轮缘灯串：72 颗小灯，实例化
    const bulbGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const bulbs = new THREE.InstancedMesh(bulbGeo, this.ringLightMat, 72);
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      m.compose(
        new THREE.Vector3(Math.cos(a) * (R + 0.28), Math.sin(a) * (R + 0.28), i % 2 ? 1.4 : -1.4),
        new THREE.Quaternion(),
        s
      );
      bulbs.setMatrixAt(i, m);
    }
    this.wheel.add(bulbs);
  }

  /** 座舱：吊杆 + 舱体 + 玻璃 + 氛围灯，挂接在轮缘锚点上 */
  _buildCabins() {
    this.cabins = [];
    const R = this.radius;

    const hangerGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8);
    const bodyGeo = new THREE.BoxGeometry(1.7, 1.5, 1.5);
    const roofGeo = new THREE.BoxGeometry(1.95, 0.16, 1.75);
    const windowGeo = new THREE.BoxGeometry(1.76, 0.55, 1.56);
    const stripGeo = new THREE.BoxGeometry(1.8, 0.09, 1.6);

    for (let i = 0; i < CABIN_COUNT; i++) {
      const a = (i / CABIN_COUNT) * Math.PI * 2;
      const pivot = new THREE.Group();
      pivot.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
      this.wheel.add(pivot);

      const hanger = new THREE.Mesh(hangerGeo, this.darkMat);
      hanger.position.y = -0.55;
      hanger.castShadow = true;
      pivot.add(hanger);

      const bodyMat = new THREE.MeshStandardMaterial({
        color: CABIN_COLORS[i % CABIN_COLORS.length],
        metalness: 0.3, roughness: 0.5
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = -1.9;
      body.castShadow = true;
      pivot.add(body);

      const roof = new THREE.Mesh(roofGeo, this.accentMat);
      roof.position.y = -1.1;
      roof.castShadow = true;
      pivot.add(roof);

      const win = new THREE.Mesh(windowGeo, this.glassMat);
      win.position.y = -1.75;
      pivot.add(win);

      const strip = new THREE.Mesh(stripGeo, this.cabinLightMat);
      strip.position.y = -2.62;
      pivot.add(strip);

      this.cabins.push({
        pivot,
        swing: 0,                 // 摆动角
        swingVel: 0,              // 摆动角速度
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  setSpeed(v) {
    this.speed = v;
  }

  /**
   * 每帧更新：匀速旋转（带平滑加减速）+ 座舱钟摆摆动
   */
  update(dt, t) {
    const target = this.running ? this.speed : 0;
    this.currentSpeed += (target - this.currentSpeed) * Math.min(1, dt * 1.2);
    this.angularAccel = dt > 0 ? (this.currentSpeed - this.prevSpeed) / dt : 0;
    this.prevSpeed = this.currentSpeed;

    this.wheel.rotation.z += this.currentSpeed * dt;

    const counter = -this.wheel.rotation.z;
    for (const c of this.cabins) {
      // 弹簧-阻尼单摆：回复力 + 轮体角加速度耦合 + 微风扰动
      const wind = Math.sin(t * 0.9 + c.phase) * 0.06;
      const acc = -14 * Math.sin(c.swing) - 2.4 * c.swingVel - this.angularAccel * 0.9 + wind;
      c.swingVel += acc * dt;
      c.swing += c.swingVel * dt;
      c.pivot.rotation.z = counter + c.swing;
    }
  }
}
