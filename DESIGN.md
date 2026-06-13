# Hermes Agent 设计文档

## 产品目标

Hermes Agent 是一个以转化率优先为目标的部署流程。面向希望快速完成模型选择、消息渠道绑定、套餐购买，并在付款后立即查看 Hermes 部署状态的客户。

整个网站围绕一条尽量短、尽量清晰的主路径展开：

1. 选择默认模型
2. 选择连接方式
3. 在弹窗中保存对应渠道的 Token
4. 点击 Launch Claw
5. 进入套餐选择页
6. 跳转到 PayPal Hosted Checkout
7. 完成付款
8. 跳转控制台查看到 Hermes 与部署状态

补充原则：

- 整个部署与支付流程不以注册或登录为前置条件
- 注册 / 登录仅用于后续账号化管理，以及绑定用于连接 Hermes 的 Token

## 核心用户路径

### 1. 首页

路由：`/`

目标：

- 首屏聚焦“配置并开始”，而不是先让客户做价格比较
- 默认选中 GPT-5.4，降低第一次操作成本
- 不默认选中连接方式，要求客户主动选择渠道
- 连接方式点击后弹出 Token 输入窗口，而不是在页面上直接暴露明文输入框
- 首页部署流程不要求客户先注册或登录

首页行为：

- 页面初始默认选中 GPT-5.4
- Telegram、Discord、WhatsApp 都不做默认选中
- 客户点击某个连接方式后，弹出对应的 Token 引导窗口
- 客户在窗口中输入 Token，点击 Save
- 之后点击 Launch Claw，进入套餐选择页
- 整个流程可以匿名完成，不要求先创建账号

### 2. Token 弹窗

目标：

- 用更聚焦的方式采集渠道凭证
- 把“如何获取 Token”的说明和实际输入动作放在同一个地方，减少理解成本

行为：

- Telegram 提供 BotFather 引导
- Discord 提供开发者后台引导
- WhatsApp 提供 Business / Provider Token 引导
- 点击 Save 后，将 Token 保存到当前 Launch 草稿，并关闭弹窗

### 3. 套餐选择页

路由：`/plans`

目标：

- 把“产品配置”和“商业化选择”拆开
- 让客户在已有明确购买意图后再比较套餐

行为：

- 页面读取从首页带过来的 Launch 草稿
- 如果缺少模型、渠道或 Token 草稿，则不应继续完成下单
- 套餐卡中的主价格始终按“每月价格”展示
- 顶部支持 Yearly / Monthly 切换
- 默认选中 Yearly
- Yearly 使用“6.5 折”逻辑，即按年付时展示折后月均价，同时补充说明实际按年扣费
- 点击某个套餐按钮时，只切换当前选中的套餐
- 点击页面主按钮 Launch 后，系统先创建订单，再向后端申请 PayPal checkout session
- 如果后端返回 `checkoutUrl`，前端立即跳转到 PayPal Hosted Checkout，而不是依赖站内 JS SDK 弹窗
- 创建订单后会生成 `checkoutPath` 与 `consolePath`，后续所有访客访问都依赖这两个地址中的 `guest_token`

### 4. 支付与订单创建

目标：

- 在真正启动部署前完成支付确认
- 让客户看到订单摘要、支付状态与部署准备状态

行为：

- 客户在套餐页选择套餐后，系统创建订单
- 系统优先在 `/plans` 页面调用后端创建 PayPal Order，并拿到 PayPal Hosted Checkout URL
- 独立的 `Payment & Deployment` 页面已删除；`/checkout` 只作为支付完成后的回跳入口
- 前端默认使用 PayPal Hosted Checkout 跳转，不再把 JS SDK 弹窗作为主支付路径
- PayPal 批准后，支付提供方回跳到 `/checkout?order=<id>&token=<paypalOrderId>&PayerID=<payerId>`
- 前端检测到回跳参数后，立即调用后端执行 capture
- 后端 capture 成功后才把本地订单改成 `paid`
- 系统保留 PayPal webhook 作为补偿链路，用于处理“客户已完成支付但前端未成功回写”的场景
- 一旦确认支付完成，订单状态切换为 `paid`，部署状态切换为 `queued`，并立即进入部署队列
- PayPal 页面负责收银；站内页面负责展示订单、套餐、模型、渠道、支付状态和预计部署时间
- 客户完成付款后，系统进入控制台，避免旧状态覆盖新状态

