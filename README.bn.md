# Hermes Agent ডেভেলপার গাইড

**ভাষা:** [English](README.md) | [简体中文](README.zh-CN.md) | [हिन्दी](README.hi.md) | [Español](README.es.md) | [العربية](README.ar.md) | [Français](README.fr.md) | **বাংলা** | [Português](README.pt.md) | [Русский](README.ru.md) | [Bahasa Indonesia](README.id.md)

[![Stars](https://img.shields.io/github/stars/NousResearch/hermes-agent?style=flat&logo=github&label=Stars&color=gold)](https://github.com/NousResearch/hermes-agent/stargazers)
[![Forks](https://img.shields.io/github/forks/NousResearch/hermes-agent?style=flat&label=Forks&color=silver)](https://github.com/NousResearch/hermes-agent/network/members)
[![Contributors](https://img.shields.io/github/contributors/NousResearch/hermes-agent?label=Contributors&color=green)](https://github.com/NousResearch/hermes-agent/graphs/contributors)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/NousResearch/hermes-agent/blob/main/LICENSE)

> Hermes Agent ইনস্টল, কনফিগার এবং ব্যবহার করার জন্য ডেভেলপার-কেন্দ্রিক দ্রুত রেফারেন্স।

এই ফোল্ডারটি **Hermes Agent**-এর জন্য একটি কিউরেটেড লোকাল গাইড। ক্যানোনিকাল উৎস হলো অফিসিয়াল GitHub রিপোজিটরি এবং অফিসিয়াল ডকস:

- GitHub: <https://github.com/NousResearch/hermes-agent>
- Docs: <https://hermes-agent.nousresearch.com/docs/>

যদি এই ফোল্ডারের কোনো তথ্য অফিসিয়াল ডকস বা `hermes --help`-এর সাথে না মিলে, তাহলে অফিসিয়াল ডকস এবং আপনার ইনস্টল করা CLI-কে সঠিক ধরে নিন।

## Hermes Agent কী

Hermes Agent হলো Nous Research-এর তৈরি একটি self-hosted AI agent। সাধারণ ডেভেলপারদের জন্য এর সবচেয়ে গুরুত্বপূর্ণ ক্ষমতাগুলো হলো:

- tools, sessions, checkpoints এবং streaming output-সহ interactive CLI
- Telegram, Discord, Slack, WhatsApp, Signal ইত্যাদির জন্য multi-platform gateway
- web access, files, shell, browser automation, memory, code execution, cron, delegation এবং TTS-এর built-in toolsets
- installable skills এবং Skills Hub
- `SOUL.md` ও `AGENTS.md`-এর মতো persistent memory ও context files
- external tool server যুক্ত করার জন্য MCP support

## ৫ মিনিটে শুরু

```bash
# 1. Hermes Agent ইনস্টল করুন
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# 2. আপনার shell রিলোড করুন
source ~/.bashrc
# অথবা: source ~/.zshrc

# 3. ইনস্টল যাচাই করুন
hermes doctor

# 4. প্রথম সেটআপ চালান
hermes setup

# 5. চ্যাট শুরু করুন
hermes
```

Windows নোট:  
Native Windows সমর্থিত নয়। WSL2 ব্যবহার করুন।

## ডেভেলপাররা যেসব কমান্ড বেশি ব্যবহার করেন

| কমান্ড | কাজ |
| --- | --- |
| `hermes` | interactive CLI চালু করে |
| `hermes chat -q "Hello"` | একবার প্রশ্ন চালিয়ে বেরিয়ে যায় |
| `hermes model` | provider এবং model interactively বেছে নিতে দেয় |
| `hermes tools` | চালু tools/toolsets দেখা বা কনফিগার করা |
| `hermes config show` | বর্তমান config দেখা |
| `hermes doctor` | install diagnostics চালানো |
| `hermes sessions list` | সংরক্ষিত session দেখা |
| `hermes skills browse` | installable skills ব্রাউজ করা |
| `hermes skills search react` | Skills Hub-এ খোঁজা |
| `hermes skills install openai/skills/k8s` | hub skill ইনস্টল করা |
| `hermes gateway setup` | messaging platform কনফিগার করা |
| `hermes gateway run` | gateway foreground-এ চালানো |
| `hermes claw migrate` | OpenClaw থেকে data ইমপোর্ট করা |

WSL নোট:  
অফিসিয়াল ডকস WSL-এ `hermes gateway start`-এর বদলে `hermes gateway run` ব্যবহার করতে বলে, কারণ systemd support অনির্ভরযোগ্য হতে পারে।

## ডেভেলপার-কেন্দ্রিক ডিরেক্টরি লেআউট

Hermes ব্যবহারকারীর ডেটা `~/.hermes/`-এর মধ্যে রাখে:

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

মনে রাখুন:

- API key ও bot token-এর মতো secret `~/.hermes/.env`-এ রাখুন
- non-secret runtime settings `~/.hermes/config.yaml`-এ রাখুন
- দীর্ঘমেয়াদি memory `~/.hermes/memories/`-এ রাখুন
- reusable skills `~/.hermes/skills/`-এ রাখুন

## ব্যবহারিক কনফিগারেশন চেকলিস্ট

কমপক্ষে নিচেরগুলো নিশ্চিত করুন:

1. `~/.hermes/.env`-এ একটি কাজের provider key
2. `hermes model` দিয়ে একটি default model নির্বাচন করা
3. `~/.hermes/config.yaml`-এ terminal backend সেট করা
4. `hermes tools` দিয়ে toolsets রিভিউ করা
5. `AGENTS.md` বা `.hermes.md`-এর মতো project context files রাখা

উদাহরণ env keys:

```bash
NOUS_API_KEY=nsk-...
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=...
```

উদাহরণ terminal config:

```yaml
terminal:
  backend: local
  cwd: "."
  timeout: 180
```

## Skills এবং tooling

Hermes Agent built-in capability এবং installable skill - দুটোই সমর্থন করে।

বর্তমান অফিসিয়াল ডকসে সাধারণ skill command:

```bash
hermes skills browse
hermes skills search kubernetes
hermes skills inspect openai/skills/k8s
hermes skills install openai/skills/k8s
hermes skills list --source hub
hermes skills check
hermes skills update
```

সাধারণ tool workflow:

```bash
hermes tools
hermes chat --toolsets "web,terminal,file"
```

## Hosted এবং one-click অপশন

এই টেবিলটিকে শুধু convenience reference হিসেবে দেখুন। canonical install, setup এবং configuration-এর জন্য উপরের official docs ও repo-কে প্রাধান্য দিন। community template এবং marketplace option মূল repo-র থেকে পিছিয়ে থাকতে পারে।

| প্ল্যাটফর্ম | লিংক | নোট |
| --- | --- | --- |
| **Hermes Agent** | [Official Docs](https://hermes-agent.nousresearch.com/docs/) | canonical install ও setup path; hosted deploy-এর আগে এখান থেকেই শুরু করুন |
| **Railway** | [Template](https://railway.com/deploy/hermes-agent) | third-party platform template; launch-এর আগে current settings যাচাই করুন |
| **DigitalOcean** | [Marketplace](https://marketplace.digitalocean.com/apps/hermes-agent) | marketplace deployment flow; image ও config কতটা আপডেটেড তা যাচাই করুন |
| **Zeabur** | [Template](https://zeabur.com/templates/hermes-agent) | community one-click deployment |
| **Coolify** | [Template Repo](https://github.com/clauxel/hermes-agent-coolify) | community-maintained Coolify template |
| **Elestio** | [Open Source](https://elest.io/open-source/hermes-agent) | managed third-party deployment option |

## তুলনাযোগ্য AI Agent পণ্য

এই তুলনামূলক টেবিলটি দ্রুত বোঝার জন্য। এটি কোনো পণ্যের বর্তমান ডকুমেন্টেশন বা pricing page-এর বিকল্প নয়।

| # | পণ্য | ওয়েবসাইট | ধরন | Self-Host | Messaging Platforms |
| --- | --- | --- | --- | --- | --- |
| 1 | **Hermes Agent** | [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/docs/) | self-hosted AI agent | হ্যাঁ | Telegram, Discord, Slack, WhatsApp, Signal এবং আরও |
| 2 | **Multica** | [multica.uk](https://multica.uk/) | multi-channel AI automation | হ্যাঁ | Multi-platform |
| 3 | **OpenClaw** | [aigeamy.com](https://www.aigeamy.com/) | autonomous agent + messaging hub | হ্যাঁ | WhatsApp, Telegram, Slack, Discord, iMessage এবং আরও |
| 4 | **AutoGPT** | [agpt.co](https://agpt.co/) | autonomous task agent | হ্যাঁ | API / web UI |
| 5 | **LangChain** | [langchain.com](https://www.langchain.com/) | LLM orchestration framework | হ্যাঁ | custom integration-এর মাধ্যমে |
| 6 | **n8n** | [n8n.io](https://n8n.io/) | workflow automation + AI nodes | হ্যাঁ | Slack, Telegram, Discord এবং আরও অনেক app |
| 7 | **CrewAI** | [crewai.com](https://www.crewai.com/) | multi-agent collaboration | হ্যাঁ | API / custom integrations |
| 8 | **SuperAGI** | [superagi.com](https://superagi.com/) | autonomous agent infrastructure | হ্যাঁ | Slack, Email, API |

## আগে এই পেজগুলো পড়ুন

- [Installation](guide/installation.md): clean install এবং contributor setup
- [Quickstart](guide/quickstart.md): প্রথম chat, প্রথম model, প্রথম skill
- [Configuration](guide/configuration.md): config layout, env keys, context files
- [CLI Reference](reference/cli.md): সাধারণ ডেভেলপারদের জন্য high-value commands
- [Tools](features/tools.md): toolsets এবং terminal backends
- [Skills](features/skills.md): Skills Hub এবং local skills
- [Memory](features/memory.md): persistent memory এবং `SOUL.md`
- [Messaging](messaging/overview.md): gateway setup এবং platform entry points
- [Security](guide/security.md): approvals, pairing, sandboxing এবং credential safety
- [Architecture](developer/architecture.md): Hermes Agent-এর internal structure

## অফিসিয়াল উৎস

- Official repo: <https://github.com/NousResearch/hermes-agent>
- Official docs: <https://hermes-agent.nousresearch.com/docs/>
- Contributing guide: <https://hermes-agent.nousresearch.com/docs/developer-guide/contributing/>
- Architecture guide: <https://hermes-agent.nousresearch.com/docs/developer-guide/architecture/>
- CLI reference: <https://hermes-agent.nousresearch.com/docs/reference/cli-commands/>
