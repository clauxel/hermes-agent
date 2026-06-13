# Hermes Agent Memory

## 一句话
Hermes Agent = 一个前后端同仓的销售/支付/部署控制台：前端负责营销页与 console，后端负责订单、支付确认、部署 Hermes、再把用户带到 token 化的 Hermes console。

## 开发规则
- 开发时默认不要动支付模块和埋点跟踪模块；如需修改相关代码或配置，一定要先经用户审批
- 每次新建会话，先读本文件，再开始分析、改代码或执行任务
- 用户已明确授权：后续如果只是分析生产环境的点击事件、埋点分布或其他生产环境埋点数据，可直接连接生产环境，并可在命令行直接执行相关只读查询，不需要先单独征求审批；该授权不包含任何线上代码、配置、数据修改，也不包含支付模块变更
- 涉及数据、订单、部署、数据库状态时，不要靠猜；先去查真实数据库、真实配置或真实运行结果，再下结论

## 运行形态
- 单仓：`server.mjs` + `src/App.tsx`
- Node 原生 HTTP 服务同时处理三类流量：静态前端、`/api/*`、`/hermes-console/*` 代理
- 数据库只支持 PostgreSQL，SQLite 已移除
- 支付主路径是 Creem，PayPal 还保留在兼容/补偿链路里
- Hermes 实例部署支持两种 provider：`mock` / `ssh`
- 仓库现已支持可选的 Hermes 实例固定路由入口：`205 -> 实例路由服务 -> 116 本机实例端口`

## 前端主流程
- `/` 选择模型；`channel` 现为隐藏默认值 `WhatsApp`（若 sessionStorage 里已有历史选择则优先沿用），形成 launch draft
- `/plans` 选套餐并创建订单，再向后端申请 checkout session；当前订单页不再展示或选择 `channel`，左列只保留 `Order summary / Plan / Model / Billing cycle / Total / Launch`
- 支付完成后回到 `/console`
- `/console` 同时展示未支付订单、已支付订单、部署记录、Hermes 实例、升级/卸载/重建入口
- 访客流程靠 `guest_token` 持续访问；登录后可执行 bind account

## 后端职责分层
- `server.mjs`：总装配。加载 env、建库、组装 helpers、挂 API、处理 console proxy、执行部署/升级/停止/卸载
- `server-lib/api/order-routes.mjs`：订单主流程。创建订单、创建 checkout、支付确认、触发部署、打开 console、升级、删除
- `server-lib/api/auth-routes.mjs`：注册/登录/登出
- `server-lib/api/admin-routes.mjs`：后台用户管理、管理员删除自己名下实例
- `server-lib/api/analytics-routes.mjs`：埋点写入和后台分析查看
- `server-lib/deployment-runtime.mjs`：真正的 mock/SSH 部署运行时
- `server-lib/deployment-config.mjs`：读 `hermes-agent.config.json`，并把部署凭据优先从 env 注入
- `server-lib/app-database.mjs`：Postgres 连接、建表、迁移、开发期可走 pg-memory

## 核心数据模型
- `users` / `sessions`：账号与登录态
- `orders`：购买单，含 guest_token、支付状态、部署状态、套餐、模型、渠道、加密后的渠道 token
- `deployments`：一次具体部署尝试，含 sequence、progress、console_url、run_logs、runtime_user、service_name
- `claw_instances`：当前有效实例视图，和 deployment 一一对应
- `analytics_sessions` / `analytics_events`：运营分析

## 业务主链路
- `POST /api/launch-orders`：创建订单，未登录则绑定 guest
- `POST /api/orders/:id/checkout-session`：创建 Creem / PayPal checkout
- 支付成功后进入 `queuePaidOrder(...)`
- 首次支付成功会自动触发一次 deployment；后续可手动追加 deployment
- `POST /api/orders/:id/hermes-console`：不是直接给裸 console，而是给后端生成的 session URL
- `/hermes-console/*` 由 Launch 后端做代理，顺带注入 token / deployment 上下文

