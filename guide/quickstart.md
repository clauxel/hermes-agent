---
title: "Quickstart"
source: https://hermes-agent.nousresearch.com/docs/getting-started/quickstart/
mirrored_at: 2026-04-14T00:00:00Z
---
# Quickstart

This quickstart is designed for ordinary developers who want to become productive fast.

## 1. Verify the Install

```bash
hermes doctor
```

If `doctor` shows missing dependencies or a missing provider key, fix those first.

## 2. Run the Setup Wizard

```bash
hermes setup
```

The setup flow is the easiest way to:

- choose a default provider
- write API keys into `~/.hermes/.env`
- select a terminal backend
- initialize your base config

## 3. Start a Conversation

```bash
hermes
```

For a quick non-interactive check:

```bash
hermes chat -q "Hello"
```

## 4. Pick a Model

```bash
hermes model
```

You can also override per run:

```bash
hermes -m openrouter:anthropic/claude-3-5-sonnet
hermes -m openai:gpt-4o
```

## 5. Review the Enabled Tools

```bash
hermes tools
```

This is one of the most useful early commands. It lets you confirm what the agent can actually do in your current environment.

You can also narrow toolsets explicitly:

```bash
hermes chat --toolsets "web,terminal,file"
```

## 6. Check Sessions

```bash
hermes sessions list
```

Hermes keeps saved sessions, so it is worth learning this command early.

## 7. Try the Skills Hub

Current official commands worth knowing:

```bash
hermes skills browse
hermes skills search kubernetes
hermes skills inspect openai/skills/k8s
hermes skills install openai/skills/k8s
hermes skills list --source hub
```

## 8. Configure the Messaging Gateway

If you want Hermes outside the terminal:

```bash
hermes gateway setup
```

Typical next commands:

```bash
hermes gateway run
hermes gateway status
```

Service mode is also available on supported systems:

```bash
hermes gateway install
hermes gateway start
```

WSL note:
Prefer `hermes gateway run` on WSL.

## 9. Add Context Files

Hermes becomes much more useful when you give it stable project context.

Useful files to know:

- `~/.hermes/SOUL.md`
- `.hermes.md` or `HERMES.md`
- `AGENTS.md`

Use these to encode identity, project rules, coding conventions, and workflow preferences.

## Suggested First Reading Order

1. [Configuration](configuration.md)
2. [CLI Reference](../reference/cli.md)
3. [Tools](../features/tools.md)
4. [Skills](../features/skills.md)
5. [Messaging Overview](../messaging/overview.md)
6. [Security](security.md)

## A Good First Developer Checklist

- `hermes doctor` passes
- `hermes setup` completed
- default model chosen with `hermes model`
- tool availability reviewed with `hermes tools`
- one skill installed or inspected from the hub
- one local context file added for your project
