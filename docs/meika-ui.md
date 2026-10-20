# 美卡 UI 组件与 Skill

预览：运行 `npm run dev` 后打开 `/meika`。展示页使用独立入口，不依赖主站页面组件。

- 组件：`src/components/meika/index.tsx`，样式：`src/components/meika/meika.css`。
- 展示页：`src/meika/main.tsx` 和 `src/meika/showcase.css`。
- 素材：`public/meika/`，24 个独立图层、5 张参考预览；`manifest.json` 记录原始 PSD 和图层位置。
- 已安装 Skill：`C:/Users/Administrator/.codex/skills/meika-game-ui/`，可使用 `$meika-game-ui` 调用。
- 可移交安装包：`docs/meika-game-ui-skill.zip`。内含 Skill、参考图、素材、React 组件副本及导出脚本。

组件根节点使用 `className="mk-theme"`。导出 GameButton、ResourceCounter、PlayerBadge、ModeCard、GameNavigation、RewardItem、RewardDialog，以及 meikaAsset。具体参数见组件 TypeScript 类型和 Skill 的 `references/components.md`。

当前展示为组件组合示例，不是五个游戏页面的完整复刻。匹配、资源增加和导航切换使用本地演示状态，无服务器调用。Acumin 原字体尚未提供，使用系统字体替代。移动端布局、交互状态、CSS 光效为实现补充。

需要更新 Skill 组件副本时，把当前两个组件文件同步至 Skill 的 `assets/react/`；素材同步至 `assets/media/` 后重新打包。原始 PSD 始终保留在 `D:/BaiduNetdiskDownload/美卡界面`，没有被修改。
