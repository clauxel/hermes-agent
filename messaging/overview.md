---
title: "Messaging Gateway Overview"
source: https://hermes-agent.nousresearch.com/docs/user-guide/messaging/
mirrored_at: 2026-04-12T01:11:32Z
---
# Messaging Gateway Overview

The Hermes messaging gateway lets you use the same agent across 14+ chat and collaboration platforms. One agent, available from almost anywhere.

## Supported Platforms

| Platform | Type | Notes |
| --- | --- | --- |
| **Telegram** | Messaging | Text, voice, images, files, and group chats |
| **Discord** | Messaging | Text channels, DMs, and voice channels |
| **Slack** | Team collaboration | Best for workspaces and internal teams |
| **WhatsApp** | Messaging | Uses a WhatsApp Web bridge and requires Node.js v22 |
| **Signal** | Messaging | Privacy-oriented encrypted messaging |
| **SMS (Twilio)** | SMS | Reach users through phone numbers |
| **Email** | Email | SMTP/IMAP-based interaction |
| **Home Assistant** | Smart home | Integrates with voice and automation flows |
| **Mattermost** | Team collaboration | Self-hosted chat platform |
| **Matrix** | Decentralized messaging | Works with clients such as Element |
| **DingTalk** | Enterprise collaboration | Common in Chinese enterprise environments |
| **Feishu / Lark** | Enterprise collaboration | ByteDance collaboration platforms |
| **WeCom** | Enterprise collaboration | Tencent enterprise messaging |
| **Open WebUI** | Web UI | Browser-based interface with no client install |
| **Webhooks** | Developer integration | Trigger Hermes from external events |

## Quick Start

### Step 1: Configure a Platform

Run the setup wizard and choose the platform you want:

```bash
hermes gateway setup
```

Tokens and secrets are stored in `~/.hermes/.env`.

For a quick foreground test before installing a service:

```bash
hermes gateway run
```

### Step 2: Install the Gateway as a Service

For a background service that starts automatically:

```bash
# User-level service
hermes gateway install

# System-level service
sudo hermes gateway install --system
```

### Step 3: Start the Gateway

```bash
hermes gateway start
```

Check status:

```bash
hermes gateway status
```

Stop the gateway:

```bash
hermes gateway stop
```

## Gateway Management Commands

| Command | Purpose |
| --- | --- |
| `hermes gateway setup` | Interactive setup wizard |
| `hermes gateway run` | Run the gateway in the foreground |
| `hermes gateway install` | Install as a user service |
| `hermes gateway install --system` | Install as a system-wide service |
| `hermes gateway start` | Start the gateway |
| `hermes gateway stop` | Stop the gateway |
| `hermes gateway status` | Inspect the running state |

## In-Chat Commands

All messaging platforms support the same built-in chat commands:

| Command | Purpose |
| --- | --- |
| `/new` | Start a fresh conversation |
| `/reset` | Reset the current conversation |
| `/model` | Switch the active model |
| `/voice` | Toggle voice mode when supported |
| `/skills` | Browse or manage installed skills when supported |
| `/reload-mcp` | Reload MCP configuration |
| `/help` | Show help |

## User Authorization

### Default-Deny Policy

The gateway is locked down by default. Only explicitly approved users can interact with the agent.

### Allow Specific Users

Configure allowed-user lists in `~/.hermes/.env`:

```bash
TELEGRAM_ALLOWED_USERS=123456789,987654321
DISCORD_ALLOWED_USERS=123456789012345678
SLACK_ALLOWED_USERS=U01ABC123,U01DEF456
```

### DM Pairing

Some platforms support pairing flows:

1. A user sends a pairing request in a DM
2. Hermes returns a one-time pairing code
3. An admin approves it with `hermes pairing approve <platform> <code>`
4. The user is added to the authorized list

To revoke access:

```bash
hermes pairing list
hermes pairing revoke telegram 123456789
```

## Multi-Platform Operation

The gateway can run multiple platforms at the same time. They share the same Hermes installation, but each platform user still gets an isolated conversation context.

## Service Modes

### User-Level Service

```bash
hermes gateway install
```

- Runs as the current user
- Usually uses `systemd --user` on Linux or `launchd` on macOS
- Does not require root

### System-Level Service

```bash
sudo hermes gateway install --system
```

- Starts on boot
- Better for server deployments
- Requires service access to the config files and environment values

### View Service Logs

```bash
# Linux
journalctl --user -u hermes-gateway -f

# macOS
tail -f ~/Library/Logs/hermes-gateway.log
```
