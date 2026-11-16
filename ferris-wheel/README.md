# 🎡 3D 摩天轮 · 天气光影交互系统

基于 **Three.js + Vite** 的多文件工程化 3D 交互项目：写实摩天轮（支架 / 轮辐 / 座舱）、
六种天气一键切换，HDRI 环境贴图、太阳角度、色温、雾效、体积光、雨雾粒子实时联动，
PBR 材质 + PCF 软阴影，支持联网加载外部 GLB 模型资产。

## 快速开始

```bash
npm install     # 安装依赖
npm run dev     # 启动开发服务器（默认 http://localhost:5173，自动打开浏览器）
npm run build   # 生产构建，输出到 dist/
npm run preview # 预览生产构建
```

> 首次进入场景会联网下载 HDRI 环境贴图（PolyHaven CDN）与 GLB 装饰模型
> （Khronos 示例资产）。**断网也能正常运行**：自动回退到内置环境光与程序化装饰，
> 面板会以 toast 提示回退状态。

## 操作说明

| 操作 | 效果 |
| --- | --- |
| 左键拖拽 | 环绕旋转视角 |
| 右键拖拽 | 平移视角 |
| 滚轮 | 缩放（可拉近钻入轮体内部，自由透视内部结构） |
| 启动 / 暂停按钮 | 启停摩天轮（带平滑加减速） |
| 转速滑块 | 0 ~ 0.8 rad/s 无级调速 |
| 自动环绕 | 相机自动绕场景旋转 |
| 天气按钮 | 晴天 / 黄昏 / 夜晚 / 阴天 / 雨天 / 雾天 一键切换 |

## 目录结构

```
ferris-wheel/
├── index.html                  # 页面骨架：画布挂载点 + 控制面板 DOM
├── package.json                # 依赖与启动命令
├── vite.config.js              # Vite 配置
├── src/
│   ├── main.js                 # 入口：组装场景与主循环
│   ├── core/
│   │   └── Stage.js            # 渲染器 / 相机 / OrbitControls / 太阳主光 / 软阴影
│   ├── components/
│   │   ├── FerrisWheel.js      # 摩天轮：塔架、轮辐(InstancedMesh)、座舱(钟摆物理)
│   │   ├── Ground.js           # 草地 / 广场 / 步道 / 水池 / 程序化树木
│   │   └── Decorations.js      # 在线 GLB 模型加载（含离线回退）
│   ├── systems/
│   │   ├── weatherPresets.js   # 六种天气的完整光影参数表
│   │   ├── WeatherSystem.js    # 天气调度：所有参数帧率无关平滑过渡
│   │   ├── SkySystem.js        # HDRI 环境贴图加载 / 缓存 / 回退
│   │   ├── RainSystem.js       # GPU 雨粒子（4000 雨丝，着色器驱动）
│   │   ├── FogParticles.js     # 贴地漂移雾团粒子
│   │   └── GodRays.js          # 体积光锥（跟随太阳方向）
│   ├── shaders/
│   │   ├── rain.vert / rain.frag   # 雨丝：下落循环 + 风偏移 + 竖直拉伸
│   │   ├── fog.vert / fog.frag     # 雾团：缓慢漂移 + 软边贴图
│   │   └── godray.vert / godray.frag # 体积光：纵向衰减 + 轮廓柔化
│   └── ui/
│       ├── ControlPanel.js     # 面板交互逻辑
│       └── panel.css           # 玻璃拟态面板样式（含移动端适配）
└── assets/                     # 预留：本地模型 / 贴图（当前资产均在线加载）
```

## 天气系统联动项

切换天气时，以下参数以指数阻尼平滑过渡（约 1~2 秒到位），不会生硬跳变：

| 联动项 | 实现 |
| --- | --- |
| HDRI 环境贴图 | `RGBELoader` 加载 PolyHaven HDR，同时作为 IBL 与天空背景，带缓存 |
| 太阳角度 / 色温 / 强度 | `DirectionalLight` 位置、颜色、强度插值 |
| 阴影 | PCFSoftShadowMap 软阴影，2048 阴影贴图，随太阳角度实时变化 |
| 雾效 | `FogExp2` 颜色与浓度插值 |
| 体积光 | 加色混合锥体，轴向实时对准太阳方向 |
| 雨粒子 | 自定义 GLSL 着色器 Points，透明度随天气淡入淡出 |
| 雾粒子 | 大尺寸软边雾团低空漂移 |
| 曝光 | ACES 色调映射曝光度 |
| 夜景灯光 | 座舱氛围灯、轮缘灯串（emissive）、轮毂点光源 |

## 技术要点

- **PBR 材质**：全场景 `MeshStandardMaterial`，金属度 / 粗糙度区分钢材、玻璃、漆面
- **性能**：轮辐与灯串使用 `InstancedMesh` 合并绘制；粒子全部 GPU 侧计算（顶点着色器驱动），CPU 零开销；无雨无雾时对应系统关闭绘制
- **座舱摆动**：弹簧-阻尼单摆模型，与轮体角加速度耦合——启停、变速时座舱会自然晃动后回稳
- **平滑过渡**：所有天气参数使用 `1 - exp(-k·dt)` 帧率无关阻尼插值
- **健壮性**：HDRI / GLB 加载失败均有回退路径，离线可运行

## 自定义

- **新增天气**：在 `src/systems/weatherPresets.js` 中复制一个预设改参数即可，面板按钮自动生成
- **更换 HDRI**：替换预设中的 `hdri` 字段（PolyHaven 任意 HDR 的 1k 直链均可）
- **更换 GLB 模型**：修改 `src/components/Decorations.js` 顶部的 `DUCK_URL`
- **座舱数量 / 轮体尺寸**：修改 `src/components/FerrisWheel.js` 顶部的 `CABIN_COUNT` 与构造器中的 `radius` / `hubHeight`
