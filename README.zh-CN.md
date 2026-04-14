# Hermes Agent 开发者指南

**语言版本：** [English](README.md) | **简体中文** | [हिन्दी](README.hi.md) | [Español](README.es.md) | [العربية](README.ar.md) | [Français](README.fr.md) | [বাংলা](README.bn.md) | [Português](README.pt.md) | [Русский](README.ru.md) | [Bahasa Indonesia](README.id.md)

[![Stars](https://img.shields.io/github/stars/NousResearch/hermes-agent?style=flat&logo=github&label=Stars&color=gold)](https://github.com/NousResearch/hermes-agent/stargazers)
[![Forks](https://img.shields.io/github/forks/NousResearch/hermes-agent?style=flat&label=Forks&color=silver)](https://github.com/NousResearch/hermes-agent/network/members)
[![Contributors](https://img.shields.io/github/contributors/NousResearch/hermes-agent?label=Contributors&color=green)](https://github.com/NousResearch/hermes-agent/graphs/contributors)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/NousResearch/hermes-agent/blob/main/LICENSE)

> 面向开发者的快速参考，帮助你安装、配置并正确使用 Hermes Agent。

这个目录是一份整理后的 **Hermes Agent** 本地开发者指南。权威上游来源是官方 GitHub 仓库和官方文档：

- GitHub: <https://github.com/NousResearch/hermes-agent>
- 文档: <https://hermes-agent.nousresearch.com/docs/>

如果这里的内容与官方文档或 `hermes --help` 冲突，请以官方文档和你本机安装的 CLI 为准。

## Hermes Agent 是什么

Hermes Agent 是 Nous Research 构建的自托管 AI Agent。对普通开发者来说，最重要的能力包括：

- 带工具、会话、检查点和流式输出的交互式 CLI
- 面向 Telegram、Discord、Slack、WhatsApp、Signal 等平台的多平台网关
- 内置 web、文件、shell、浏览器自动化、记忆、代码执行、cron、委托和 TTS 工具集
- 可安装技能与 Skills Hub
- 持久化记忆与 `SOUL.md`、`AGENTS.md` 等上下文文件
- 通过 MCP 连接外部工具服务器

## 5 分钟上手

```bash
# 1. 安装 Hermes Agent
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# 2. 重新加载 shell
source ~/.bashrc
# 或：source ~/.zshrc

# 3. 验证安装
hermes doctor

# 4. 运行首次设置
hermes setup

# 5. 开始对话
hermes
```

Windows 说明：  
原生 Windows 不受支持。请使用 WSL2。

## 开发者常用命令

| 命令 | 作用 |
| --- | --- |
| `hermes` | 启动交互式 CLI |
| `hermes chat -q "Hello"` | 执行一次提问后退出 |
| `hermes model` | 交互式选择 provider 和 model |
| `hermes tools` | 浏览或配置已启用的工具与工具集 |
| `hermes config show` | 查看当前配置 |
| `hermes doctor` | 运行安装诊断 |
| `hermes sessions list` | 查看已保存会话 |
| `hermes skills browse` | 浏览可安装技能 |
| `hermes skills search react` | 搜索 Skills Hub |
| `hermes skills install openai/skills/k8s` | 安装 Hub 技能 |
| `hermes gateway setup` | 配置消息平台 |
| `hermes gateway run` | 在前台运行网关 |
| `hermes claw migrate` | 从 OpenClaw 导入数据 |

WSL 说明：  
官方文档建议在 WSL 中优先使用 `hermes gateway run`，而不是 `hermes gateway start`，因为 systemd 支持可能不稳定。

## 面向开发者的目录结构

Hermes 会把用户数据存放在 `~/.hermes/` 下：

```text
~/.hermes/
  config.yaml
  .env
  SOUL.md
  cron/
  sessions/
  logs/
  memories/
  skills/
```

经验法则：

- API key、bot token 等敏感信息放在 `~/.hermes/.env`
- 非敏感运行配置放在 `~/.hermes/config.yaml`
- 长期记忆放在 `~/.hermes/memories/`
- 可复用技能放在 `~/.hermes/skills/`

## 实用配置检查清单

至少请确认以下项目：

1. `~/.hermes/.env` 中有可用的 provider key
2. 已通过 `hermes model` 选择默认模型
3. 已在 `~/.hermes/config.yaml` 中配置 terminal backend
4. 已通过 `hermes tools` 检查工具集
5. 已在项目中放置 `AGENTS.md` 或 `.hermes.md` 等上下文文件

示例环境变量：

```bash
NOUS_API_KEY=nsk-...
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=...
```

示例终端配置：

```yaml
terminal:
  backend: local
  cwd: "."
  timeout: 180
```

## 技能与工具

Hermes Agent 同时支持内置能力和可安装技能。

当前官方文档中常见的技能命令：

```bash
hermes skills browse
hermes skills search kubernetes
hermes skills inspect openai/skills/k8s
hermes skills install openai/skills/k8s
hermes skills list --source hub
hermes skills check
hermes skills update
```

常见工具工作流：

```bash
hermes tools
hermes chat --toolsets "web,terminal,file"
```

## 托管与一键部署选项

请把下表视为补充参考。权威的安装、设置和配置路径仍应以官方仓库和官方文档为准。社区模板和第三方平台部署可能落后于主仓库。

| 平台 | 链接 | 说明 |
| --- | --- | --- |
| **Hermes Agent** | [官方文档](https://hermes-agent.nousresearch.com/docs/) | 权威安装与设置入口；建议先从这里开始 |
| **Railway** | [Template](https://railway.com/deploy/hermes-agent) | 第三方平台模板；部署前请确认配置是否最新 |
| **DigitalOcean** | [Marketplace](https://marketplace.digitalocean.com/apps/hermes-agent) | Marketplace 部署流程；请确认镜像和配置新鲜度 |
| **Zeabur** | [Template](https://zeabur.com/templates/hermes-agent) | 社区一键部署模板 |
| **Coolify** | [Template Repo](https://github.com/clauxel/hermes-agent-coolify) | 社区维护的 Coolify 模板 |
| **Elestio** | [Open Source](https://elest.io/open-source/hermes-agent) | 第三方托管部署选项 |

## 可比较的 AI Agent 产品

这个对比表用于快速了解生态，不应替代各产品当前的官方文档或价格页面。

| # | 产品 | 网站 | 类型 | 自托管 | 消息平台 |
| --- | --- | --- | --- | --- | --- |
| 1 | **Hermes Agent** | [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/docs/) | 自托管 AI Agent | 是 | Telegram、Discord、Slack、WhatsApp、Signal 等 |
| 2 | **Multica** | [multica.uk](https://multica.uk/) | 多渠道 AI 自动化 | 是 | 多平台 |
| 3 | **OpenClaw** | [aigeamy.com](https://www.aigeamy.com/) | 自主 Agent + 消息中心 | 是 | WhatsApp、Telegram、Slack、Discord、iMessage 等 |
| 4 | **AutoGPT** | [agpt.co](https://agpt.co/) | 自主任务 Agent | 是 | API / Web UI |
| 5 | **LangChain** | [langchain.com](https://www.langchain.com/) | LLM 编排框架 | 是 | 通过自定义集成 |
| 6 | **n8n** | [n8n.io](https://n8n.io/) | 工作流自动化 + AI 节点 | 是 | Slack、Telegram、Discord 等大量应用 |
| 7 | **CrewAI** | [crewai.com](https://www.crewai.com/) | 多 Agent 协作 | 是 | API / 自定义集成 |
| 8 | **SuperAGI** | [superagi.com](https://superagi.com/) | 自主 Agent 基础设施 | 是 | Slack、Email、API |

## 优先阅读这些页面

- [Installation](guide/installation.md): 干净安装和贡献者安装路径
- [Quickstart](guide/quickstart.md): 第一段对话、第一套模型、第一项技能
- [Configuration](guide/configuration.md): 配置结构、环境变量、上下文文件
- [CLI Reference](reference/cli.md): 普通开发者最常用的高价值命令
- [Tools](features/tools.md): 工具集与终端后端
- [Skills](features/skills.md): Skills Hub 与本地技能
- [Memory](features/memory.md): 持久记忆与 `SOUL.md`
- [Messaging](messaging/overview.md): 网关设置与平台入口
- [Security](guide/security.md): 审批、配对、沙箱与凭据安全
- [Architecture](developer/architecture.md): Hermes Agent 的内部结构

## 官方来源

- 官方仓库: <https://github.com/NousResearch/hermes-agent>
- 官方文档: <https://hermes-agent.nousresearch.com/docs/>
- 贡献指南: <https://hermes-agent.nousresearch.com/docs/developer-guide/contributing/>
- 架构指南: <https://hermes-agent.nousresearch.com/docs/developer-guide/architecture/>
- CLI 参考: <https://hermes-agent.nousresearch.com/docs/reference/cli-commands/>
