---
title: "Configuration"
source: https://hermes-agent.nousresearch.com/docs/user-guide/configuration/
mirrored_at: 2026-04-14T00:00:00Z
---
# Configuration

Hermes Agent configuration is easiest to understand as two layers:

| Location | Purpose |
| --- | --- |
| `~/.hermes/config.yaml` | Non-secret runtime configuration |
| `~/.hermes/.env` | API keys, tokens, secrets, and environment overrides |

If a value is sensitive, put it in `.env`.

## Directory Structure

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

## Useful Config Commands

```bash
hermes config show
hermes config edit
hermes config set terminal.backend docker
hermes config migrate
```

## Provider Keys

Common `.env` keys:

```bash
NOUS_API_KEY=nsk-...
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=...
```

## Terminal Backend

This is one of the highest-value parts of the config for developers:

```yaml
terminal:
  backend: local
  cwd: "."
  timeout: 180
```

Supported backends commonly documented in the official docs:

- `local`
- `docker`
- `ssh`
- `singularity`
- `modal`
- `daytona`

Docker example:

```yaml
terminal:
  backend: docker
  docker_image: python:3.11-slim
  cwd: /workspace
  timeout: 180
```

## Working Directory

Hermes uses different defaults depending on how it runs:

- CLI: current directory where you launched `hermes`
- Messaging gateway: home directory by default

Useful overrides:

```bash
MESSAGING_CWD=/home/myuser/projects
TERMINAL_CWD=/workspace
```

## Approvals

Use approvals to control how aggressively Hermes can execute risky actions:

```yaml
approvals:
  mode: smart
  timeout: 30
```

Common modes:

- `manual`
- `smart`
- `off`

## Context Files

Current official docs distinguish two scopes:

| File | Purpose |
| --- | --- |
| `~/.hermes/SOUL.md` | Primary agent identity |
| `.hermes.md` / `HERMES.md` | Project-level instructions |
| `AGENTS.md` | Project rules and coding conventions |

Important behavior from the official docs:

- `SOUL.md` is always loaded independently
- project context uses a priority order
- `AGENTS.md` can be hierarchical across directories

## Skills and Memory

The most important paths to remember are:

```text
~/.hermes/skills/
~/.hermes/memories/
```

If your version or an older guide mentions `~/.hermes/memory/`, treat that as legacy wording and prefer `~/.hermes/memories/`.

## Practical Advice

- Use `hermes config show` before editing by hand
- Keep `.env` and `config.yaml` responsibilities separate
- Review tool and terminal settings after setup with `hermes tools`
- Prefer local context files over giant system prompts pasted into chat
- When in doubt, compare your config with the current official docs