### 5. 控制台

路由：`/console`

目标：

- 成为付款后的统一运营入口
- 展示 Hermes 实例、部署进度、订单状态和访问位置
- 在匿名流程下也能查看当前订单和部署状态

行为：

- 付款完成后，客户自动跳转到控制台
- 控制台的 `Hermes Management` 当前以订单为主表，再拼接可能存在的 Hermes 实例
- 即使客户只是在 `/plans` 点击了 `Launch` 且尚未完成支付，只要订单已创建，`Hermes Management` 也要立即新增一条待支付的 Hermes 管理记录
- 每条记录当前展示：实例名或模型/渠道名、套餐与金额、部署状态、工作目录或占位文案、支付状态、账号绑定状态、遮罩后的 Token
- 每条记录还需要在状态徽标区域展示当前 Hermes 版本，格式为 `Hermes <version>`
- 如果渠道 Token 暂未绑定，控制台仍然要允许客户直接打开该 Hermes 实例控制台
- 只有已支付订单才展示该套餐一共可触发多少次部署、已占用多少次、还剩多少次；未支付订单不能展示任何可用 Hermes 数量
- 控制台 `Orders` 卡片只展示已支付且仍可继续部署的订单列表，并为每个订单提供 `Create Hermes` 按钮
- 操作按钮根据状态切换：
  - 未支付：`Hermes Management` 中仅显示 `Pay now`
  - 开发模式下，未支付订单额外显示 `Delete`，用于清理本地或测试订单
  - 未支付订单不出现在 `Orders` 卡片，也不显示 `Create Hermes`
  - `Hermes Management` 中不显示 `Create Hermes`；该按钮只出现在 `Orders` 卡片
  - 支付成功后必须立即进入自动部署，并在 `Hermes Management` 中显示明显的自动部署状态与进度
- 自动部署失败后，`Hermes Management` 显示 `Deploy`
  - 已存在 Hermes 实例：显示一个小型 `Upgrade` 按钮
  - 已存在 Hermes 实例：显示一个 `Uninstall` 按钮，用于卸载实例并从管理列表移除
  - 已存在 `consoleUrl`：额外显示 `Open console`
  - `Open console` 不能直接打开裸控制台根地址，而是要经过后端拿到带 `?token=` 的 tokenized dashboard URL
  - 已登录且订单仍属访客：显示 `Bind to my account`
- 正在部署中的 Hermes 需要展示一个持续运动的图标，而不是额外显示 `Track deployment`
- 客户侧不直接展示部署过程状态文案；运行正常时显示 `Running`，异常时显示 `Issue`
- 如果实例控制台已可打开，但渠道 Token 未绑定，则客户侧状态应显示 `Console ready`
- 控制台需要额外展示渠道接入状态：
  - 已填写 Token 但尚未真正接入渠道：显示 `Token saved <masked-token>`
  - 未绑定 Token：显示 `Channel not bound`
- 控制台展示 Hermes 实例，包括模型、渠道、目标服务器、工作目录、控制台地址
- 客户后续查询部署结果时，以控制台为唯一主入口
- 如果客户后续注册或登录，则可继续使用账号化方式管理 Token 绑定和后续操作

### 5.1 控制台中的账号绑定规则

- `Bound / Unbound` 只表示订单是否已绑定到登录账号，不表示渠道 Token 是否已填写
- 如果订单是在已登录状态下创建，则订单默认绑定到当前登录账号，状态显示为 `Bound`
- 如果订单是在未登录状态下创建，则订单默认归属于访客会话，状态显示为 `Unbound`
- 未登录创建的订单在控制台登录后，必须支持执行一次“Bind to my account”，绑定完成后状态变为 `Bound`
- 绑定账号后，订单、部署记录和 Hermes 实例都归属于该登录账号
- 控制台中的 Token 展示只用于帮助识别当前渠道凭证，必须显示为遮罩值，不显示完整明文

