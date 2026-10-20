# Cimora Studio

## 当前交接版本（2026-10-20）

这是尚在开发中的前端预览版本，供后端并行接入。下方早期设计记录可能已过期，当前接入请以 [后端交接说明](docs/backend-handoff.md) 和实际源码为准。

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5174
```

主要页面：`/`、`/pricing`、`/projects`、`/canvas`、`/showcase`、`/sign-in`、`/meika`。
验证：`npm run build`；引用同步测试：`node --test vendor/workflow-builder/src/cimora/linkedInputs.test.mjs`。
目前不需要真实 API 密钥；账号、生成、支付和云保存尚未接通。浏览器本地数据不会随仓库交付。

---


面向 Anime 创作者的 AI Agent 无限画布宣传页。

## 当前宣传页方向（2026-10-10 确认）

- 当前首页：根目录 `index.html`，地址直接为 `/`，源码样式与交互位于 `src/home/`，视频位于 `public/media/home-2k.mp4`。`/#footer` 直达页尾，旧 `/plate/index.html` 仅作兼容跳转。独立页面入口为 `/showcase`、`/projects`、`/canvas`，开发与预览服务配置了无扩展名路由，构建生成各自目录的 `index.html`。
- 保留现有 2K 视频开场、900vh 滚动节奏、转场与文字动效，只替换 Cimora 品牌和 Anime Agent 文案。
- 产品聚焦 Anime，取消 Game 方向及角色选择；角色作为 Agent 的宣传形象。
- **作品展示、Agent 团队、创作过程、实际产品操作，全部放到 About 中，后续做成一个长页介绍。当前不实现这些板块，也不追加到视频首页。**
- 最新导航调整：About 拆为 Showcase 与 Agent 两个独立入口，顶栏顺序为 Menu / Showcase / Agent / Log in。两者内容暂不实现，当前显示即将上线提示；后续内容按这两个入口组织，取代单一 About 入口。
- 下方旧版实现记录及早期设计文档属于历史方案；与以上方向冲突时，以本节为准。

## 运行

2026-10-13 导航确认：首页 Menu 改为直接返回首页的 Home，不带下拉菜单。原 Menu 内的 Community、Affiliate Program、Pricing、Contact 留到后续 Project 页面安排，本轮不提前实现。顶部顺序为 Home / Showcase / Agent / Log in。

项目页预览：`/projects`。沿用参考的深色磨砂玻璃视觉，原风暴图未提供，背景暂用现有场景图。支持创建、搜索、排序和点击卡片进入 `/canvas?project=…`；画布目前仅为工作区占位。项目存储于当前浏览器 `localStorage` 的 `cimora.projects.v1`，未接注册、登录或云端同步。首页及 Showcase 登录提示内可进入项目页预览，不代表已认证。

Showcase 预览路径为 `/showcase`，首页导航和页尾 Creations 已接入。素材配置集中在 `src/Showcase.tsx` 的 `showcaseFilms`：替换每项的 `video`、`poster`、`avatar`、片名和介绍即可。目前八个方向为布局占位，背景与头像采用用户原提示词中的八张人物照片（链接集中在 `src/data/showcasePortraits.json`），不代表真实动漫作品。配置 video 后会启用视频及播放控制。

```sh
npm install
npm run dev
npm run build
npm run lint
```

技术栈：React + TypeScript + Vite，CSS Modules + CSS 变量。纯前端实现，无后端依赖。

## 已实现

- Anime Creator、Game Builder、Comic Artist 三个方向，各一张主角色卡。
- 独立角色、背景、配色和文案，切换时联动概念展示与画布示意。
- 桌面三栏选角、移动端纵向布局、键盘选角、减少动画偏好。
- 所有产品入口均为假按钮：点击显示提示，不发请求、不跳转。

## 文件

- [官网 UI 设计说明](docs/ui-design-brief.md)：面向设计师的产品概念、角色体系、页面布局与素材需求。

- `src/App.tsx`：角色内容、选角与占位交互。
- `src/App.module.css`：主题和响应式布局。
- `public/images/`：生成的原创角色与背景素材。
- `docs/integration.md`：后续入口接入约定。

当前为可预览的宣传页第一版，尚未部署。概念图不代表产品真实生成结果。网页字体来自 Google Fonts，网络不可用时使用系统字体。

本仓库负责产品、前端、UI 与接口文档，后端由独立团队实现。

### 项目页原稿复刻调整（2026-10-11）

用户要求严格按天气仪表盘提示词还原，不自行替换素材或调整卡片布局及大小。当前 `/projects` 展示独立原稿 `public/weather/index.html`，保留天气文案、头像链接、1357×871 缩放坐标及四张右栏卡片。之前的项目创建界面暂不展示，原浏览器项目数据不删除，画布占位路由仍保留。

原提示词缺少 `assets/storm-background.jpg` 实际文件，当前仅使用指定的 #04121b 兜底色，待用户提供后放入 `public/weather/assets/storm-background.jpg`。提示词未给完整曲线控制点，当前曲线为近似，不能称为像素级完全还原。
