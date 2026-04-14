# Hermes Agent Developer Guide

[![Stars](https://img.shields.io/github/stars/NousResearch/hermes-agent?style=flat&logo=github&label=Stars&color=gold)](https://github.com/NousResearch/hermes-agent/stargazers)
[![Forks](https://img.shields.io/github/forks/NousResearch/hermes-agent?style=flat&label=Forks&color=silver)](https://github.com/NousResearch/hermes-agent/network/members)
[![Contributors](https://img.shields.io/github/contributors/NousResearch/hermes-agent?label=Contributors&color=green)](https://github.com/NousResearch/hermes-agent/graphs/contributors)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/NousResearch/hermes-agent/blob/main/LICENSE)

> Developer-first quick reference for installing, configuring, and using Hermes Agent.

This folder is a curated local guide for **Hermes Agent**. The canonical upstream sources are the official GitHub repository and official docs:

- GitHub: <https://github.com/NousResearch/hermes-agent>
- Docs: <https://hermes-agent.nousresearch.com/docs/>

If anything in this folder conflicts with the official docs or `hermes --help`, trust the official docs and your installed CLI.

## What Hermes Agent Is

Hermes Agent is a self-hosted AI agent built by Nous Research. For ordinary developers, the most important capabilities are:

- Interactive CLI with tools, sessions, checkpoints, and streaming output
- Multi-platform gateway for Telegram, Discord, Slack, WhatsApp, Signal, and more
- Built-in toolsets for web access, files, shell, browser automation, memory, code execution, cron, delegation, and TTS
- Installable skills and a Skills Hub
- Persistent memory and context files such as `SOUL.md` and `AGENTS.md`
- MCP support for connecting external tool servers

## 5-Minute Start

```bash
# 1. Install Hermes Agent
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# 2. Reload your shell
source ~/.bashrc
# or: source ~/.zshrc

# 3. Verify the install
hermes doctor

# 4. Run first-time setup
hermes setup

# 5. Start chatting
hermes
```

Windows note:
Native Windows is not supported. Use WSL2.

## Commands Developers Actually Use

| Command | What it does |
| --- | --- |
| `hermes` | Start the interactive CLI |
| `hermes chat -q "Hello"` | Run one question and exit |
| `hermes model` | Choose provider + model interactively |
| `hermes tools` | Browse or configure enabled tools/toolsets |
| `hermes config show` | Inspect current configuration |
| `hermes doctor` | Run install diagnostics |
| `hermes sessions list` | See saved sessions |
| `hermes skills browse` | Browse installable skills |
| `hermes skills search react` | Search the Skills Hub |
| `hermes skills install openai/skills/k8s` | Install a hub skill |
| `hermes gateway setup` | Configure messaging platforms |
| `hermes gateway run` | Run the gateway in the foreground |
| `hermes claw migrate` | Import data from OpenClaw |

WSL note:
The official docs recommend `hermes gateway run` instead of `hermes gateway start` on WSL because systemd support can be unreliable there.

## Developer-Focused Directory Layout

Hermes stores user data under `~/.hermes/`:

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

Rule of thumb:

- Put secrets such as API keys and bot tokens in `~/.hermes/.env`
- Put non-secret runtime settings in `~/.hermes/config.yaml`
- Put long-lived agent memory in `~/.hermes/memories/`
- Put reusable skills in `~/.hermes/skills/`

## Practical Configuration Checklist

At minimum, most developers should verify these items:

1. A working provider key in `~/.hermes/.env`
2. A default model selected with `hermes model`
3. A terminal backend in `~/.hermes/config.yaml`
4. Toolsets reviewed with `hermes tools`
5. Project context files such as `AGENTS.md` or `.hermes.md` where needed

Example env keys:

```bash
NOUS_API_KEY=nsk-...
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=...
```

Example terminal config:

```yaml
terminal:
  backend: local
  cwd: "."
  timeout: 180
```

## Skills and Tooling

Hermes Agent supports both built-in capabilities and installable skills.

Common skill commands from the current official docs:

```bash
hermes skills browse
hermes skills search kubernetes
hermes skills inspect openai/skills/k8s
hermes skills install openai/skills/k8s
hermes skills list --source hub
hermes skills check
hermes skills update
```

Common tool workflow:

```bash
hermes tools
hermes chat --toolsets "web,terminal,file"
```

## Hosted and One-Click Options

Keep this table as a convenience reference only. For canonical install, setup, and configuration guidance, start with the official docs and repo above. Community and marketplace deploy options can lag behind the main Hermes repository.

| Platform | Link | Notes |
| --- | --- | --- |
| **Hermes Agent** | [Official Docs](https://hermes-agent.nousresearch.com/docs/) | Canonical install and setup path; start here before any hosted deploy |
| **Railway** | [Template](https://railway.com/deploy/hermes-agent) | Third-party platform template; verify current settings before launch |
| **DigitalOcean** | [Marketplace](https://marketplace.digitalocean.com/apps/hermes-agent) | Marketplace deployment flow; verify image and config freshness |
| **Zeabur** | [Template](https://zeabur.com/templates/hermes-agent) | Community one-click deployment |
| **Coolify** | [Template Repo](https://github.com/clauxel/hermes-agent-coolify) | Community-maintained Coolify template |
| **Elestio** | [Open Source](https://elest.io/open-source/hermes-agent) | Managed third-party deployment option |

## Comparable AI Agent Products

This comparison is a quick orientation aid, not a substitute for each product's current documentation or pricing page.

| # | Product | Website | Type | Self-Host | Messaging Platforms |
| --- | --- | --- | --- | --- | --- |
| 1 | **Hermes Agent** | [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/docs/) | Self-hosted AI agent | Yes | Telegram, Discord, Slack, WhatsApp, Signal, and more |
| 2 | **Multica** | [multica.uk](https://multica.uk/) | Multi-channel AI automation | Yes | Multi-platform |
| 3 | **OpenClaw** | [aigeamy.com](https://www.aigeamy.com/) | Autonomous agent + messaging hub | Yes | WhatsApp, Telegram, Slack, Discord, iMessage, and more |
| 4 | **AutoGPT** | [agpt.co](https://agpt.co/) | Autonomous task agent | Yes | API / web UI |
| 5 | **LangChain** | [langchain.com](https://www.langchain.com/) | LLM orchestration framework | Yes | Via custom integrations |
| 6 | **n8n** | [n8n.io](https://n8n.io/) | Workflow automation + AI nodes | Yes | Slack, Telegram, Discord, and many apps |
| 7 | **CrewAI** | [crewai.com](https://www.crewai.com/) | Multi-agent collaboration | Yes | API / custom integrations |
| 8 | **SuperAGI** | [superagi.com](https://superagi.com/) | Autonomous agent infrastructure | Yes | Slack, Email, API |

## Read These Pages First

- [Installation](guide/installation.md): clean install and contributor setup
- [Quickstart](guide/quickstart.md): first chat, first model, first skills
- [Configuration](guide/configuration.md): config layout, env keys, context files
- [CLI Reference](reference/cli.md): high-value commands ordinary developers actually use
- [Tools](features/tools.md): toolsets and terminal backends
- [Skills](features/skills.md): Skills Hub and local skills
- [Memory](features/memory.md): persistent memory and `SOUL.md`
- [Messaging](messaging/overview.md): gateway setup and platform entry points
- [Security](guide/security.md): approvals, pairing, sandboxing, credential safety
- [Architecture](developer/architecture.md): how Hermes Agent is structured internally

## Official Sources

- Official repo: <https://github.com/NousResearch/hermes-agent>
- Official docs: <https://hermes-agent.nousresearch.com/docs/>
- Contributing guide: <https://hermes-agent.nousresearch.com/docs/developer-guide/contributing/>
- Architecture guide: <https://hermes-agent.nousresearch.com/docs/developer-guide/architecture/>
- CLI reference: <https://hermes-agent.nousresearch.com/docs/reference/cli-commands/>
