---
title: "Hermes Agent Developer Guide"
source: https://hermes-agent.nousresearch.com/docs/
mirrored_at: 2026-04-14T00:00:00Z
---
# Hermes Agent Developer Guide

This folder is a curated local reference for **Hermes Agent**.

Canonical upstream sources:

- GitHub: <https://github.com/NousResearch/hermes-agent>
- Docs: <https://hermes-agent.nousresearch.com/docs/>

If a command, flag, or config key here differs from the official docs or your installed CLI, trust the official docs and `hermes --help`.

## Start Here

- [Installation](guide/installation.md)
- [Quickstart](guide/quickstart.md)
- [Configuration](guide/configuration.md)
- [CLI Reference](reference/cli.md)

## Most Useful Topics

- [Tools](features/tools.md)
- [Skills](features/skills.md)
- [Memory](features/memory.md)
- [Messaging Overview](messaging/overview.md)
- [Security](guide/security.md)
- [Architecture](developer/architecture.md)

## One-Line Install

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.bashrc
hermes doctor
hermes setup
hermes
```
