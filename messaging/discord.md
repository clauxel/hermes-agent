---
title: "Discord Integration"
source: https://hermes-agent.nousresearch.com/docs/user-guide/messaging/discord/
mirrored_at: 2026-04-12T01:11:32Z
---
# Discord Integration

Hermes can run as a Discord bot in DMs, server channels, and voice channels.

## Prerequisites

- Hermes Agent is installed
- You have a Discord account
- You can create apps in a Discord server, or you have permission to invite bots

## Step 1: Create a Discord App and Bot

1. Open the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Open the **Bot** page and click **Add Bot**
4. Copy the bot token from **Reset Token**
5. Enable these privileged intents:

- **Server Members Intent**
- **Message Content Intent**

## Step 2: Configure Environment Variables

Edit `~/.hermes/.env`:

```bash
DISCORD_BOT_TOKEN=MTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DISCORD_ALLOWED_USERS=123456789012345678,987654321098765432
```

### Find Your Discord User ID

1. Enable **Developer Mode** in Discord settings
2. Right-click your username
3. Choose **Copy User ID**

## Step 3: Invite the Bot

In the Developer Portal:

1. Open **OAuth2 -> URL Generator**
2. Select these scopes:

- `bot`
- `applications.commands`

3. Grant the permissions you need:

| Permission | Purpose |
| --- | --- |
| Send Messages | Text replies |
| Read Message History | Conversation context |
| Attach Files | File delivery |
| Embed Links | Rich responses |
| Connect | Voice channels |
| Speak | Voice output |
| Use Voice Activity | Voice activity detection |

4. Open the generated URL and authorize the bot into your server

## Step 4: Run the Gateway

```bash
hermes gateway setup
hermes gateway start
```

Choose **Discord** during setup.

## Voice Channel Support

Hermes can join Discord voice channels for spoken interaction.

### Voice Commands

| Command | Purpose |
| --- | --- |
| `/voice join` | Join your current voice channel |
| `/voice leave` | Leave the current voice channel |
| `/voice status` | Show connection and provider status |

### Typical Flow

1. Join a voice channel yourself
2. Run `/voice join` in a text channel
3. Hermes joins the same voice channel
4. Speak normally and let Hermes respond
5. Run `/voice leave` when done

### Required Voice Permissions

- **Connect**
- **Speak**
- **Use Voice Activity**

## DMs and Server Channels

### Direct Messages

Open a DM with the bot and start chatting directly.

### Server Channels

You can trigger Hermes in a server by:

1. Mentioning the bot:

```text
@HermesAgent Help me review this code
```

2. Using a dedicated channel if your server is configured that way

## Slash Commands

Hermes Discord bots typically expose:

| Command | Purpose |
| --- | --- |
| `/new` | Start a new session |
| `/reset` | Reset the current session |
| `/model` | Switch models |
| `/voice join` | Join voice |
| `/voice leave` | Leave voice |
| `/voice status` | Show voice state |
| `/help` | Show help |

## Troubleshooting

**The bot is online but does not respond**

- Make sure **Message Content Intent** is enabled
- Confirm your user ID is in `DISCORD_ALLOWED_USERS`
- In channels, make sure you are mentioning the bot when required

**The bot cannot join voice**

- Check **Connect** and **Speak** permissions
- Confirm the bot is invited to the server, not only available via DM
- Check whether the voice channel is full

**Slash commands do not appear**

- Ensure the invite URL included `applications.commands`
- Wait a few minutes for Discord to sync commands
