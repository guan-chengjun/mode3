import * as THREE from 'three';
import { WEATHERS } from './weatherPresets.js';

/**
 * WeatherSystem —— 天气调度核心
 * 切换天气时设置目标参数，每帧对以下量做指数平滑过渡：
 * 太阳角度 / 色温 / 强度、半球光、雾颜色与浓度、曝光、
 * 雨粒子、雾粒子、体积光、座舱灯、轮缘灯串、轮毂点光源。
 */
export class WeatherSystem {
  /**
   * @param {Stage} stage
   * @param {SkySystem} sky
   * @param {{rain, fogParticles, godRays, wheel}} fx
   */
  constructor(stage, sky, fx) {
    this.stage = stage;
    this.sky = sky;
    this.fx = fx;
    this.onStatus = null;

    this.name = 'sunny';
    this.target = WEATHERS.sunny;

    // 可插值的连续状态
    this.state = {
      sunPos: new THREE.Vector3(...WEATHERS.sunny.sun.pos),
      sunColor: new THREE.Color(WEATHERS.sunny.sun.color),
      sunIntensity: WEATHERS.sunny.sun.intensity,
      hemi: WEATHERS.sunny.hemi,
      fogColor: new THREE.Color(WEATHERS.sunny.fog.color),
      fogDensity: WEATHERS.sunny.fog.density,
      exposure: WEATHERS.sunny.exposure,
      rain: 0, fogParticles: 0, godRays: 0,
      cabinLight: 0, ringLight: 0
    };
    this._targetVec = new THREE.Vector3();
    this._targetColor = new THREE.Color();
  }

  /** 切换天气；instant = true 时立即到位（初始化用） */
  setWeather(name, instant = false) {
    const preset = WEATHERS[name];
    if (!preset) return;
    this.name = name;
    this.target = preset;
    this.sky.setEnvironment(preset.hdri, preset.bg, (m) => this.onStatus?.(m));

    if (instant) {
      const s = this.state;
      s.sunPos.set(...preset.sun.pos);
      s.sunColor.set(preset.sun.color);
      s.sunIntensity = preset.sun.intensity;
      s.hemi = preset.hemi;
      s.fogColor.set(preset.fog.color);
      s.fogDensity = preset.fog.density;
      s.exposure = preset.exposure;
      s.rain = preset.rain;
      s.fogParticles = preset.fogParticles;
      s.godRays = preset.godRays;
      s.cabinLight = preset.cabinLight;
      s.ringLight = preset.ringLight;
      this._apply();
    }
  }

  /** 每帧平滑逼近目标参数 */
  update(dt) {
    const k = 1 - Math.exp(-1.8 * dt); // 帧率无关的指数阻尼
    const s = this.state;
    const p = this.target;

    s.sunPos.lerp(this._targetVec.set(...p.sun.pos), k);
    s.sunColor.lerp(this._targetColor.set(p.sun.color), k);
    s.sunIntensity += (p.sun.intensity - s.sunIntensity) * k;
    s.hemi += (p.hemi - s.hemi) * k;
    s.fogColor.lerp(this._targetColor.set(p.fog.color), k);
    s.fogDensity += (p.fog.density - s.fogDensity) * k;
    s.exposure += (p.exposure - s.exposure) * k;
    s.rain += (p.rain - s.rain) * k;
    s.fogParticles += (p.fogParticles - s.fogParticles) * k;
    s.godRays += (p.godRays - s.godRays) * k;
    s.cabinLight += (p.cabinLight - s.cabinLight) * k;
    s.ringLight += (p.ringLight - s.ringLight) * k;

    this._apply();
  }

  /** 把当前状态写入场景与各特效系统 */
  _apply() {
    const s = this.state;
    const { stage, fx } = this;

    stage.sun.position.copy(s.sunPos);
    stage.sun.color.copy(s.sunColor);
    stage.sun.intensity = s.sunIntensity;
    stage.hemi.intensity = s.hemi;
    stage.scene.fog.color.copy(s.fogColor);
    stage.scene.fog.density = s.fogDensity;
    stage.renderer.toneMappingExposure = s.exposure;

    // 雨粒子
    fx.rain.setOpacity(s.rain);
    // 雾粒子
    fx.fogParticles.setOpacity(s.fogParticles * 0.5);
    // 体积光（跟随太阳方向）
    fx.godRays.setOpacity(s.godRays * 0.35);
    fx.godRays.alignToSun(s.sunPos);

    // 摩天轮灯光
    fx.wheel.cabinLightMat.emissiveIntensity = s.cabinLight * 2.2;
    fx.wheel.ringLightMat.emissiveIntensity = s.ringLight * 3.0;
    fx.wheel.hubLight.intensity = s.cabinLight * 150;
  }
}
