---
title: "Installation"
source: https://hermes-agent.nousresearch.com/docs/developer-guide/contributing/
mirrored_at: 2026-04-14T00:00:00Z
---
# Installation

This page focuses on the install paths that are most useful to ordinary developers:

- fastest user install
- contributor/dev install
- the minimum directory layout Hermes expects

## Supported Platforms

| Platform | Status |
| --- | --- |
| Linux | Supported |
| macOS | Supported |
| WSL2 | Supported |
| Native Windows | Not supported |

Use WSL2 on Windows.

## Fastest Install

For most users, use the official installer:

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.bashrc
hermes doctor
hermes setup
hermes
```

The installer handles the common dependencies for you.

## Contributor / Manual Install

Use this path if you want to hack on Hermes Agent itself or keep a repo checkout locally.

### Prerequisites

- Git with `--recurse-submodules`
- Python 3.11+
- `uv`
- Node.js 18+ if you want browser tools or the WhatsApp bridge

### Clone and Install

```bash
git clone --recurse-submodules https://github.com/NousResearch/hermes-agent.git
cd hermes-agent

# Create a Python 3.11 virtualenv
uv venv venv --python 3.11
export VIRTUAL_ENV="$(pwd)/venv"

# Install Hermes with common extras + dev tooling
uv pip install -e ".[all,dev]"

# Optional but recommended for full contributor setup
uv pip install -e "./tinker-atropos"

# Optional: browser tools
npm install
```

### Create the Hermes Home Layout

```bash
mkdir -p ~/.hermes/{cron,sessions,logs,memories,skills}
cp cli-config.yaml.example ~/.hermes/config.yaml
touch ~/.hermes/.env
```

Recommended minimum env setup:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-key
```

You can also use `NOUS_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, or `DEEPSEEK_API_KEY`.

### Add a Global `hermes` Command

```bash
mkdir -p ~/.local/bin
ln -sf "$(pwd)/venv/bin/hermes" ~/.local/bin/hermes
```

Make sure `~/.local/bin` is on your `PATH`.

### Verify

```bash
hermes doctor
hermes chat -q "Hello"
```

## Upgrade Paths

### If You Used the Official Installer

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### If You Installed From Git

```bash
cd hermes-agent
git pull --recurse-submodules
uv pip install -e ".[all,dev]"
```

## Common Problems

### `hermes: command not found`

```bash
source ~/.bashrc
# or
source ~/.zshrc
```

If needed, add your venv or `~/.local/bin` to `PATH`.

### Wrong Python Version

```bash
uv python install 3.11
uv venv venv --python 3.11
```

### Missing Submodules

```bash
git submodule update --init --recursive
```

### WSL Gateway Reliability

For WSL, prefer running the gateway directly:

```bash
hermes gateway run
```

The official docs specifically recommend `hermes gateway run` instead of `hermes gateway start` on WSL.
