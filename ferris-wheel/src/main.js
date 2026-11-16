import * as THREE from 'three';
import { Stage } from './core/Stage.js';
import { FerrisWheel } from './components/FerrisWheel.js';
import { Ground } from './components/Ground.js';
import { Decorations } from './components/Decorations.js';
import { SkySystem } from './systems/SkySystem.js';
import { WeatherSystem } from './systems/WeatherSystem.js';
import { RainSystem } from './systems/RainSystem.js';
import { FogParticles } from './systems/FogParticles.js';
import { GodRays } from './systems/GodRays.js';
import { ControlPanel } from './ui/ControlPanel.js';

// ---------- 舞台 ----------
const stage = new Stage(document.getElementById('app'));

// ---------- 场景组件 ----------
const wheel = new FerrisWheel();
stage.scene.add(wheel.group);

const ground = new Ground();
stage.scene.add(ground.group);

const decorations = new Decorations();
stage.scene.add(decorations.group);

// ---------- 天气与光影系统 ----------
const sky = new SkySystem(stage);
const rain = new RainSystem();
stage.scene.add(rain.object);
const fogParticles = new FogParticles();
stage.scene.add(fogParticles.object);
const godRays = new GodRays();
stage.scene.add(godRays.object);

const weather = new WeatherSystem(stage, sky, { rain, fogParticles, godRays, wheel });
weather.setWeather('sunny', true); // 初始天气：晴天（立即到位）

// ---------- 控制面板 ----------
const panel = new ControlPanel({ wheel, weather, stage });

// ---------- 联网加载外部 GLB 模型（失败自动回退） ----------
decorations.loadExternal((msg) => panel.toast(msg));

// ---------- 主循环 ----------
const clock = new THREE.Clock();
let firstFrame = true;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05); // 切后台回来不跳变
  const t = clock.elapsedTime;

  wheel.update(dt, t);        // 轮体旋转 + 座舱摆动
  weather.update(dt);         // 天气参数平滑过渡
  rain.update(dt, t);         // 雨粒子
  fogParticles.update(dt, t); // 雾粒子

  stage.render();

  if (firstFrame) {
    firstFrame = false;
    document.getElementById('loading').classList.add('done');
  }
}
animate();
