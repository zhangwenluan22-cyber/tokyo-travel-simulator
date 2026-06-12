# 日本旅游模拟器

一个移动端优先的网页文字选择游戏。  
玩家会沿着一次东京自由行的主线前进，在不同场景里做选择、学习旅行日语，并根据状态数值、探索进度和随机事件得到不同风格的结算。

项目技术栈：

- `Vite`
- `React`
- `TypeScript`
- 纯 CSS

## 当前功能

- 开始页与角色选择页
- 男女角色插画切换
- 主线旅行流程
- 东京游览篇自由探索 hub
- 午餐篇自由探索 hub
- 普通题目反馈区
- 随机场景：浅草寺抽签
- 结算页称号、短评、标签与旅行总结
- 场景切换图片占位、淡入与预加载

## 本地启动

```bash
npm install
npm run dev
```

默认开发地址通常是：

- `http://127.0.0.1:5173/`
- `http://localhost:5173/`

## 构建

```bash
npm run build
```

构建产物输出到 `dist/`。

## 项目结构

```text
src/
  App.tsx
  main.tsx
  styles.css
  components/
    SceneImage.tsx
  data/
    gameData.ts
  types/
    game.ts

public/
  images/
    scenes/
    ui/
    optimized/
      scenes/
      ui/
    originals/
      scenes/
      ui/
```

## 图片目录说明

项目当前同时保留三套图片目录：

- `public/images/scenes/`
  场景原始 PNG 运行目录，作为前端 fallback 使用
- `public/images/ui/`
  角色选择原始 PNG 运行目录，作为前端 fallback 使用
- `public/images/optimized/scenes/`
  网页优先读取的场景 WebP
- `public/images/optimized/ui/`
  网页优先读取的 UI WebP
- `public/images/originals/scenes/`
  原始场景图备份，不参与前端优先读取
- `public/images/originals/ui/`
  原始 UI 图备份，不参与前端优先读取

当前前端图片读取策略：

- 场景图优先读取 `/images/optimized/scenes/*.webp`
- UI 图优先读取 `/images/optimized/ui/*.webp`
- 如果 WebP 缺失或加载失败，会自动 fallback 到：
  - `/images/scenes/*.png`
  - `/images/ui/*.png`

## 图片命名规则

### 场景图

场景图命名规则为：

- `场景名_女.png`
- `场景名_男.png`

例如：

- `出发前_女.png`
- `出发前_男.png`
- `东京游览篇_女.png`
- `东京游览篇_男.png`

对应的网页优化图会生成到：

- `public/images/optimized/scenes/场景名_女.webp`
- `public/images/optimized/scenes/场景名_男.webp`

### UI 角色图

角色选择图当前主要使用：

- `女生.png`
- `男生.png`

对应的网页优化图位于：

- `public/images/optimized/ui/女生.webp`
- `public/images/optimized/ui/男生.webp`

## 场景结构说明

主线大致流程：

- 出发前
- 到达机场
- 机场买票
- 酒店 check-in
- 浅草寺抽签
- 东京游览篇
- 午餐篇
- 咖啡厅篇
- 便利店篇
- 结算

其中有两个自由探索 hub：

- `东京游览篇`
  玩家可以在多个东京地点之间自由选择，体验后返回 hub
- `午餐篇`
  玩家可以在多个餐厅之间自由选择，体验后返回 hub

普通答题场景仍然保留：

- 正误反馈
- 翻译
- 学习点
- 数值变化

## 部署

这是一个纯前端静态项目，不需要数据库或后端服务，适合直接部署到静态托管平台。

### Netlify

仓库中已包含 `netlify.toml`，可直接使用。

- Build command: `npm run build`
- Publish directory: `dist`

### Vercel

仓库中已包含 `vercel.json`，可直接使用。

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

## 适合提交到仓库的主要文件

- `src/`
- `public/`
- `package.json`
- `package-lock.json`
- `index.html`
- `vite.config.ts`
- `tsconfig*.json`
- `.gitignore`
- `README.md`
- `netlify.toml`
- `vercel.json`
