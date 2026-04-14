---
title: "Slack Integration"
source: https://hermes-agent.nousresearch.com/docs/user-guide/messaging/slack/
mirrored_at: 2026-04-12T01:11:32Z
---
# Slack Integration

Hermes can run as a Slack bot for teams that want an AI assistant inside a workspace.

## Prerequisites

- Hermes Agent is installed
- You can create or manage Slack apps in the target workspace

## Step 1: Create a Slack App

1. Open [Slack API Apps](https://api.slack.com/apps)
2. Click **Create New App**
3. Choose **From scratch**
4. Pick a workspace
5. In **OAuth & Permissions**, add these bot scopes:

| Scope | Purpose |
| --- | --- |
| `chat:write` | Send messages |
| `im:history` | Read DM history |
| `im:read` | Read DMs |
| `im:write` | Send DMs |
| `channels:history` | Read public-channel messages |
| `files:read` | Read files |
| `files:write` | Upload files |
| `users:read` | Read user information |

6. Click **Install to Workspace**
7. Copy the **Bot User OAuth Token** that starts with `xoxb-`

## Step 2: Enable Event Subscriptions

1. Open **Event Subscriptions**
2. Turn on **Enable Events**
3. Set the **Request URL** to your Hermes endpoint:

```text
https://your-server.example.com/slack/events
```

4. Subscribe to relevant bot events:

- `message.im`
- `message.channels`
- `app_mention`

## Step 3: Configure Environment Variables

Edit `~/.hermes/.env`:

```bash
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxxxxxxxx
SLACK_SIGNING_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SLACK_ALLOWED_USERS=U01ABC123DE,U01FGH456IJ
```

### Find the Signing Secret

Open the Slack app's **Basic Information** page and copy **Signing Secret**.

### Find a Slack User ID

Open a user's profile, choose **More**, then **Copy member ID**.

## Step 4: Run the Gateway

```bash
hermes gateway setup
hermes gateway start
```

Choose **Slack** during setup.

## How to Use It

### Direct Messages

Open a DM with the bot and message it directly.

### Channels

Mention the bot in a channel:

```text
@HermesAgent Help me analyze the performance of this code
```

### Chat Commands

Slack conversations support the usual built-in commands:

| Command | Purpose |
| --- | --- |
| `/new` | Start a new session |
| `/reset` | Reset the current session |
| `/model` | Switch models |
| `/help` | Show help |

## Enterprise and Internal-Network Notes

If your workspace cannot expose a public endpoint, you have three common options:

- Use [ngrok](https://ngrok.com/) or a Cloudflare Tunnel
- Deploy Hermes on a server with a public IP
- Use Slack **Socket Mode**

### Socket Mode

1. Open **Socket Mode** in your Slack app
2. Enable it
3. Generate an app-level token with the `connections:write` scope
4. Add it to `.env`:

```bash
SLACK_APP_TOKEN=xapp-xxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxxxxxxxx
```

Socket Mode avoids the need for a public webhook URL.

## Troubleshooting

**The bot does not receive messages**

- Make sure the event request URL passed validation
- Or verify that Socket Mode is enabled and `SLACK_APP_TOKEN` is correct

**Permission errors**

- Check that the required scopes were added
- Reinstall the app after changing scopes

**The bot cannot post in a channel**

- Make sure the bot has been invited to that channel
- Use `/invite @HermesAgent` if needed
