---
title: "CLI Reference"
source: https://hermes-agent.nousresearch.com/docs/reference/cli-commands/
mirrored_at: 2026-04-14T00:00:00Z
---
# CLI Reference

This is a practical, developer-focused CLI reference. It is intentionally shorter than the full official command reference.

## Core Commands

| Command | Use it for |
| --- | --- |
| `hermes` | Start the interactive CLI |
| `hermes chat -q "..."` | Ask one question and exit |
| `hermes model` | Pick a model interactively |
| `hermes tools` | Review and configure tool availability |
| `hermes config show` | Inspect current config |
| `hermes config edit` | Edit `~/.hermes/config.yaml` |
| `hermes doctor` | Verify installation health |
| `hermes sessions list` | Review saved conversations |
| `hermes memory` | Inspect persistent memory |
| `hermes insights` | View usage insights |

## Setup and Recovery

```bash
hermes setup
hermes doctor
hermes update
hermes claw migrate
```

## Gateway Commands

Use the gateway when you want Hermes on Telegram, Discord, Slack, WhatsApp, and other platforms.

```bash
hermes gateway setup
hermes gateway run
hermes gateway status
```

Service-mode commands are also commonly used:

```bash
hermes gateway install
hermes gateway start
hermes gateway stop
```

WSL note:
Prefer `hermes gateway run` on WSL.

## Skills Hub Commands

The current official docs expose a much richer skills workflow than older mirrors did.

```bash
hermes skills browse
hermes skills browse --source official
hermes skills search kubernetes
hermes skills inspect openai/skills/k8s
hermes skills install openai/skills/k8s
hermes skills list --source hub
hermes skills check
hermes skills update
hermes skills audit
hermes skills uninstall k8s
```

## Tools and Toolsets

```bash
hermes tools
hermes chat --toolsets "web,terminal"
hermes chat --toolsets "web,terminal,file,browser"
```

If you only want to know what tools are available in your current install, run:

```bash
hermes tools
```

## Sessions

```bash
hermes sessions list
hermes sessions browse
hermes sessions export <session-id>
hermes sessions rename <session-id> "new name"
```

## MCP

```bash
hermes mcp serve
hermes mcp manage
```

Use `hermes mcp serve` when you want Hermes itself to act as an MCP server.

## Global Patterns Worth Remembering

```bash
# Choose a model for one run
hermes -m openrouter:anthropic/claude-3-5-sonnet

# One-off chat
hermes chat -q "Summarize the current git diff"

# Continue the last session
hermes -c

# Resume a specific session
hermes -r <session-id>

# Use a workspace explicitly
hermes -w /path/to/project
```

## Canonical Reference

For the full command surface, use the official CLI reference:

<https://hermes-agent.nousresearch.com/docs/reference/cli-commands/>