### 5.2 Hermes 版本升级

- 客户可以在控制台中对已部署完成的 Hermes 手动发起版本升级
- 升级入口位于 `Hermes Management` 行内，表现为小型 `Upgrade` 按钮
- 点击后弹出升级窗口，窗口从 GitHub 读取当前 Hermes 仓库的 tag 版本列表
- 客户可在窗口中选择任意一个版本并点击确认
- 升级提交后，后端需要到该实例所属服务器执行版本切换、依赖安装、构建与服务重启
- 升级完成后，控制台提示客户升级结果，并立即刷新当前 Hermes 版本显示
- 如果升级失败，控制台保留 `Upgrade issue` 状态徽标，帮助客户判断当前实例需要进一步处理

### 5.3 无 Token 控制台模式

- 理论上可行：Hermes 实例的控制台可先独立运行，渠道绑定不是打开控制台的前置条件
- 控制台模式下，实例先完成 Hermes gateway / control UI 部署，再由客户后续补充 Telegram / Discord / WhatsApp Token
- 这种模式下，客户能直接点击 `Open console` 进入实例控制台，但消息渠道能力保持未绑定状态
- 如果客户在购买时已经填写了 Token，系统也只保存该 Token，不把它作为控制台部署成功的前置条件
- 因此购买时填写的 Token 更接近“待绑定渠道凭据”，控制台中要显示为 `Token saved <masked-token>`
- 因此控制台设计需要把“实例控制台可用性”和“渠道绑定是否完成”拆开显示，避免把“没有 Token”错误地等同于“实例不可用”
- 为避免客户手动粘贴 gateway token，控制台里的 `Open console` 必须通过受权限保护的后端接口换取 tokenized dashboard URL

## 后端流程

### 访问控制模型

- 系统同时支持两种访问身份：登录用户、访客会话
- 访客会话依赖 `guest_token`，并通过 `checkoutPath` / `consolePath` 持续访问订单与实例
- 登录用户访问自己的订单；管理员可查看全部订单
- 如果登录用户当前 URL 里仍带有 `guest_token`，则控制台需要同时合并：
  - 当前账号名下的订单 / 实例
  - 当前访客会话名下的订单 / 实例
- 这样可以保证“先游客购买、后登录绑定”场景不会丢单

### 订单创建

当客户在套餐页点击套餐时：

- 前端提交模型、渠道、Token、套餐与计费周期
- Token 允许留空，表示“先部署控制台，后续再绑定渠道”
- 后端创建订单记录
- Token 在持久化前先进行加密
- 如果客户未登录，则系统使用访客方式保存当前订单访问权限
- 如果客户已登录，则订单直接写入当前账号
- 系统按订单金额创建 PayPal Order，并保存 `paypal_order_id`
- PayPal Client ID 仅在前端需要公开支付上下文时下发，Secret 只保留在服务端

### 支付确认

当客户完成付款时：

- 系统优先通过 PayPal Hosted Checkout 回跳参数触发服务端 capture
- 系统同时接收 PayPal webhook，用于处理“用户付款后未成功回写前端”的自动部署场景
- 如果前端未能及时把订单改成 `paid`，控制台 / 订单查询会基于 `paypal_order_id` 主动向 PayPal 对账
- 对账成功后，订单状态更新为已支付
- 已支付订单会自动触发该订单的第一次部署
- 前端进入控制台并轮询最新订单状态

### 自动触发与手动触发

