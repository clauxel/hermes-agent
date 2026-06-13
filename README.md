# Hermes Agent

**Open-source · Self-hosted · Self-improving · MIT License**

Hermes Agent is an open-source, self-hosted AI agent framework maintained by [HermesAgent Studio](https://hermesagent.studio/). It gives you a fully controllable AI agent that learns from your conversations, works across 14+ messaging platforms, connects to 200+ models, and runs entirely on your own infrastructure.

Unlike a stateless chat assistant, Hermes Agent builds a persistent memory of your preferences and workflows and gets more useful the longer you work with it.

> **v0.2.0** — Source available on [GitHub](https://github.com/clauxel/Hermes-Agent)

---

## Documentation

| Document | Contents |
| --- | --- |
| [Introduction](doc/hermesagent.studio/guide/introduction.md) | Product philosophy, architecture, and tech stack |
| [Installation](doc/hermesagent.studio/guide/installation.md) | Bootstrap script and manual setup |
| [Quickstart](doc/hermesagent.studio/guide/quickstart.md) | First agent session in five minutes |
| [Configuration](doc/hermesagent.studio/guide/configuration.md) | All configuration options |
| [Security Model](doc/hermesagent.studio/guide/security.md) | Five-layer defense-in-depth design |
| [Migration from Hermes](doc/hermesagent.studio/guide/migration.md) | Moving over from legacy Hermes |
| [Memory System](doc/hermesagent.studio/features/memory.md) | Persistent cross-session memory |
| [Skills](doc/hermesagent.studio/features/skills.md) | Reusable packaged workflows |
| [Tool System](doc/hermesagent.studio/features/tools.md) | 47 built-in tools reference |
| [MCP Integration](doc/hermesagent.studio/features/mcp.md) | Client and server MCP usage |
| [Messaging](doc/hermesagent.studio/messaging/) | Platform-specific gateway guides |
| [DESIGN.md](./DESIGN.md) | Sales console product and system design |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Server deployment checklist |

---

## Why Hermes Agent?

| Feature | What you get |
| --- | --- |
| **Self-learning loop** | Automatically extracts reusable skills and builds a persistent user profile from every conversation |
| **14+ messaging platforms** | One configuration for Telegram, Discord, Slack, WhatsApp, Signal, WeCom, Feishu, DingTalk, Matrix, IRC, Mattermost, Rocket.Chat, SMS, and Email |
| **200+ model support** | Switch between OpenAI, Claude, Gemini, DeepSeek, Qwen, Ollama, and more with a single config change |
| **47 built-in tools** | Web search, terminal execution, browser automation, image generation, speech recognition, code execution, and more — ready to use without extra setup |
| **Two-way MCP support** | Works as both an MCP client (consuming external servers) and an MCP server (exposing capabilities to Cursor, VS Code, Claude Desktop, and similar tools) |
| **Fully self-hosted** | Docker, SSH, local execution, Singularity, Modal, and Daytona backends — your data never leaves your control |

---

## Core Capabilities

### Self-Learning

After each conversation, Hermes Agent can extract reusable workflows and save them as structured **Skills**, store durable facts such as preferences and project context, and build a richer user profile over time. Memory is maintained in two persistent Markdown files:

- `~/.hermes/memories/MEMORY.md` — agent-side notes: project state, key discoveries, operating preferences
- `~/.hermes/memories/USER.md` — user profile: background, working style, communication preferences

At the start of every session these files are injected as a frozen snapshot into the system prompt, giving the agent full context without re-reading conversation history.

### Skill System

Skills are packaged workflows that Hermes loads on demand using a three-stage progressive loading model:

| Stage | What loads |
| --- | --- |
| **L0** | Compact skill list with names, descriptions, and tags — low context cost |
| **L1** | Full `SKILL.md` when the agent decides a skill is relevant |
| **L2** | Referenced external files from `references/`, `templates/`, or `scripts/` |

### Tool Ecosystem — 47 Tools across 37 Toolsets

| Category | Key tools |
| --- | --- |
| **Web** | `web_search`, `web_extract` |
| **Terminal & file** | `terminal`, `process`, `read_file`, `patch` |
| **Browser** | `browser_navigate`, `browser_snapshot`, `browser_vision` |
| **Media** | `vision_analyze`, `image_generate`, `text_to_speech` |
| **Agent orchestration** | `todo`, `clarify`, `execute_code`, `delegate_task` |
| **Memory** | `memory`, `session_search` |
| **Automation** | `cronjob`, `send_message` |

### MCP Integration

Hermes Agent supports the Model Context Protocol in both directions:

**As a client** — connect external MCP servers in `~/.hermes/config.yaml`:

```yaml
mcp_servers:
  filesystem:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/documents"]
```

**As a server** — expose Hermes capabilities to IDEs and agent platforms:

```bash
hermes mcp --transport stdio
hermes mcp --transport http --port 8765
```

### Security Model

Hermes Agent uses a five-layer defense-in-depth design:

```text
Layer 1  User authentication    — default-deny gateway, allowlists, DM pairing
Layer 2  Command approvals      — manual / smart / off approval modes
Layer 3  Isolated execution     — Docker hardening, Singularity containers
Layer 4  MCP credential filter  — prevents secret leakage during tool calls
Layer 5  Context file scanning  — Tirith pre-execution checks
```

---

## Multi-Platform Gateway

Deploy the same agent across 14+ channels with one configuration:

| Platform | Support |
| --- | --- |
| Telegram | Full |
| Discord | Full |
| Slack | Full |
| WhatsApp | Full |
| Signal | Full |
| WeCom | Full |
| Feishu / Lark | Full |
| DingTalk | Full |
| Matrix | Full |
| IRC | Full |
| Mattermost | Full |
| Rocket.Chat | Full |
| SMS via Twilio | Full |
| Email via IMAP/SMTP | Full |

---

## Model Support

### Cloud Providers

| Provider | Notable models |
| --- | --- |
| Nous Portal | Hermes family models |
| OpenRouter | 200+ models via one API key |
| OpenAI | GPT-4o, o1, o3 |
| Anthropic | Claude 3.5 Sonnet, Claude 3 Opus |
| Google Gemini | Gemini 1.5 Pro, Gemini 2.0 Flash |
| DeepSeek | DeepSeek-V3, DeepSeek-R1 |
| Alibaba Qwen | Qwen hosted offerings |
| Kimi | Moonshot family |
| ZhipuAI | GLM-4, GLM-4V |
| Hugging Face | Inference API |

### Local Runtimes

| Runtime | Notes |
| --- | --- |
| Ollama | Llama, Mistral, and more |
| vLLM | High-performance server inference |
| llama.cpp | Lightweight CPU/GPU hybrid |
| SGLang | Structured generation workflows |

---

## Installation

### System Requirements

| OS | Status |
| --- | --- |
| Linux | Fully supported |
| macOS | Fully supported |
| WSL2 | Fully supported |
| Native Windows | Not supported — use WSL2 |

### One-Line Install (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/clauxel/Hermes-Agent/main/scripts/install.sh | bash
source ~/.bashrc
```

The installer handles `uv`, Python 3.11, Node.js v22, `ripgrep`, and `ffmpeg` automatically.

### Verify

```bash
hermes doctor
```

### Manual Install

```bash
git clone --recurse-submodules https://github.com/clauxel/Hermes-Agent.git hermes-agent
cd hermes-agent
```

> Do not omit `--recurse-submodules`. Hermes Agent depends on submodules being present.

---

## Quickstart

```bash
# 1. Run the setup wizard
hermes setup

# 2. Pick a model interactively
hermes model

# 3. Start an interactive session
hermes

# 4. Ask a one-off question
hermes chat -q "Introduce yourself briefly."
```

API keys live in `~/.hermes/.env`:

```bash
NOUS_API_KEY=nsk-xxxxxxxxxxxx
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

---

## Sales & Deployment Console

This repository also ships the **Hermes Agent Sales Console** — a conversion-first checkout and deployment interface that lets customers pick a model, choose a messaging channel, pay for a plan, and launch their own Hermes instance without creating an account before checkout.

### What the Console Does

- Launches Hermes orders from a landing page and plan selector
- Creates guest-access checkout and console links via `guest_token`
- Tracks orders, deployments, Hermes instances, upgrades, and account binding
- Deploys to a local mock target or a real Linux server over SSH
- Opens the Hermes control UI through a backend-generated same-origin proxy URL that carries the deployment token
- Supports console-first deployment even when the channel token is missing or invalid

### Console Stack

- Backend: Node.js ESM + native HTTP server
- Frontend: React + TypeScript + Vite
- Database: PostgreSQL
- Remote deployment: SSH

### Repository Layout

| Path | Purpose |
| --- | --- |
| `server.mjs` | Backend API, PostgreSQL schema, payment and deployment orchestration |
| `src/` | Frontend React application |
| `server-lib/deployment-config.mjs` | Deployment config loading and secret migration |
| `server-lib/deployment-runtime.mjs` | Mock/SSH deployment runtime |
| `scripts/deploy-order-to-real-server.mjs` | Direct real-server deployment helper |
| `test/deployment-flow.test.mjs` | End-to-end and deployment-flow tests |
| `hermes-agent.config.example.json` | Safe example deployment config |
| `DESIGN.md` | Product and system design |
| `功能说明.md` | 删除实例与白名单 `$1.00` 支付的使用条件说明 |

### Local Development

**Requirements:** Node.js 22+, npm, PostgreSQL

```bash
# 1. Install dependencies
npm install

# 2. Create local config
copy hermes-agent.config.example.json hermes-agent.config.json

# 3. Start development server
npm run dev
```

Open `http://localhost:5173`. Keeping `deployment.provider` as `mock` writes deployment output to `data/mock-remote/` instead of touching a real server.

Recommended dev startup with SSH tunnel:

```bash
npm run dev:deploy
```

### Configuration

The runtime config file is `hermes-agent.config.json`.

| Section | Contents |
| --- | --- |
| `deployment` | Provider, target server label, public console URLs, mock directory |
| `hermes` | Repo source, install/build/start commands, runtime prefixes |

- Do not commit the real `hermes-agent.config.json` — it is gitignored
- SSH deployment reads `HERMES_DEPLOY_HOST`, `HERMES_DEPLOY_PORT`, `HERMES_DEPLOY_USERNAME`, and `HERMES_DEPLOY_ROOT_PASSWORD` from the active env file
- Runtime state lives in PostgreSQL; `data/` is only used for mock artifacts and local scratch

### Payment Configuration

Creem credentials are read from environment variables only — never from `hermes-agent.config.json`.

| Variable | Purpose |
| --- | --- |
| `PAYMENT_PROVIDER=creem` | Active provider |
| `CREEM_ENV=test\|live` | Environment selector |
| `API_TEST_KEY` or `CREEM_TEST_KEY` | Test API key |
| `API_PROD_KEY`, `CREEM_API_KEY`, or `CREEM_KEY` | Live API key |
| `CREEM_BASE_URL` | Optional API override |
| `CREEM_WEBHOOK_SECRET` | Optional webhook secret |

Creem API keys must stay in ignored local env files or the deployed server environment — never in tracked source files.

### Environment Files

| File | Loaded by |
| --- | --- |
| `.env.development` | `npm run dev` |
| `.env.production` | `npm run start` |

Existing system variables win over file values.

For PostgreSQL setup:

```bash
psql -U postgres -d postgres \
  -v dev_password='your-dev-db-password' \
  -v prod_password='your-prod-db-password' \
  -f scripts/create-hermes-dev-prod-postgres.sql
```

### Running Tests

```bash
npm test
```

### Production Build

```bash
npm run build
npm run start
```

**Recommended same-host topology:**

- `npm run start` runs the Node app
- Nginx proxies `/`, `/api/*`, and `/hermes-console/*` to the same local Node port
- Leave `VITE_API_BASE_URL` unset so the browser calls same-origin `/api/*`
- `APP_ORIGIN=https://www.aigeamy.com,https://aigeamy.com`
- PostgreSQL via `HERMES_POSTGRES_HOST`, `HERMES_POSTGRES_DB`, `HERMES_POSTGRES_USER`, `HERMES_POSTGRES_PASSWORD`

Ready-to-copy deployment templates live in `deploy/`:

- `hermes-agent.env.example` — environment file template
- `hermes-agent.service.example` — systemd unit template
- `aigeamy.com.nginx.example` — Nginx config template

**Vercel frontend split (optional):** If you want Vercel to serve the React frontend and a separate host to run the backend, set `VITE_API_BASE_URL=https://api.aigeamy.com` on Vercel and `APP_ORIGIN=https://www.aigeamy.com,https://aigeamy.com` on the backend. Keep `vercel.json` in the frontend deploy so direct visits to `/console`, `/checkout`, `/plans`, `/privacy`, `/terms`, `/compare/*`, and `/solutions/*` rewrite back to `index.html`.

### Real SSH Deployment

Set `deployment.provider` to `ssh` in `hermes-agent.config.json`. The runtime will:

- Connect to the server over SSH
- Create an isolated instance directory under `/srv/hermes/instances/<instanceName>`
- Create a dedicated runtime user and systemd service
- Write instance-specific `.env`
- Open the console port in firewalld / ufw / iptables when available
- Write the real console URL back into the application database

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full server checklist.

### Security Notes

- `data/` and the real deployment config are gitignored
- Channel tokens are encrypted before persistence
- Deployment console tokens are stored encrypted and exchanged through a protected backend route
- Each SSH deployment is isolated with a dedicated user, directory, and hardened systemd settings

---

## Typical Use Cases

**Personal assistant** — Ask questions on Telegram, receive updates on Feishu, keep your working style and project context between sessions, use speech-to-text and image generation in one agent.

**Team bot** — Deploy to Slack, Discord, Feishu, or DingTalk, restrict access to approved users, answer business-specific questions from internal knowledge.

**Automation hub** — Run scheduled jobs, monitor services, send reports, automate browsers, execute code as part of CI or operational workflows.

**Development assistant** — Expose Hermes Agent as an MCP server to Cursor or VS Code, perform code reviews, generate docs, answer questions about local repositories.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

Maintained by [HermesAgent Studio](https://hermesagent.studio/).
