import { WEATHERS } from '../systems/weatherPresets.js';

const MAX_SPEED = 0.8; // 滑块满量程对应的角速度 rad/s

/**
 * ControlPanel —— 控制面板逻辑
 * 启停开关 / 转速滑块 / 天气切换按钮组 / 自动环绕相机 / toast 提示
 */
export class ControlPanel {
  constructor({ wheel, weather, stage }) {
    this.wheel = wheel;
    this.weather = weather;
    this.stage = stage;
    this.toastEl = document.getElementById('toast');
    this._toastTimer = null;

    // 天气系统的异步资源提示走面板 toast
    this.weather.onStatus = (msg) => this.toast(msg);

    this._bindPower();
    this._bindSpeed();
    this._bindAutoRotate();
    this._buildWeatherButtons();
  }

  _bindPower() {
    this.btnPower = document.getElementById('btn-power');
    this.btnPower.addEventListener('click', () => {
      this.wheel.running = !this.wheel.running;
      this._syncPower();
    });
    this._syncPower();
  }

  _syncPower() {
    this.btnPower.textContent = this.wheel.running ? '⏸ 暂停' : '▶ 启动';
    this.btnPower.classList.toggle('stopped', !this.wheel.running);
  }

  _bindSpeed() {
    const slider = document.getElementById('speed-slider');
    const label = document.getElementById('speed-val');
    slider.value = Math.round((this.wheel.speed / MAX_SPEED) * 100);
    label.textContent = this.wheel.speed.toFixed(2);
    slider.addEventListener('input', () => {
      const v = (slider.value / 100) * MAX_SPEED;
      this.wheel.setSpeed(v);
      label.textContent = v.toFixed(2);
    });
  }

  _bindAutoRotate() {
    document.getElementById('chk-autorotate').addEventListener('change', (e) => {
      this.stage.controls.autoRotate = e.target.checked;
    });
  }

  _buildWeatherButtons() {
    const wrap = document.getElementById('weather-btns');
    this.weatherBtns = {};
    for (const [key, p] of Object.entries(WEATHERS)) {
      const btn = document.createElement('button');
      btn.className = 'weather-btn';
      btn.innerHTML = `<span class="icon">${p.icon}</span>${p.label}`;
      btn.addEventListener('click', () => {
        this.weather.setWeather(key);
        this._markWeather(key);
        this.toast(`天气切换：${p.icon} ${p.label}`);
      });
      wrap.appendChild(btn);
      this.weatherBtns[key] = btn;
    }
    this._markWeather(this.weather.name);
  }

  _markWeather(name) {
    for (const [key, btn] of Object.entries(this.weatherBtns)) {
      btn.classList.toggle('active', key === name);
    }
  }

  toast(msg, duration = 3000) {
    this.toastEl.textContent = msg;
    this.toastEl.classList.remove('hidden');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.toastEl.classList.add('hidden'), duration);
  }
}
