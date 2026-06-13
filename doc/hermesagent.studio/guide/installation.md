---
title: "Installation"
source: https://hermesagent.studio/guide/installation
mirrored_at: 2026-04-12T01:11:32Z
---
# Installation

This guide walks through installing Hermes Agent on your own machine.

## System Requirements

### Operating Systems

| System | Support status |
| --- | --- |
| Linux | Fully supported |
| macOS | Fully supported |
| WSL2 | Fully supported |
| Native Windows | Not supported |

> Hermes Agent does not support native Windows. On Windows, use WSL2, ideally with Ubuntu 22.04.

### Prerequisites

The only dependency you need to install manually before running the bootstrap script is **Git**:

```bash
# Ubuntu/Debian
sudo apt install git

# macOS via Homebrew
brew install git

# Verify
git --version
```

The install script handles everything else, including `uv`, Python 3.11, Node.js v22, `ripgrep`, and `ffmpeg`.

## Option 1: One-Line Install (Recommended)

For most users, the quickest setup is:

```bash
curl -fsSL https://raw.githubusercontent.com/clauxel/Hermes-Agent/main/scripts/install.sh | bash
```

After installation, reload your shell config:

```bash
source ~/.bashrc
# or, if you use zsh
source ~/.zshrc
```

### What the Installer Adds

The bootstrap script automatically installs:

| Dependency | Version | Purpose |
| --- | --- | --- |
| `uv` | latest | Python package management |
| Python | 3.11 | Runtime |
| Node.js | v22 | Frontend and tooling |
| `ripgrep` | latest | Fast code and text search |
| `ffmpeg` | latest | Audio and video support for voice features |

### Verify the Install

```bash
hermes doctor
```

Expected output looks like:

```text
[OK] Python 3.11.9
[OK] Node.js v22.4.0
[OK] uv 0.4.1
[OK] ripgrep 14.1.0
[OK] ffmpeg 6.1.1
[OK] ~/.hermes directory structure
[OK] ~/.hermes/.env file
[WARN] No API key detected, run hermes setup
```

## Option 2: Manual Installation

If you want tighter control over the environment, install Hermes Agent step by step.

### Step 1: Clone the Repository

```bash
git clone --recurse-submodules https://github.com/clauxel/Hermes-Agent.git hermes-agent
cd hermes-agent
```

> Do not omit `--recurse-submodules`. Hermes Agent depends on submodules being present.

### Step 2: Create a Virtual Environment

```bash
uv venv .venv --python 3.11
source .venv/bin/activate
```

### Step 3: Install Python Dependencies

```bash
pip install -e .
```

### Step 4: Create the Config Directories

```bash
mkdir -p ~/.hermes/{skills,memory,personas,logs}
```

Directory overview:

| Directory | Purpose |
| --- | --- |
| `~/.hermes/skills/` | Auto-generated and hand-written skills |
| `~/.hermes/memory/` | Persistent memory storage |
| `~/.hermes/personas/` | Persona definitions |
| `~/.hermes/logs/` | Runtime logs |

### Step 5: Create the Environment File

```bash
touch ~/.hermes/.env
```

Edit `~/.hermes/.env` and add at least one provider key:

```bash
# Nous Portal (recommended)
NOUS_API_KEY=your_key_here

# OpenRouter (200+ models)
OPENROUTER_API_KEY=your_key_here

# OpenAI
OPENAI_API_KEY=your_key_here

# Anthropic
ANTHROPIC_API_KEY=your_key_here

# Google Gemini
GOOGLE_API_KEY=your_key_here
```

### Step 6: Create the Main Config File

```bash
cp config.example.yaml ~/.hermes/config.yaml
```

### Step 7: Create a CLI Symlink

```bash
sudo ln -sf "$(pwd)/.venv/bin/hermes" /usr/local/bin/hermes
```

### Step 8: Validate the Setup

```bash
hermes doctor
```

### Step 9: Run the Setup Wizard

```bash
hermes setup
```

### Step 10: Start Using Hermes Agent

```bash
hermes
```

## Optional Feature Extras

Some Hermes Agent capabilities require optional extras. Install only what you need:

### Install Individual Extras

