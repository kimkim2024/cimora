# Canvas frontend integration

## 来源与范围

复用 Open-Generative-AI 所依赖的 Vibe-Workflow 前端，不是 Higgsfield 官方源码。

- 上游：https://github.com/SamurAIGPT/Vibe-Workflow
- 固定版本：c65ce897e82bf73659c2725528c8492cd609d831
- 源目录：packages/workflow-builder/src
- 本地：vendor/workflow-builder/src
- MIT 许可证保留在 vendor/workflow-builder/LICENSE。

保留上游节点、连线、参数面板、缩放、复制和删除交互。移植修改包括：Next 路由/图片组件替换、本地请求适配、素材本地预览、Cimora 深色画布、Save 入口，以及不依赖外部服务的 Anime shot 模板。发布和 AI 助手入口未开放。没有接入真实模型、账号、云存储或工作流调度。

## 入口与保存

- /canvas?project=<projectId>
- /canvas?show=<seriesId>&episode=<episodeId>
- /canvas：独立 sandbox，方便调试。

项目和单集记录沿用现有 localStorage。不存在的项目显示错误，不创建假项目。
画布保存键：cimora.canvas.v1:project:<id> 或 cimora.canvas.v1:episode:<seriesId>:<episodeId>。
点击 Save 保存，上游离开页面保存逻辑也保留；保存失败显示错误。不要把 beforeunload 当作未来异步云保存的保证。

保存内容：version、workflow_id、name、category、data.nodes、edges、viewport。
每个节点包含 id、category、model、position、input_params（编辑值）、params（上游执行参数）、output_params、inputs（依赖）。连线包含 source/target 及 sourceHandle/targetHandle。
素材当前转为 data URL；单文件最多 2 MB，超限拒绝，浏览器总配额不足时保存会报错。后端上线应替换为上传接口返回的持久 URL。

## 后端接入边界

所有原 axios 请求均改为 src/cimora/transport.js 的局部适配器，不会请求 MuAPI。当前 create 写本地、费用返回 null，其余请求明确拒绝。

技术开发人员需替换：

1. loadWorkflow(id, name)：读取工作流，返回 {workflow_id,name,is_owner:true,data:{nodes:[]},edges:[],viewport?,run_history?}。
2. transport.post('/api/workflow/create', payload)：保存，返回 {data:{workflow_id}}。
3. schemas.js 的 previewSchemas：替换成后端模型目录。结构 categories.<text|image|video|audio>.models.<id>.input_schema.schemas.input_data，内含 properties / required。
4. uploadAsset(file)：上传并返回持久素材 URL。
5. POST /api/workflow/:id/run 和 /api/workflow/:id/node/:nodeId/run：发起执行；GET /api/workflow/run/:runId/status：轮询任务。具体节点状态、历史结果映射见 NodeFlow.jsx 的 pollRunIdStatus 和各节点组件。
6. /api/app/calculate_dynamic_cost：可选费用估算。没有接入时保持 null，不显示虚假价格。

以上路径是前端继承的接口形状，不要求后端沿用；可在 transport 中映射自有接口。鉴权、权限、配额、输入验证、任务重试由后端实现，供应商密钥不得放在浏览器。

## 构建与验证

npm run canvas:css 从 vendor 源码生成隔离的 Tailwind 工具样式；npm run build 会自动执行它。画布按路由懒加载，避免首页加载画布代码。

检查项目/单集隔离、编辑和连线、复制/删除、Save 后刷新、上传后刷新、生成未接入提示，以及无效项目入口。当前不承诺协作编辑、云同步、执行结果或完整撤销历史。