## Hermes 部署架构
- 推荐生产拓扑：`Nginx -> hermes-agent.service -> server.mjs`
- 标准发布脚本：`scripts/deploy-production.sh`，本地 build + 打包 + 上传 + 切换 `/data/hermes-agent/app` + 重启服务 + 检查 `/api/runtime`
- Launch 应用服务器目录约定：`/data/hermes-agent/{app,data,hermes-agent.env,hermes-agent.config.json}`
- 可选的非默认形态：Vercel 前端 + 独立 Node 后端，此时前端要设置 `VITE_API_BASE_URL`
- Hermes 实例部署目标由 `hermes-agent.config.json` 控制，当前实际配置是：
- `deployment.provider = ssh`
- `hermes.sourceType = archive`
- `hermes.archivePath = /data/hermes/templates/hermes-template.tar.gz`
- `hermes.baseDir = /data/hermes`
- 每次 SSH 部署会生成独立的 `workspacePath`、`runtimeUser`、`serviceName`、`.env`、`.hermes/hermes.json`
- 远端会安装/构建 Hermes，创建专属 systemd 服务；若未启用实例路由入口，则继续放开 console 端口并回写 `host:port`
- 若设置 `HERMES_ROUTER_BASE_URL`，SSH 部署会改为回写固定路径式 `console_url` / `public_endpoint`，并在 `HERMES_ROUTER_ROUTES_DIR` 下写入实例路由文件
- 实例 `gateway.controlUi.allowedOrigins` 现在会从 Launch 的 `APP_ORIGIN` 自动生成；这样即使链路经过 `205 -> router -> instance` 多层代理，Control UI 也不会只靠 `dangerouslyAllowHostHeaderOriginFallback`
- `mock` 模式只把产物写到 `data/mock-remote`

## 当前服务器职责
- 按仓库当前 env 与脚本推断，开发态没有独立远端 Launch 服务器：Hermes Agent 前后端跑在当前本机 `127.0.0.1`，开发库当前也按本机 `127.0.0.1:5432` 连接。
- 开发态和生产态当前都把 Hermes 实例部署目标指向 `34.71.182.116`；两套 env 的 `HERMES_DEPLOY_HOST` 一致。
- 生产态 `136.112.42.205` 负责 Hermes Agent 正式站：承载 `www.aigeamy.com` / `aigeamy.com` 的 Nginx 入口、`hermes-agent.service`、`server.mjs`、以及 `/data/hermes-agent/{app,data,hermes-agent.env,hermes-agent.config.json}`。
- 生产态 `34.71.182.116` 负责实际 Hermes 实例：承载 `/data/hermes/templates/hermes-template.tar.gz`、`/data/hermes/instances/*`、每实例独立 runtime user、每实例独立 systemd service、实例控制台端口放行。
- PostgreSQL 当前不能简单写死到某个独立 IP：仓库跟踪的 `.env.development` / `.env.production` 都把 `HERMES_POSTGRES_HOST` 写成 `127.0.0.1`，所以“数据库在哪台机器上”要按读取该 env 的那台机器解释。
- 仓库里同时存在两种 PostgreSQL 历史假设：same-host Launch 模板把 PG 视为 Launch 机本地组件；`README.md` 和 `scripts/setup-postgres-server.mjs` 又把 PG 视为 Hermes 部署机侧组件。线上真实归属以服务器上的 `/data/hermes-agent/hermes-agent.env` 和实例机实际配置为准。

## 服务器额外组件
- Launch 站点机除 Nginx 外，还会有 `hermes-agent.service`、Node/npm 运行时、`hermes` Linux 用户、站点 env/config/data 目录。
- 生产配置脚本还会安装或使用 `certbot`、`/etc/letsencrypt` 证书目录、`/var/www/letsencrypt` 验证目录。
- 如果按仓库脚本初始化 PostgreSQL，服务器上还会有 `postgresql*.service`、对应数据库/角色，以及 firewalld / `ufw` / `iptables` 的端口放行规则。
- Hermes 实例机还会有全局 `hermes` CLI、每实例独立 Linux 用户、每实例 `.env`、`.hermes/hermes.json`、state 目录、systemd service。
- 如果启用固定实例路由入口，实例机还会有 `server-router.mjs` 对应的 `hermes-instance-router.service`，以及 `/data/hermes/router/routes/*` 路由文件。
- 当前推荐的长期隔离方案是双 router：`prod` 走 `19080 + routes-prod + prod token`，仅允许 `205` 访问；`dev` 走 `19081 + routes-dev + dev token`，通过公网 IP 白名单放行调试人员。
- 支付确认后的部署排队目前不是单独 worker 进程，而是 Launch Node 进程内直接触发后台 `pumpDeploymentQueue()`。
- 仓库中未见需要长期单独部署的 Redis、Docker、PM2、Caddy、独立 worker、cron。