- 每个订单会记录套餐包含的 `included_deployments`
- `Starter / Growth / Scale` 默认分别包含 `1 / 5 / 20` 次可触发部署额度
- 但这些部署额度只在订单支付成功后才对客户可见、可用；未支付订单不能在 `Orders` 卡片中展示剩余额度
- 付款成功后，系统只自动触发一次部署，记为 `automatic`
- 如果订单仍有剩余可部署额度，客户可在控制台继续触发下一次部署，记为 `manual`
- `Orders` 卡片中的 `Create Hermes` 按钮与管理列表中的手动部署入口共用同一个后端能力
- 手动触发不是重新支付，也不是重建订单，而是在原订单下追加新的部署记录和新的 Hermes 实例记录
- 手动创建成功后：
  - 当前订单的剩余可部署数量需要立即减少
  - `Hermes Management` 需要新增刚创建的 Hermes 记录
- 失败中的部署不会永久占用额度；只有 `queued / provisioning / deployed` 会占用当前订单的部署槽位

### 部署处理

后端部署任务执行器负责：

- 拉取待部署任务
- 解密已保存的 Token；但初始部署阶段不依赖该 Token 成功接入渠道
- 读取 `hermes-agent.config.json`
- 如果配置文件中服务器密码仍为明文，则首次读取时自动加密并回写配置文件
- 通过 SSH 连接目标服务器，或者在 mock 模式下写入本地模拟节点
- 执行真实部署命令或模拟部署流程
- 创建或更新 Hermes 实例记录
- 更新部署进度和最终状态
- 部署状态与实例状态保持同步，供 `/console` 与支付回跳后的订单刷新共同消费
- 如果控制台已可访问，但渠道未绑定，则：
  - 实例可访问状态按 `Console ready` 展示
  - 如果订单中已保存 Token，则渠道状态按 `Token saved <masked-token>` 展示
  - 渠道状态按 `Channel not bound` 展示
  - `Open console` 操作必须可用
- 部署时需要生成并保存独立的 Hermes gateway token；控制台后端在订单访问鉴权通过后，不能直接把公网裸控制台地址返回给前端，而是要返回同源代理地址，再由后端把请求转发到 Hermes 控制台并附带 token

### Hermes 版本升级处理

- 版本列表接口按订单访问权限控制，只允许当前订单拥有者或访客会话读取
- 版本来源为当前配置的 GitHub Hermes 仓库 tag 列表；如果当前配置的 `repoRef` 不在 tag 中，也要补充到列表中
- 升级只针对订单当前最新的 Hermes 实例执行，不会新建订单，也不会额外占用部署额度
- 升级开始时，实例记录写入 `upgrade_status = in_progress` 和目标版本
- 服务端连接目标服务器后，在实例自己的工作目录内执行：
  - 拉取 GitHub tags
  - 切换到客户选定版本
  - 安装依赖
  - 重新构建
  - 重启实例对应的 systemd 服务
- 升级成功后，实例记录更新为新的 `hermes_version`，并把升级状态重置为 `idle`
- 升级失败时，实例记录写入 `upgrade_status = failed` 与错误原因，供控制台展示 `Upgrade issue`
- mock 模式下也要模拟版本切换，保证前端与测试环境都能验证升级链路

### 服务器配置文件

- 默认配置文件路径：项目根目录 `hermes-agent.config.json`
- 配置文件现在只保留两类长期配置：
  - `deployment`：部署提供者、目标服务器名、console/public URL
  - `hermes`：Hermes 仓库地址、安装目录、systemd 服务前缀、启动命令
- SSH 连接凭据不再以 `server` 段作为主来源
- 真实部署时，SSH 主机、端口、账号、密码统一从当前激活的环境文件读取：
  - 开发模式：`.env.development`
  - 生产模式：`.env.production`
- 运行时实际读取的键为：
  - `HERMES_DEPLOY_HOST`
  - `HERMES_DEPLOY_PORT`
  - `HERMES_DEPLOY_USERNAME`
  - `HERMES_DEPLOY_ROOT_PASSWORD`
- 这样可以把部署机器凭据和部署逻辑配置分离，避免 `hermes-agent.config.json` 同时承担代码配置与密钥存储职责

### 目录隔离与权限收敛

