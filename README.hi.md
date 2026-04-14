# Hermes Agent डेवलपर गाइड

**भाषाएँ:** [English](README.md) | [简体中文](README.zh-CN.md) | **हिन्दी** | [Español](README.es.md) | [العربية](README.ar.md) | [Français](README.fr.md) | [বাংলা](README.bn.md) | [Português](README.pt.md) | [Русский](README.ru.md) | [Bahasa Indonesia](README.id.md)

[![Stars](https://img.shields.io/github/stars/NousResearch/hermes-agent?style=flat&logo=github&label=Stars&color=gold)](https://github.com/NousResearch/hermes-agent/stargazers)
[![Forks](https://img.shields.io/github/forks/NousResearch/hermes-agent?style=flat&label=Forks&color=silver)](https://github.com/NousResearch/hermes-agent/network/members)
[![Contributors](https://img.shields.io/github/contributors/NousResearch/hermes-agent?label=Contributors&color=green)](https://github.com/NousResearch/hermes-agent/graphs/contributors)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/NousResearch/hermes-agent/blob/main/LICENSE)

> Hermes Agent को इंस्टॉल, कॉन्फ़िगर और उपयोग करने के लिए डेवलपर-फर्स्ट त्वरित संदर्भ।

यह फ़ोल्डर **Hermes Agent** के लिए एक व्यवस्थित स्थानीय गाइड है। आधिकारिक स्रोत GitHub रिपॉज़िटरी और आधिकारिक डॉक्स हैं:

- GitHub: <https://github.com/NousResearch/hermes-agent>
- Docs: <https://hermes-agent.nousresearch.com/docs/>

यदि इस फ़ोल्डर की कोई बात आधिकारिक डॉक्स या `hermes --help` से टकराती है, तो आधिकारिक डॉक्स और आपके इंस्टॉल किए गए CLI को सही मानें।

## Hermes Agent क्या है

Hermes Agent, Nous Research द्वारा बनाया गया एक self-hosted AI agent है। सामान्य डेवलपर्स के लिए इसकी सबसे महत्वपूर्ण क्षमताएँ हैं:

- tools, sessions, checkpoints और streaming output वाला interactive CLI
- Telegram, Discord, Slack, WhatsApp, Signal आदि के लिए multi-platform gateway
- web access, files, shell, browser automation, memory, code execution, cron, delegation और TTS के built-in toolsets
- installable skills और Skills Hub
- `SOUL.md` और `AGENTS.md` जैसी persistent memory और context files
- external tool servers से जुड़ने के लिए MCP support

## 5 मिनट में शुरुआत

```bash
# 1. Hermes Agent इंस्टॉल करें
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# 2. अपना shell फिर से लोड करें
source ~/.bashrc
# या: source ~/.zshrc

# 3. इंस्टॉल जाँचें
hermes doctor

# 4. पहली बार सेटअप चलाएँ
hermes setup

# 5. बातचीत शुरू करें
hermes
```

Windows नोट:  
Native Windows समर्थित नहीं है। WSL2 का उपयोग करें।

## डेवलपर्स द्वारा सबसे अधिक उपयोग किए जाने वाले कमांड

| कमांड | काम |
| --- | --- |
| `hermes` | interactive CLI शुरू करें |
| `hermes chat -q "Hello"` | एक प्रश्न चलाकर बाहर निकलें |
| `hermes model` | provider और model को interactively चुनें |
| `hermes tools` | enabled tools/toolsets देखें या कॉन्फ़िगर करें |
| `hermes config show` | मौजूदा configuration देखें |
| `hermes doctor` | install diagnostics चलाएँ |
| `hermes sessions list` | saved sessions देखें |
| `hermes skills browse` | installable skills ब्राउज़ करें |
| `hermes skills search react` | Skills Hub खोजें |
| `hermes skills install openai/skills/k8s` | hub skill इंस्टॉल करें |
| `hermes gateway setup` | messaging platforms सेट करें |
| `hermes gateway run` | gateway को foreground में चलाएँ |
| `hermes claw migrate` | OpenClaw से data import करें |

WSL नोट:  
आधिकारिक डॉक्स WSL पर `hermes gateway start` की जगह `hermes gateway run` की सिफारिश करते हैं, क्योंकि systemd support वहाँ अविश्वसनीय हो सकता है।

## डेवलपर-केंद्रित डायरेक्टरी लेआउट

Hermes user data को `~/.hermes/` के अंदर रखता है:

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

ध्यान रखें:

- API keys और bot tokens जैसी secrets को `~/.hermes/.env` में रखें
- non-secret runtime settings को `~/.hermes/config.yaml` में रखें
- long-lived memory को `~/.hermes/memories/` में रखें
- reusable skills को `~/.hermes/skills/` में रखें

## व्यावहारिक configuration checklist

कम से कम इन चीज़ों की जाँच करें:

1. `~/.hermes/.env` में काम करने वाली provider key
2. `hermes model` से चुना गया default model
3. `~/.hermes/config.yaml` में terminal backend
4. `hermes tools` से reviewed toolsets
5. project context files जैसे `AGENTS.md` या `.hermes.md`

उदाहरण env keys:

```bash
NOUS_API_KEY=nsk-...
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=...
```

उदाहरण terminal config:

```yaml
terminal:
  backend: local
  cwd: "."
  timeout: 180
```

## Skills और tooling

Hermes Agent built-in capabilities और installable skills दोनों को support करता है।

मौजूदा official docs में आम skill commands:

```bash
hermes skills browse
hermes skills search kubernetes
hermes skills inspect openai/skills/k8s
hermes skills install openai/skills/k8s
hermes skills list --source hub
hermes skills check
hermes skills update
```

सामान्य tool workflow:

```bash
hermes tools
hermes chat --toolsets "web,terminal,file"
```

## Hosted और one-click विकल्प

इस तालिका को केवल convenience reference मानें। canonical install, setup और configuration path के लिए ऊपर दिए गए official docs और repo से शुरू करें। community templates और third-party deploy options मुख्य repo से पीछे हो सकते हैं।

| Platform | Link | Notes |
| --- | --- | --- |
| **Hermes Agent** | [Official Docs](https://hermes-agent.nousresearch.com/docs/) | canonical install और setup path; hosted deploy से पहले यहीं से शुरू करें |
| **Railway** | [Template](https://railway.com/deploy/hermes-agent) | third-party platform template; launch से पहले current settings जाँचें |
| **DigitalOcean** | [Marketplace](https://marketplace.digitalocean.com/apps/hermes-agent) | marketplace deployment flow; image और config freshness जाँचें |
| **Zeabur** | [Template](https://zeabur.com/templates/hermes-agent) | community one-click deployment |
| **Coolify** | [Template Repo](https://github.com/clauxel/hermes-agent-coolify) | community-maintained Coolify template |
| **Elestio** | [Open Source](https://elest.io/open-source/hermes-agent) | managed third-party deployment option |

## तुलनात्मक AI agent products

यह तुलना तालिका केवल ecosystem समझने के लिए है। इसे किसी भी product की current documentation या pricing page का विकल्प न मानें।

| # | Product | Website | Type | Self-Host | Messaging Platforms |
| --- | --- | --- | --- | --- | --- |
| 1 | **Hermes Agent** | [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/docs/) | self-hosted AI agent | Yes | Telegram, Discord, Slack, WhatsApp, Signal, and more |
| 2 | **Multica** | [multica.uk](https://multica.uk/) | multi-channel AI automation | Yes | Multi-platform |
| 3 | **OpenClaw** | [aigeamy.com](https://www.aigeamy.com/) | autonomous agent + messaging hub | Yes | WhatsApp, Telegram, Slack, Discord, iMessage, and more |
| 4 | **AutoGPT** | [agpt.co](https://agpt.co/) | autonomous task agent | Yes | API / web UI |
| 5 | **LangChain** | [langchain.com](https://www.langchain.com/) | LLM orchestration framework | Yes | Via custom integrations |
| 6 | **n8n** | [n8n.io](https://n8n.io/) | workflow automation + AI nodes | Yes | Slack, Telegram, Discord, and many apps |
| 7 | **CrewAI** | [crewai.com](https://www.crewai.com/) | multi-agent collaboration | Yes | API / custom integrations |
| 8 | **SuperAGI** | [superagi.com](https://superagi.com/) | autonomous agent infrastructure | Yes | Slack, Email, API |

## पहले ये पेज पढ़ें

- [Installation](guide/installation.md): clean install और contributor setup
- [Quickstart](guide/quickstart.md): पहली chat, पहला model, पहली skill
- [Configuration](guide/configuration.md): config layout, env keys, context files
- [CLI Reference](reference/cli.md): सामान्य डेवलपर्स के लिए high-value commands
- [Tools](features/tools.md): toolsets और terminal backends
- [Skills](features/skills.md): Skills Hub और local skills
- [Memory](features/memory.md): persistent memory और `SOUL.md`
- [Messaging](messaging/overview.md): gateway setup और platform entry points
- [Security](guide/security.md): approvals, pairing, sandboxing और credential safety
- [Architecture](developer/architecture.md): Hermes Agent की internal structure

## आधिकारिक स्रोत

- Official repo: <https://github.com/NousResearch/hermes-agent>
- Official docs: <https://hermes-agent.nousresearch.com/docs/>
- Contributing guide: <https://hermes-agent.nousresearch.com/docs/developer-guide/contributing/>
- Architecture guide: <https://hermes-agent.nousresearch.com/docs/developer-guide/architecture/>
- CLI reference: <https://hermes-agent.nousresearch.com/docs/reference/cli-commands/>
