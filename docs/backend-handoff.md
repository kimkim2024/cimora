# 后端接入交接 · 2026-10-20

## 版本边界

这是可运行的前端阶段版本，不是已上线产品。项目包含首页、Pricing、项目/单集入口、Canvas 节点工作区、登录页面和美卡 UI 组件展示。已有布局和本地交互不等于服务端能力。请先使用本地预览，不填入生产密钥。

## 启动与验证

建议使用 Node.js 22.12+（或满足 Vite 8 要求的更新版本）。执行 `npm ci`，再执行 `npm run dev -- --host 127.0.0.1 --port 5174`。打开 `/canvas` 可独立预览；`/meika` 为组件展示。`npm run build` 先生成画布 Tailwind 样式再执行类型检查和构建；产物为 `dist/`。静态服务器需支持各页面目录入口。

引用同步回归：`node --test vendor/workflow-builder/src/cimora/linkedInputs.test.mjs`。

## 建议接入顺序

1. **账户与鉴权**：登录页面及账户信息目前是前端预览。服务端确认身份、工作流所有权及权限。`src/Canvas.tsx` 向 `src/components/CanvasToolbar.tsx` 传余额；当前 2388 是演示值，接入后替换，并关闭 `balanceIsPreview`。蓝钻石表示平台积分余额，不是美元或经验；加载/失败用 null，真实零余额用 0。
2. **项目和工作流读写**：`vendor/workflow-builder/src/cimora/transport.js` 是当前本地适配层。`loadWorkflow` 读取 localStorage，`POST /api/workflow/create` 保存 localStorage。替换为服务端接口；保持节点 ID、连线端口、分组关系、坐标和视口。项目/单集按 URL 参数隔离，详见 `canvas-integration.md`。不要依赖 beforeunload 完成异步保存。
3. **素材上传**：同文件 `uploadAsset(file)` 当前返回 data URL，单文件上限 2 MB。替换为服务端/对象存储上传返回的持久 URL，明确类型、大小限制及失败提示。
4. **模型与执行**：`vendor/workflow-builder/src/cimora/schemas.js` 是预览模型目录。对接真实目录、节点执行、工作流执行和状态轮询。继承的路径与响应约定见 `canvas-integration.md` 和 `NodeFlow.jsx`；可在 transport 映射后端自有路径。当前除保存和费用占位外，请求会明确报未接入。
5. **积分与充值**：`src/components/TopUpDialog.tsx`、`src/Pricing.tsx` 是入口。Pricing 的 $9.99/$29.99/$79.99 为当前展示价格，积分数量仍待确认，套餐按钮禁用；不要据此自动创建真实商品。服务端负责计价、余额、幂等扣费、退款与支付回调。四档钻石图案仅表示档位递增，不是实际积分数量。

## 画布数据注意事项

- 核心实现：`vendor/workflow-builder/src/components/NodeFlow.jsx`；业务扩展：同级 `../cimora/`。
- 普通节点存储中的 `localFormValues`、`linkedInputs` 用于恢复手动输入与连接引用的来源关系，不能在保存接口中任意丢弃。执行参数与编辑器持久化数据应区分，执行仅接受后端验证过的模型参数。
- `linkedInputs.mjs` 负责连线断开、源素材变化、多端口同步；`unifiedInputs.mjs` 负责端口和分组引用。Group 汇总内部资产作为下游 References，分组移动归属在拖拽结束后更新。
- 删除分组保留内部节点；解组清理分组连线。撤销重做为当前页面的本地历史，不是云端版本管理。
- 角色/场景生成预览包含样例素材，不能当作真实执行结果。现有代码不提供协作编辑或持久任务调度。

## 交付内容

仓库包含源代码、依赖锁文件、运行素材和上游许可证。`node_modules/`、`dist/`、调试截图/日志、环境密钥文件不入库。用户浏览器中的项目、画布和上传素材不随 Git 同步，需要另行导出或在新浏览器新建。

上游来源与 MIT 许可证见 `vendor/workflow-builder/LICENSE`、`docs/canvas-integration.md`。旧 `docs/integration.md` 中的早期页面描述仅作历史参考；当前头像钻石点击打开充值弹窗，头像其余区域打开账户菜单。