- 每个 Hermes 实例都部署到独立目录：`<baseDir>/instances/<instanceName>`
- 每次部署都会创建独立的系统用户与独立的 systemd 服务
- systemd 服务通过 `ProtectSystem=strict`、`NoNewPrivileges=true`、`ReadWritePaths=<instanceDir>` 等策略，限制该实例只能写自己的目录
- Token、模型、渠道、订单号等运行参数写入该实例自己的 `.env` 文件，权限收敛为实例用户可读
- 这样可以保证单个龙虾实例即使被操作，也不能写入其他实例目录或系统目录
- SSH 实际部署时，后端需要在部署完成的同一个事务链路里，把真实可访问的 Hermes console URL 回写到 `deployments.console_url` 和 `claw_instances.console_url`，不能继续保留 `console.hermes.local/<instance>` 这类占位地址
- SSH 实际部署时，还要在服务器侧同步放行该实例控制台端口，优先写入 firewalld；如果服务器使用其他防火墙，则按 ufw / iptables 做兼容放行

### 账号绑定流程

- 访客订单默认带有 `guest_token`，因此控制台绑定状态为 `Unbound`
- 用户登录后，如果当前控制台地址仍保留该 `guest_token`，则可以看到这条访客订单
- 控制台触发 `Bind to my account` 后，后端会同步更新：
  - 订单归属 `user_id`
  - 订单上的 `guest_token`
  - 对应部署记录的 `user_id`
  - 对应 Hermes 实例的 `user_id`
- 绑定完成后，该订单从访客态切换为账号态，控制台状态更新为 `Bound`

## 生产部署拓扑

### 推荐线上架构：Nginx + Hermes Agent Node

- 公开站点域名：`https://www.aigeamy.com`
- Nginx 作为公网入口，反代到同机 Node 进程 `http://127.0.0.1:5173`
- 同一个 `server.mjs` 进程同时承载 React 页面、`/api/*`、支付回跳和 `/hermes-console/*` 代理
- 生产前端不设置 `VITE_API_BASE_URL`，浏览器直接走同源 `/api/*`
- 后端通过 `APP_ORIGIN=https://www.aigeamy.com` 校验来源、生成支付回跳地址并保持控制台同源代理

### 为什么推荐和开发环境保持同构

- 本地开发也是通过同一个 `server.mjs` 入口同时处理页面与 API，请求路径和路由兜底规则一致
- `/console`、`/checkout` 这类支付回跳与控制台深链接在同机构型下天然由同一个服务兜底，不依赖额外平台 rewrite
- 当前后端依赖 PostgreSQL、配置文件、控制台代理和常驻部署轮询，更适合常驻 Node 服务而不是静态站加跨域 API
- SSH 部署与长任务执行本来就运行在后端常驻进程里，同机构型可以减少额外的跨域、回跳域名和代理复杂度

### 生产服务器环境变量

- `NODE_ENV=production`
- `PORT=5173`
- `APP_ORIGIN=https://www.aigeamy.com`
- `HERMES_POSTGRES_HOST=<postgres-host>`
- `HERMES_POSTGRES_DB=<postgres-db>`
- `HERMES_POSTGRES_USER=<postgres-user>`
- `HERMES_POSTGRES_PASSWORD=<postgres-password>`
- `HERMES_DATA_DIR=/srv/hermes-agent/data`
- `HERMES_CONFIG_PATH=/srv/hermes-agent/hermes-agent.config.json`
- `HERMES_TOKEN_SECRET=<long-random-secret>`
- `HERMES_CONFIG_SECRET=<long-random-secret>`
- `PAY_CLIENT_ID=<paypal-live-client-id>`
- `PAY_SECRET=<paypal-live-secret>`
- `PAYPAL_WEBHOOK_ID=<paypal-webhook-id>`
- `PAYPAL_ENV=live`

### dev / prod 后端与数据库关系

- 当前约定是：
  - 本地启动的后端服务是 `dev` 实例
  - 部署到 `47.251.171.158` 的后端服务是 `prod` 实例
