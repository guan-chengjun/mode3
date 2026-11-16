# 本地资产目录（预留）
#
# 当前项目的模型与贴图均在线加载：
#   - HDRI 环境贴图：PolyHaven CDN（见 src/systems/weatherPresets.js）
#   - GLB 装饰模型：Khronos glTF-Sample-Assets（见 src/components/Decorations.js）
#
# 如需离线部署，可将 .hdr / .glb 文件下载到本目录，
# 并把对应 URL 改为相对路径（如 ./assets/kloppenheim_06_puresky_1k.hdr），
# Vite 会自动处理该目录下的静态资源引用。
