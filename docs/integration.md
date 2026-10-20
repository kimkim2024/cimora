# 宣传页接入说明

当前版本没有后端 API，也没有登录、支付或生成请求。用户已明确要求先使用假按钮。

## 产品入口

所有入口通过 `src/App.tsx` 中的 `demoEntry()` 显示占位提示。未来产品 URL 确定后，在这里接入跳转。

三个方向的稳定标识为 `anime`、`game`、`comic`。是否共用入口、是否通过参数选择模板，等已有产品的实际约定确定后再接入；当前不假设路由或参数格式。

## 内容边界

选角、主题和展示内容均来自前端静态角色数组。角色图、背景、作品裁切和画布连线均为宣传概念素材，未连接真实项目、模板或作品数据。现有产品能力与官网文案需要在正式发布前逐项核对。

## 角色详情

细分选项保存在前端方向配置中，分别为 anime: shorts/cosplay，game: cg/demo，comic: american/manga/webtoon。每个角色在页面存续期间记住选择。色块选择同步更新中间角色配色、右侧概念示例与占位 CTA；上方主角色卡保持默认形象。没有真实上传或生成接口，Game Demo 指演示视频。

## Game Builder 3D 试点

`src/GameCharacter.tsx` 用 Three.js 程序几何搭建轻量机器人，占位验证旋转、材质换色与按需加载，不是 ROOK 正式模型。桌面选择 Game Builder 后加载独立 Three.js 分包；手机先显示图片，点击 View in 3D 启用。静止按需渲染，自动旋转可选，离屏/隐藏时不绘制；减少动画偏好禁用自动旋转。组件卸载释放几何、材质、控件和 WebGL 上下文。WebGL 初始化失败或上下文丢失时回退图片。

当前没有外部模型/贴图下载成本，不能据此保证正式 GLB 的加载速度或低端真机帧率。正式模型接入后需另测网络、解码与 GPU 性能。此次构建 Three.js 独立包 gzip 约 187 KB，控件约 4.4 KB；Vite 对未压缩 736 KB 的独立包给出体积提示。


## Canvas 头像栏：账户余额展示

右上角头像下方的蓝宝石条是**当前登录账户的可用余额展示**，不是等级、经验、进度条或价格。蓝宝石是平台积分的货币符号，素材为 `public/meika/gem.webp`；不代表美元或其他法币。

- 展示入口：`src/Canvas.tsx` → `CanvasToolbar` 的 `balance: number | null` 属性。接口返回后由账户查询状态传入；属性更新会自动刷新数值，不需要重载画布。
- 当前 `balance={2388}` 和 `balanceIsPreview` 仅为前端演示数据，悬停提示明确标注未连接账户 API。正式接入时移除演示常量，并将 `balanceIsPreview` 设为 `false`。
- `balance` 应为账户当前可用余额，非负有限数值，单位为平台积分。`0` 显示为 `0`；`null`、未传值或无效值显示 `—`，不能将请求失败或加载中当作零余额。数值带千分位，不用 K/M 缩写；小数按传入值显示。
- 接口路径和响应字段由后端团队确认，前端在账户数据适配处映射到 `balance`。当前没有实际余额请求，也不从浏览器本地缓存推断真实余额。
- 登录或切换账户后重新获取余额；充值到账、生成扣费、退款后刷新账户余额查询，以服务端返回值为准。请求期间或请求失败时传入 `null`；退出登录清空原账户数值，避免显示上一个账户余额。
- 蓝宝石条复用 `ResourceCounter`，头像栏复用 `PlayerBadge` 的 `subtitle` 插槽；点击整个头像栏仍打开账户菜单，余额条不直接发起充值或扣款。屏幕阅读器通过 Balance/余额标签和 live region 获取数值变化。


## Canvas 美卡 UI 皮肤

`src/Canvas.tsx` 根节点启用 `canvas-meika mk-theme`；`src/CanvasMeika.css` 在原有画布样式之后加载，只覆盖视觉，不改变节点数据结构、连线、拖拽、分组或生成接口。

- 现有 `GameButton`、`PlayerBadge`、`ResourceCounter` 继续用于工具栏及余额。节点编辑器、资源库、输入面板和风格/运镜库保留原业务组件，统一使用画布颜色变量，避免另建重复交互组件。
- 四种主题暂保留：深蓝、浅色、天空蓝、粉紫。`--canvas-*` 控制文本、输入框、边线和选中态；`--meika-surface` / `--meika-shadow` 控制玻璃面板。Group 使用带透明度的 `--group-*` 变量。
- 图片预览保持原色；禁用预览容器不对图片应用灰度滤镜。原有颜色选择器的内容与展开方向保留。
- 新增面板应复用上述变量；主操作使用金色，普通选中与悬停使用主题强调色。不要在业务数据中保存视觉样式。

### Canvas shared icons

Canvas UI icons are provided by `src/components/meika/CanvasIcons.tsx`. Media, character, resource and save/upload icons use flat solid SVG silhouettes with transparent cutouts, following the supplied Meika navigation reference; small utility glyphs retain recognizable shapes. Functional icons use the theme-aware --canvas-glyph color, without gradients or shadows. The account avatar and sapphire currency artwork retain their original materials. Keep icon sizes and accessible names on the existing controls. Connection handles, generated artwork and the brand logo are not UI icon replacements. No API or event-handler changes are required.