- `47.251.171.158` 这台服务器上同时承载两套 PostgreSQL 数据库：
  - 开发库：`hermes_dev`
  - 生产库：`hermes_prod`
- 两套库共用同一台 PostgreSQL 服务器，但使用不同账号、不同数据库名，不共享业务数据
- 环境区分规则：
  - `npm run dev` 读取 `.env.development`
  - `npm run start` 读取 `.env.production`
- 因此数据库连接关系固定为：
  - `.env.development` → `HERMES_POSTGRES_USER=hermes_dev` / `HERMES_POSTGRES_DB=hermes_dev`
  - `.env.production` → `HERMES_POSTGRES_USER=hermes_prod` / `HERMES_POSTGRES_DB=hermes_prod`
- 生产后端虽然部署在 `47.251.171.158`，但它只应连接 `hermes_prod`
- 本地开发后端即使把 PostgreSQL 主机指向 `47.251.171.158`，也只应连接 `hermes_dev`
- 同一台物理服务器可以同时承载 dev/prod 数据库，但应用层必须通过环境文件维持严格隔离
- Hermes Agent 平台自身与部署出去的 Hermes 实例都统一使用 PostgreSQL；两者通过不同数据库和账号隔离

### DNS 规则

- `www.aigeamy.com` 指向 Nginx / Node 所在服务器
- `aigeamy.com` 按站点策略跳转到 `www.aigeamy.com`
- `api.aigeamy.com` 仅在保留旧分离架构时才需要
- 生产证书至少覆盖 `www.aigeamy.com` 与 `aigeamy.com`

### 上线验证清单

- 打开 `https://www.aigeamy.com`，确认首页返回 `200`
- 请求 `https://www.aigeamy.com/api/auth/me`，确认返回 JSON 而不是 `404`
- 在浏览器 Network 中确认前端请求的 API 主机为 `www.aigeamy.com`
- 点击 Launch 后确认出现：
  - `POST /api/launch-orders`
  - `POST /api/orders/<id>/checkout-session`
- 确认 `checkout-session` 返回中包含：
  - `paypalOrderId`
  - `checkoutUrl`
  - `message = "PayPal checkout is ready."`
- 确认浏览器随后跳转到 PayPal Hosted Checkout 页面
- 完成支付后，确认页面回跳到 `https://www.aigeamy.com/console?...`
- 回跳后确认前端自动调用 capture，并最终进入 `/console?order=<id>`

## 访客行为追踪

### 目标

- 追踪每个访问设备从进入站点到离开站点的完整匿名旅程
- 为转化率分析提供可回放的路径数据，而不仅是单点 PV
- 为客户流失原因分析提供页面、内容节点、关键按钮、支付阶段和报错阶段的证据
- 追踪实现必须支持生产环境、批量上报、失败重试、管理员查询和隐私约束

### 边界与隐私

- 使用第一方匿名 `visitorId` 标识浏览器，不记录密码、通信 Token、PayPal token、guest_token 等敏感值
- URL 写入分析库前必须移除支付回跳参数与 guest token，只允许保留 `utm_*` 与 `ref`
- 点击行为只记录安全的按钮语义标识、目标路径和所在内容区块，不记录输入框原始内容
- 事件元数据必须做长度限制和字段白名单，避免把页面中的动态敏感信息原样写入数据库

### 事件模型

- `session_started`：开始一个新的匿名浏览会话
- `page_view`：每次路由进入时记录
- `content_view`：长页关键区块进入可视区时记录
- `scroll_depth`：到达 25 / 50 / 75 / 100 百分比时记录
- `ui_click`：按钮、链接、角色按钮点击时记录
- `launch_clicked` / `plan_selected` / `launch_order_created`
- `checkout_started` / `checkout_redirected` / `checkout_canceled`
- `payment_completed` / `payment_capture_failed`
- `auth_modal_opened` / `auth_logged_in` / `auth_login_failed`
- `client_error` / `client_promise_rejection`

### 前端追踪策略