```bash
# Voice input and output
pip install "hermes-agent[voice]"

# Messaging platform integrations
pip install "hermes-agent[messaging]"

# Premium-quality TTS
pip install "hermes-agent[tts-premium]"

# Browser automation
pip install "hermes-agent[browser]"

# Image generation
pip install "hermes-agent[image]"

# Vector databases for enhanced memory retrieval
pip install "hermes-agent[vector]"

# OpenTelemetry observability
pip install "hermes-agent[observability]"
```

### Install Everything

```bash
pip install "hermes-agent[all]"
```

### Available Extras

| Extra | Includes |
| --- | --- |
| `voice` | Whisper-based speech recognition and voice activity detection |
| `messaging` | Telegram, Discord, Slack, WhatsApp, and other messaging SDKs |
| `tts-premium` | Premium TTS providers such as ElevenLabs and Azure |
| `browser` | Playwright browser automation |
| `image` | Stable Diffusion and DALL-E integrations |
| `vector` | ChromaDB and Qdrant vector storage |
| `observability` | OpenTelemetry tracing |
| `dev` | Development tools such as `pytest`, `ruff`, and `mypy` |
| `docs` | Documentation tooling such as MkDocs |
| `hpc` | HPC and Singularity support |
| `modal` | Modal backend support |
| `daytona` | Daytona backend support |
| `ssh` | Enhanced SSH backend support |
| `docker` | Docker backend support |
| `security` | Tirith security scanning integration |
| `all` | Everything above |

## Docker Deployment

If you want Hermes Agent to run fully in containers:

### Pull the Image

```bash
docker pull nousresearch/hermes-agent:latest
```

### Run the Container

```bash
docker run -it \
  -v ~/.hermes:/root/.hermes \
  -e OPENAI_API_KEY=your_key_here \
  nousresearch/hermes-agent:latest
```

### Use Docker Compose

Create `docker-compose.yml`:

```yaml
version: "3.9"
services:
  hermes:
    image: nousresearch/hermes-agent:latest
    volumes:
      - ~/.hermes:/root/.hermes
    environment:
      - NOUS_API_KEY=${NOUS_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    stdin_open: true
    tty: true
    restart: unless-stopped
```

Start it with:

```bash
docker compose up -d
docker compose exec hermes hermes
```

## Nix / NixOS

Hermes Agent ships with Nix Flake support.

### Run Without Installing

```bash
nix run github:clauxel/Hermes-Agent
```

### Add It to a NixOS Config

In your `flake.nix`:

```nix
{
  inputs.hermes-agent.url = "github:clauxel/Hermes-Agent";

  outputs = { self, nixpkgs, hermes-agent, ... }: {
    nixosConfigurations.myhost = nixpkgs.lib.nixosSystem {
      modules = [
        hermes-agent.nixosModules.default
        {
          services.hermes-agent = {
            enable = true;
            configFile = "/etc/hermes/config.yaml";
          };
        }
      ];
    };
  };
}
```

### Open the Development Shell

```bash
nix develop github:clauxel/Hermes-Agent
```

## Upgrading

### Upgrade a One-Line Install

```bash
curl -fsSL https://raw.githubusercontent.com/clauxel/Hermes-Agent/main/scripts/install.sh | bash
```

Re-running the installer updates Hermes Agent to the latest version.

### Upgrade a Manual Install

```bash
cd hermes-agent
git pull --recurse-submodules
pip install -e .
hermes config migrate
```

### Check the Installed Version

```bash
hermes --version
```

## Common Installation Issues

### `hermes: command not found`

Reload your shell:

```bash
source ~/.bashrc  # or source ~/.zshrc
```

If that still does not work, make sure `/usr/local/bin` is in `PATH`:

```bash
echo $PATH | grep -o '/usr/local/bin'
```

### Python Version Conflicts

Hermes Agent requires Python 3.11. Let `uv` manage it for you:

```bash
uv python install 3.11
uv venv .venv --python 3.11
```

### Missing Submodules

If you forgot `--recurse-submodules` while cloning:

```bash
git submodule update --init --recursive
```

### `hermes doctor` Reports Missing Dependencies

Install the missing tools individually based on the output:

```bash
# Missing ripgrep
sudo apt install ripgrep  # Ubuntu
brew install ripgrep      # macOS

# Missing ffmpeg
sudo apt install ffmpeg   # Ubuntu
brew install ffmpeg       # macOS
```
