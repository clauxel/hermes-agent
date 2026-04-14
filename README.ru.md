# Руководство Разработчика По Hermes Agent

**Языки:** [English](README.md) | [简体中文](README.zh-CN.md) | [हिन्दी](README.hi.md) | [Español](README.es.md) | [العربية](README.ar.md) | [Français](README.fr.md) | [বাংলা](README.bn.md) | [Português](README.pt.md) | **Русский** | [Bahasa Indonesia](README.id.md)

[![Stars](https://img.shields.io/github/stars/NousResearch/hermes-agent?style=flat&logo=github&label=Stars&color=gold)](https://github.com/NousResearch/hermes-agent/stargazers)
[![Forks](https://img.shields.io/github/forks/NousResearch/hermes-agent?style=flat&label=Forks&color=silver)](https://github.com/NousResearch/hermes-agent/network/members)
[![Contributors](https://img.shields.io/github/contributors/NousResearch/hermes-agent?label=Contributors&color=green)](https://github.com/NousResearch/hermes-agent/graphs/contributors)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/NousResearch/hermes-agent/blob/main/LICENSE)

> Краткое руководство для разработчиков по установке, настройке и использованию Hermes Agent.

Эта папка представляет собой локальное руководство по **Hermes Agent**. Канонические источники — официальный GitHub-репозиторий и официальная документация:

- GitHub: <https://github.com/NousResearch/hermes-agent>
- Docs: <https://hermes-agent.nousresearch.com/docs/>

Если что-то здесь противоречит официальной документации или `hermes --help`, доверяйте официальной документации и установленному у вас CLI.

## Что Такое Hermes Agent

Hermes Agent — это self-hosted AI agent от Nous Research. Для обычных разработчиков наиболее важны такие возможности:

- интерактивный CLI с инструментами, сессиями, checkpoints и потоковым выводом
- multi-platform gateway для Telegram, Discord, Slack, WhatsApp, Signal и других платформ
- встроенные toolsets для web, файлов, shell, browser automation, memory, code execution, cron, delegation и TTS
- устанавливаемые skills и Skills Hub
- постоянная память и контекстные файлы вроде `SOUL.md` и `AGENTS.md`
- поддержка MCP для подключения внешних серверов инструментов

## Быстрый Старт За 5 Минут

```bash
# 1. Установите Hermes Agent
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# 2. Перезагрузите shell
source ~/.bashrc
# или: source ~/.zshrc

# 3. Проверьте установку
hermes doctor

# 4. Запустите первичную настройку
hermes setup

# 5. Начните диалог
hermes
```

Примечание для Windows:  
Нативный Windows не поддерживается. Используйте WSL2.

## Команды, Которые Разработчики Используют Чаще Всего

| Команда | Что делает |
| --- | --- |
| `hermes` | Запускает интерактивный CLI |
| `hermes chat -q "Hello"` | Выполняет один запрос и завершает работу |
| `hermes model` | Интерактивно выбирает provider и model |
| `hermes tools` | Показывает или настраивает включенные tools/toolsets |
| `hermes config show` | Показывает текущую конфигурацию |
| `hermes doctor` | Запускает диагностику установки |
| `hermes sessions list` | Показывает сохраненные сессии |
| `hermes skills browse` | Просматривает доступные skills |
| `hermes skills search react` | Ищет в Skills Hub |
| `hermes skills install openai/skills/k8s` | Устанавливает skill из hub |
| `hermes gateway setup` | Настраивает платформы сообщений |
| `hermes gateway run` | Запускает gateway в foreground |
| `hermes claw migrate` | Импортирует данные из OpenClaw |

Примечание для WSL:  
Официальная документация рекомендует `hermes gateway run` вместо `hermes gateway start` в WSL, потому что поддержка systemd там может быть ненадежной.

## Структура Каталогов Для Разработчиков

Hermes хранит пользовательские данные в `~/.hermes/`:

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

Практическое правило:

- храните secrets, такие как API keys и bot tokens, в `~/.hermes/.env`
- храните несекретные runtime settings в `~/.hermes/config.yaml`
- храните долгоживущую memory в `~/.hermes/memories/`
- храните reusable skills в `~/.hermes/skills/`

## Практический Чеклист Настройки

Как минимум проверьте:

1. рабочий provider key в `~/.hermes/.env`
2. модель по умолчанию, выбранную через `hermes model`
3. terminal backend в `~/.hermes/config.yaml`
4. наборы инструментов, проверенные через `hermes tools`
5. project context files, такие как `AGENTS.md` или `.hermes.md`

Примеры env keys:

```bash
NOUS_API_KEY=nsk-...
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=...
```

Пример terminal config:

```yaml
terminal:
  backend: local
  cwd: "."
  timeout: 180
```

## Skills И Инструменты

Hermes Agent поддерживает как встроенные возможности, так и устанавливаемые skills.

Обычные команды skills из текущей официальной документации:

```bash
hermes skills browse
hermes skills search kubernetes
hermes skills inspect openai/skills/k8s
hermes skills install openai/skills/k8s
hermes skills list --source hub
hermes skills check
hermes skills update
```

Обычный workflow инструментов:

```bash
hermes tools
hermes chat --toolsets "web,terminal,file"
```

## Hosted И One-Click Варианты

Считайте эту таблицу только удобной справкой. Для канонической установки, настройки и конфигурации ориентируйтесь на официальный репозиторий и документацию выше. Community templates и marketplace-варианты могут отставать от основного репозитория.

| Платформа | Ссылка | Примечания |
| --- | --- | --- |
| **Hermes Agent** | [Official Docs](https://hermes-agent.nousresearch.com/docs/) | канонический путь установки и настройки; начните отсюда перед любым hosted deploy |
| **Railway** | [Template](https://railway.com/deploy/hermes-agent) | template сторонней платформы; проверьте актуальность настроек перед запуском |
| **DigitalOcean** | [Marketplace](https://marketplace.digitalocean.com/apps/hermes-agent) | deploy через marketplace; проверьте свежесть образа и конфигурации |
| **Zeabur** | [Template](https://zeabur.com/templates/hermes-agent) | community one-click deployment |
| **Coolify** | [Template Repo](https://github.com/clauxel/hermes-agent-coolify) | community-maintained шаблон Coolify |
| **Elestio** | [Open Source](https://elest.io/open-source/hermes-agent) | managed third-party deployment option |

## Сравнимые AI Agent Продукты

Эта таблица нужна для быстрой ориентации и не заменяет актуальную документацию или страницу цен каждого продукта.

| # | Продукт | Сайт | Тип | Self-Host | Платформы сообщений |
| --- | --- | --- | --- | --- | --- |
| 1 | **Hermes Agent** | [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/docs/) | self-hosted AI agent | Да | Telegram, Discord, Slack, WhatsApp, Signal и другие |
| 2 | **Multica** | [multica.uk](https://multica.uk/) | multi-channel AI automation | Да | Multi-platform |
| 3 | **OpenClaw** | [aigeamy.com](https://www.aigeamy.com/) | autonomous agent + messaging hub | Да | WhatsApp, Telegram, Slack, Discord, iMessage и другие |
| 4 | **AutoGPT** | [agpt.co](https://agpt.co/) | autonomous task agent | Да | API / web UI |
| 5 | **LangChain** | [langchain.com](https://www.langchain.com/) | LLM orchestration framework | Да | Через кастомные интеграции |
| 6 | **n8n** | [n8n.io](https://n8n.io/) | workflow automation + AI nodes | Да | Slack, Telegram, Discord и многие приложения |
| 7 | **CrewAI** | [crewai.com](https://www.crewai.com/) | multi-agent collaboration | Да | API / custom integrations |
| 8 | **SuperAGI** | [superagi.com](https://superagi.com/) | autonomous agent infrastructure | Да | Slack, Email, API |

## Сначала Прочитайте Эти Страницы

- [Installation](guide/installation.md): чистая установка и contributor setup
- [Quickstart](guide/quickstart.md): первый chat, первая model, первая skill
- [Configuration](guide/configuration.md): layout конфигурации, env keys, context files
- [CLI Reference](reference/cli.md): высокополезные команды для обычных разработчиков
- [Tools](features/tools.md): toolsets и terminal backends
- [Skills](features/skills.md): Skills Hub и локальные skills
- [Memory](features/memory.md): persistent memory и `SOUL.md`
- [Messaging](messaging/overview.md): настройка gateway и platform entry points
- [Security](guide/security.md): approvals, pairing, sandboxing и credential safety
- [Architecture](developer/architecture.md): внутренняя структура Hermes Agent

## Официальные Источники

- Официальный репозиторий: <https://github.com/NousResearch/hermes-agent>
- Официальная документация: <https://hermes-agent.nousresearch.com/docs/>
- Руководство по участию: <https://hermes-agent.nousresearch.com/docs/developer-guide/contributing/>
- Руководство по архитектуре: <https://hermes-agent.nousresearch.com/docs/developer-guide/architecture/>
- CLI reference: <https://hermes-agent.nousresearch.com/docs/reference/cli-commands/>
