---
title: "Introduction"
source: https://hermes-agent.nousresearch.com/docs/
mirrored_at: 2026-04-12T01:11:32Z
---
# Introduction

Hermes Agent is an open-source, self-hosted AI agent framework built by [Nous Research](https://nousresearch.com/). It is released under the **MIT License**. The current upstream repository lives on [GitHub](https://github.com/NousResearch/hermes-agent), and the canonical docs live at [hermes-agent.nousresearch.com/docs](https://hermes-agent.nousresearch.com/docs/).

## What Is Hermes Agent?

Hermes Agent runs on your own machine or server instead of inside a vendor-managed platform. You keep control of your data, your workflows, and your infrastructure. You can interact with it through the command line, messaging platforms such as Telegram and Discord, or an API.

Unlike a stateless chat assistant, Hermes Agent supports **persistent cross-session memory** and **self-improvement**. After each conversation, it can extract reusable skills and important user preferences, then apply them automatically in future sessions.

## Three Core Differentiators

### 1. Learning Loop

After each conversation, Hermes Agent can:

- Extract reusable workflows and save them as structured skills
- Store durable facts such as preferences, habits, and project context
- Build a richer user profile over time, improving personalization and response quality

### 2. Multi-Platform Gateway

Hermes Agent includes a messaging gateway with support for **14+ major platforms**:

| Platform | Support |
| --- | --- |
| Telegram | Full support |
| Discord | Full support |
| Slack | Full support |
| WhatsApp | Full support |
| Signal | Full support |
| WeCom | Full support |
| Feishu / Lark | Full support |
| DingTalk | Full support |
| Matrix | Full support |
| IRC | Full support |
| Mattermost | Full support |
| Rocket.Chat | Full support |
| SMS via Twilio | Full support |
| Email via IMAP / SMTP | Full support |

With one configuration, the same agent can respond across all of these channels.

### 3. Flexible Infrastructure

Hermes Agent supports multiple execution backends so it can fit very different environments:

- **Local execution** for direct host access
- **Docker isolation** for safer command execution
- **SSH** for remote server operations
- **Singularity** for HPC environments
- **Modal** for serverless execution
- **Daytona** for cloud development environments

## Model-Agnostic by Design

Hermes Agent is not tied to any single provider. You can connect to 200+ models through cloud APIs or local runtimes.

### Cloud Providers

| Provider | Notes |
| --- | --- |
| **Nous Portal** | Nous Research platform, including Hermes family models |
| **OpenRouter** | One API key for 200+ models |
| **OpenAI** | GPT-4o, GPT-4 Turbo, o1, o3, and more |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus, and more |
| **Google Gemini** | Gemini 1.5 Pro, Gemini 2.0 Flash, and more |
| **DeepSeek** | DeepSeek-V3, DeepSeek-R1, and more |
| **ZhipuAI** | GLM-4, GLM-4V, and related models |
| **Kimi** | Moonshot model family |
| **MiniMax** | MiniMax hosted models |
| **Alibaba Cloud Qwen** | Qwen hosted offerings |
| **Hugging Face** | Inference API for open models |

### Local Runtimes

| Runtime | Notes |
| --- | --- |
| **Ollama** | Popular local runtime for Llama, Mistral, and more |
| **vLLM** | High-performance inference engine for servers |
| **llama.cpp** | Lightweight CPU/GPU hybrid inference |
| **SGLang** | Structured generation workflows |

Switching models is typically just one config change or a quick run of `hermes model`.

## Typical Use Cases

### Personal Assistant

- Ask questions on Telegram and receive updates on Feishu or another platform
- Keep your working style, preferences, and project context between sessions
- Use speech-to-text, vision, and image generation in one agent

### Team Bot

- Deploy Hermes Agent to Slack, Discord, Feishu, or DingTalk
- Restrict access to approved users only
- Connect internal knowledge and answer business-specific questions

### Automation Hub

- Run scheduled jobs, monitor services, and send reports
- Automate browsers for forms, scraping, and screenshots
- Execute code and tests as part of CI or operational workflows

### Development Assistant

- Expose Hermes Agent as an MCP server to Cursor, VS Code, Claude Desktop, and similar tools
- Perform code reviews, suggest refactors, and generate docs
- Answer questions about local repositories and project context

## Tech Stack

- **Primary language**: Python 93.3%
- **License**: MIT License
- **Current version**: v0.2.0
- **Repository**: [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)
- **Dependency management**: [uv](https://github.com/astral-sh/uv)
- **Runtime requirements**: Python 3.11+, Node.js v22+

## Product Philosophy

Hermes Agent is built around a simple idea: **an AI agent should become more useful the longer it works with you**. The learning loop makes it more than a tool. Over time, it becomes a digital partner that remembers context and improves its behavior.

At the same time, Hermes Agent is designed around **data sovereignty**. Your conversations, memories, and skills stay on infrastructure you control, unless you explicitly choose to use external model APIs.