## 模型代理补充
- 已部署实例不是直接拿上游模型 key
- Launch 后端提供 `/api/internal/model-proxy/:instance/v1/*`
- 实例侧拿的是内部 token；真正上游密钥仍留在 Launch 侧 env（`QS_KEY`）
- 首页支持模型如果有增删或改名，除了更新前端展示，还要同步更新模型映射配置；至少检查 `.env.development`、`.env.production`、`deploy/hermes-agent.env.example` 里的 `HERMES_MODEL_PROXY_MODEL_MAP_JSON`，以及 `server-lib/deployment-runtime.mjs` 里的默认映射

## 环境文件规则
- `npm run dev` 只自动读 `.env.development`
- `npm run start` 只自动读 `.env.production`
- 系统环境变量优先级高于文件
- `HERMES_ENV_PATH` 可额外追加 env 文件
- 当前开发环境约定不要直接手工 `npm run dev`；统一通过 `scripts/deploy-development.sh` 或 `npm run dev:deploy` 启动，这个脚本会从 `.env.development`（或当前 shell）读取 `QS_KEY`、校验其存在，并建立/复用到 `116:19081` 的 SSH 隧道，同时自动建立一个反向 SSH 隧道，让 `116` 上的新实例可以访问本机 Launch 的内部模型代理
- `ADMIN_ALLOWED_EMAILS` 现在是管理员身份的唯一真源：白名单命中则登录后同步为 `admin`，移出白名单后下次登录会自动降回 `operator`
- 生产态下，已登录且邮箱命中 `ADMIN_ALLOWED_EMAILS` 的用户，新建订单会按 `$1.00` 写入实际支付金额；guest 与非白名单用户仍使用套餐原价

## 环境变量分组
- 基础：`PORT`、`APP_ORIGIN`
- Launch 自身：`HERMES_DATA_DIR`、`HERMES_CONFIG_PATH`、`HERMES_TOKEN_SECRET`、`HERMES_CONFIG_SECRET`、`ADMIN_ALLOWED_EMAILS`
- Hermes 实例部署目标：`HERMES_DEPLOY_*`
- 实例固定路由入口：`HERMES_ROUTER_BASE_URL`、`HERMES_ROUTER_ROUTES_DIR`、`HERMES_ROUTER_SHARED_TOKEN`
- Launch 站点自身部署脚本使用：`HERMES_LAUNCH_DEPLOY_*`
- 支付：`PAYMENT_PROVIDER`、`CREEM_ENV`、`API_TEST_KEY` / `API_PROD_KEY`，PayPal 变量仅保留兼容
- 数据库：`HERMES_POSTGRES_*`
- 模型代理：`HERMES_MODEL_PROXY_*` + 仅服务端保留的 `QS_KEY`
- 生产实例机在 `116` 上时，`HERMES_MODEL_PROXY_INTERNAL_BASE_URL` 不能留默认 `127.0.0.1`；应显式指向 Launch 所在的 `205` 私网地址，例如 `http://10.128.0.2:5173/api/internal/model-proxy`
- 生产模型代理还需把实例机私网地址加入 `HERMES_MODEL_PROXY_ALLOWED_REMOTE_ADDRESSES`（当前为 `10.128.0.4`），否则 `205` 上的内部模型代理仍会拒绝来自 `116` 的请求

## 当前环境认知
- `.env.development`：开发模式；PostgreSQL 当前配置为本机 `127.0.0.1:5432`；保留远端 Hermes 部署能力；包含 `HERMES_ALLOW_SIMULATED_DEPLOYMENT` 和 Creem test 配置
- `.env.production`：生产模式，走 Creem live；PostgreSQL 当前配置也为本机 `127.0.0.1:5432`；远端 Hermes 部署凭据改为私钥路径；不保留模拟部署开关
- 两套 env 都把 PayPal 保留为 fallback，不是主支付路径

## 出问题先看
- 订单/支付不对：`server-lib/api/order-routes.mjs` + `server-lib/payment-helpers.mjs`
- 数据库/环境加载不对：`server-lib/app-database.mjs` + `server-lib/env-loader.mjs`
- SSH 部署/升级/卸载不对：`server-lib/deployment-runtime.mjs` + `hermes-agent.config.json`
- 页面流程/控制台渲染不对：`src/App.tsx`
