# 日本旅游模拟器

一个移动端优先的网页文字选择游戏。  
玩家会沿着一次东京自由行的主线前进，在不同场景里做选择、学习旅行日语，并根据状态数值与探索进度获得不同风格的结算。

项目使用：

- `Vite`
- `React`
- `TypeScript`
- 纯 CSS

## 当前内容

- 开始页与角色选择页
- 男女角色插画切换
- 主线旅行流程
- 东京游览篇 hub
- 午餐篇 hub
- 普通题目反馈区
- 随机场景：浅草寺抽签
- 结算页称号、标签与旅行总结

## 本地运行

```bash
npm install
npm run dev
```

默认开发地址通常是：

- `http://127.0.0.1:5173/`
- `http://localhost:5173/`

## 生产构建

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
    ui/
    scenes/
```

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

## 素材说明

- 角色选择图位于 `public/images/ui/`
- 场景插画位于 `public/images/scenes/`
- 图片按性别区分命名，例如 `出发前_女.png`、`出发前_男.png`

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
