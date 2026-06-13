---
title: "Quickstart"
source: https://hermesagent.studio/guide/quickstart
mirrored_at: 2026-04-12T01:11:32Z
---
# Quickstart

This guide gets you from a fresh install to your first useful conversation with Hermes Agent in about five minutes.

## Prerequisites

Make sure installation is complete and the environment passes the health check:

```bash
hermes doctor
```

Continue once the required checks are passing.

## Step 1: Run the Setup Wizard

```bash
hermes setup
```

The wizard walks you through:

1. Choosing a default model provider
2. Entering your API key securely into `~/.hermes/.env`
3. Selecting a terminal backend such as local, Docker, or SSH
4. Enabling memory features
5. Choosing a language preference

At the end, Hermes Agent writes the configuration to `~/.hermes/config.yaml`.

## Step 2: Choose a Model

Open the interactive model picker:

```bash
hermes model
```

Example:

```text
? Select a model provider:
  > Nous Portal
    OpenRouter
    OpenAI
    Anthropic
    Google Gemini
    DeepSeek
    Local (Ollama)
    ...

? Select a model:
  > hermes-3-llama-3.1-70b
    hermes-3-llama-3.1-405b
    ...
```

You can also choose a model explicitly from the command line:

```bash
hermes --model openai/gpt-4o
hermes --model anthropic/claude-3-5-sonnet
hermes --model ollama/llama3.2
```

## Step 3: Add Your API Keys

API keys live in `~/.hermes/.env`. You can edit the file directly or set them through the CLI:

```bash
# Option 1: edit the file directly
nano ~/.hermes/.env

# Option 2: set values from the command line
hermes config set NOUS_API_KEY your_key_here
hermes config set OPENAI_API_KEY your_key_here
hermes config set ANTHROPIC_API_KEY your_key_here
```

Example `.env` file:

```bash
# Nous Portal
NOUS_API_KEY=nsk-xxxxxxxxxxxx

# OpenRouter (200+ models)
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxx

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx

# Google Gemini
GOOGLE_API_KEY=AIzaxxxxxxxxxx

# DeepSeek
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxx
```

## Step 4: Start Chatting

### Interactive Mode

```bash
hermes
```

This opens a persistent conversational UI with multi-turn context and tool support.

### One-Off Questions

```bash
hermes chat -q "Introduce yourself briefly."
hermes chat -q "Write a quicksort implementation in Python."
hermes chat -q "Summarize today's headlines."
```

### Pipe Input from Other Commands

```bash
echo "Explain this code" | hermes chat
cat error.log | hermes chat -q "Analyze this error log"
```

## Useful CLI Patterns

### Model Selection

```bash
# Use a specific model
hermes --model openai/gpt-4o

# Use the interactive picker
hermes model
```

### Toolset Control

```bash
# Enable specific toolsets only
hermes --toolsets web,terminal,browser

# Disable all tools for plain chat
hermes --toolsets none

# List available toolsets
hermes toolsets list
```

### Skill Management

```bash
# Enable a specific skill
hermes -s my_skill_name

# List installed skills
hermes skills list

# Show one skill
hermes skills show my_skill_name
```

### Session Management

```bash
# Continue the last session
hermes --continue

# Resume a specific session
hermes --resume session_id_here

# List saved sessions
hermes sessions list
```

### Debugging and Output

```bash
# Show verbose execution details
hermes --verbose

# Auto-approve all actions; use carefully
hermes --yolo

# Override the system prompt for one run
hermes --system "You are a concise Python expert. Reply with practical technical guidance."
```

## Create Your First Skill

Skills are one of Hermes Agent's most important capabilities. Here are three common ways to create one.

### Option 1: Let Hermes Extract a Skill from Conversation

During a conversation, Hermes Agent can recognize a reusable workflow and offer to save it:

```text
You: Check the latest version of Python requests and tell me whether my project should update.

Hermes: [runs several steps]
        This workflow looks reusable. Would you like to save it as a skill named
        "check_package_version"?

You: Yes, save it.
```

### Option 2: Write a Skill File Manually

Create a YAML file under `~/.hermes/skills/`:

```bash
nano ~/.hermes/skills/git_summary.yaml
```

```yaml
name: git_summary
description: Generate a summary report for the current Git repository
version: "1.0"
author: your_name
tags:
  - git
  - development

steps:
  - tool: terminal
    command: git log --oneline -20
    description: Fetch the last 20 commits

  - tool: terminal
    command: git diff --stat HEAD~5
    description: Show the change summary for the last 5 commits

  - tool: llm
    prompt: |
      Based on the git information above, write a concise summary report.
      Include the major changes and recent development progress.
```

Run it with:

```bash
hermes -s git_summary
```

### Option 3: Ask Hermes to Generate a Skill

```bash
hermes chat -q "Create a skill that checks CPU, memory, and disk usage, then writes a short status report."
```

Hermes Agent can generate and save the skill file for you.

## Set Up the Messaging Gateway

If you want Hermes Agent to respond on platforms such as Telegram or Discord:

```bash
hermes gateway setup
```

The setup flow lets you choose a platform and enter the required credentials. For example, for Telegram:

```text
? Which platform do you want to configure? Telegram

? Enter the Bot Token from @BotFather:
  123456789:ABCdefGHIjklMNOpqrsTUVwxyz

? Who is allowed to use this bot?
  > Specific user ID list
    Everyone (not recommended)
    DM pairing mode

? Enter the allowed Telegram user IDs, comma-separated:
  123456789, 987654321

[OK] Telegram bot configuration complete
```

Start the gateway:

```bash
hermes gateway start

# Run in the background
hermes gateway start --daemon
```

## Next Steps

- [Configuration](configuration.md) - Explore the full configuration surface
- [Security Model](security.md) - Learn how approvals and isolation work
- [Tool System](../features/tools.md) - Explore the built-in toolsets
- [Messaging Gateway](../messaging/overview.md) - Configure supported chat platforms in detail
