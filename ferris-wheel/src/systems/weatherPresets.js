/**
 * 天气预设表 —— 每种天气一套完整光影参数
 * hdri:   PolyHaven 环境贴图（1k，联网加载，失败自动回退）
 * sun:    太阳位置 / 颜色（色温）/ 强度
 * hemi:   半球环境光强度
 * fog:    指数雾颜色与浓度
 * exposure: 色调映射曝光
 * rain / fogParticles / godRays: 粒子与体积光强度 0~1
 * cabinLight / ringLight: 座舱氛围灯、轮缘灯串发光强度
 */
export const WEATHERS = {
  sunny: {
    label: '晴天', icon: '☀️',
    hdri: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloppenheim_06_puresky_1k.hdr',
    bg: 0x9fc7ec,
    sun: { pos: [60, 80, 30], color: 0xfff2dd, intensity: 3.0 },
    hemi: 0.6,
    fog: { color: 0xbfd8ee, density: 0.0015 },
    exposure: 1.0,
    rain: 0, fogParticles: 0, godRays: 0,
    cabinLight: 0, ringLight: 0
  },
  dusk: {
    label: '黄昏', icon: '🌇',
    hdri: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr',
    bg: 0x8a5a6a,
    sun: { pos: [-70, 14, -20], color: 0xff9a4d, intensity: 2.2 },
    hemi: 0.35,
    fog: { color: 0x7a5a68, density: 0.004 },
    exposure: 0.95,
    rain: 0, fogParticles: 0.1, godRays: 0.55,
    cabinLight: 0.6, ringLight: 0.7
  },
  night: {
    label: '夜晚', icon: '🌙',
    hdri: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr',
    bg: 0x0a1220,
    sun: { pos: [-30, 60, -40], color: 0x8fb2e8, intensity: 0.5 },
    hemi: 0.12,
    fog: { color: 0x0a1220, density: 0.006 },
    exposure: 0.8,
    rain: 0, fogParticles: 0.15, godRays: 0.2,
    cabinLight: 1.0, ringLight: 1.0
  },
  cloudy: {
    label: '阴天', icon: '☁️',
    hdri: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloppenheim_02_1k.hdr',
    bg: 0x9aa5ad,
    sun: { pos: [40, 60, 20], color: 0xcfd6dd, intensity: 1.2 },
    hemi: 0.5,
    fog: { color: 0x9aa5ad, density: 0.006 },
    exposure: 0.9,
    rain: 0, fogParticles: 0.2, godRays: 0,
    cabinLight: 0.2, ringLight: 0.2
  },
  rainy: {
    label: '雨天', icon: '🌧️',
    hdri: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloppenheim_02_1k.hdr',
    bg: 0x6e7a84,
    sun: { pos: [30, 55, 15], color: 0xb8c4cf, intensity: 0.8 },
    hemi: 0.4,
    fog: { color: 0x6e7a84, density: 0.012 },
    exposure: 0.85,
    rain: 1, fogParticles: 0.3, godRays: 0,
    cabinLight: 0.5, ringLight: 0.5
  },
  foggy: {
    label: '雾天', icon: '🌫️',
    hdri: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloppenheim_02_1k.hdr',
    bg: 0xaab3b8,
    sun: { pos: [35, 50, 20], color: 0xd8dde0, intensity: 0.6 },
    hemi: 0.45,
    fog: { color: 0xaab3b8, density: 0.03 },
    exposure: 0.85,
    rain: 0, fogParticles: 0.8, godRays: 0,
    cabinLight: 0.7, ringLight: 0.8
  }
};