- 前端维护持久化 `visitorId` 与 30 分钟失活窗口的 `sessionId`
- 事件先进入本地队列，再按批次发送到 `/api/analytics/events`
- 页面隐藏、刷新、离开页面时优先使用 `sendBeacon` 补发未送达事件
- 长内容页面使用 `IntersectionObserver` 对关键区块打点：
  - `hero`
  - `launch-builder`
  - `features`
  - `solutions`
  - `compare`
  - `pricing`
  - `faq`
  - `plans-page`
  - `console-page`
- 所有关键业务动作必须额外发送带业务语义的事件，不能只依赖通用按钮点击

### 后端采集策略

- 后端提供 `POST /api/analytics/events` 批量写入匿名事件
- 单批事件数限制为 50，避免请求过大
- 后端按 `visitorId + sessionId` 聚合出 `analytics_sessions`
- 后端同时保存原始 `analytics_events` 以便查看完整旅程
- 后台管理员接口提供：
  - 漏斗摘要
  - 最近会话列表
  - 指定会话的完整事件时间线

### 管理后台展示

- 管理员在控制台中可见 `Visitor Analytics`
- 概览卡片至少展示：
  - Visitors
  - Sessions
  - Launch clicks
  - Checkout starts
  - Payment completions
  - Tracked content views
- 后台同时展示：
  - 转化漏斗
  - 主要流失阶段
  - Top referrers
  - 最近访客会话
  - 单个会话的详细事件时间线

### 生产级要求

- 采集失败时前端队列不能直接丢失
- 采集接口必须有速率限制
- 数据库存储要支持时间窗口查询、漏斗统计和单会话回放
- 运营分析必须只依赖匿名数据，不把敏感业务凭证写入分析系统

## 前端状态控制

### 路由与加载规则

- `/`：负责采集 Launch 草稿
- `/plans`：要求存在 Launch 草稿，否则不应完成购买
- `/checkout?order=<id>`：支付提供方回跳地址，前端优先消费支付回跳参数，再回收到 `/console`
- `/console?order=<id>`：负责聚合订单、实例、账号绑定、部署跟踪

### 回跳处理规则

- 当 `/checkout` 或 `/console` URL 中包含 `checkout_id` 时，前端必须优先执行 Creem 支付确认，而不是先加载旧订单数据
- 当 `/checkout` 或 `/console` URL 中包含 `token` 与 `PayerID` 时，前端必须优先执行 PayPal capture，而不是先加载旧订单数据
- 支付确认成功后，再刷新控制台数据并跳转到干净地址
- 这样可以避免“旧的 pending 结果晚返回，覆盖新的 paid 状态”的竞态问题

### 控制台操作按钮规则

- `Pay now` 只在 `paymentStatus = pending` 时出现
- `Track deployment` 在已支付但尚未打开实例时出现
- `Open console` 只在实例存在且具备 `consoleUrl` 时出现
- `Bind to my account` 只在满足以下条件时出现：
  - 当前已登录
  - 当前订单仍处于 `Unbound`

## 体验原则

- 最高目标与唯一目标：所有功能设计与界面设计都必须服务于提升转化率
- 整个网站全部使用英文，不使用中文作为正式界面文案
- 部署不设账号门槛：注册和登录不能阻塞 Launch → 套餐 → 支付 → 控制台主流程
- 转化优先：先完成配置，再进入价格与支付
- 引导式输入：Token 使用弹窗采集，不在首页直接暴露
- 商业化步骤清晰：套餐选择使用独立页面承接
- 支付跳转稳定优先：优先使用 Hosted Checkout，而不是依赖站内 PayPal SDK 弹窗
- 支付后快速承接：付款完成直接进入控制台
- 状态统一收口：控制台是部署状态唯一查询入口

## 当前默认规则

- 默认模型：GPT-5.4
- 默认计费周期：Yearly
- 年付价格倍率：按月价年化后的 `0.65`
- 付款完成后的默认跳转页：Console
- 控制台绑定状态语义：`Bound` = 已绑定登录账号，`Unbound` = 尚未绑定登录账号
