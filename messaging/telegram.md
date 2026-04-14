---
title: "Telegram Integration"
source: https://hermes-agent.nousresearch.com/docs/user-guide/messaging/telegram/
mirrored_at: 2026-04-12T01:11:32Z
---
# Telegram Integration

Telegram is one of the most common Hermes gateway targets. It supports text, voice messages, images, files, and group chats.

## Prerequisites

- Hermes Agent is installed
- You have a Telegram account
- You can access Telegram from your network

## Step 1: Create a Telegram Bot

1. Open [@BotFather](https://t.me/BotFather)
2. Run:

```text
/newbot
```

3. Choose a bot display name and a username ending in `bot`
4. Save the returned bot token, which looks like:

```text
123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 2: Get Your Telegram User ID

1. Open [@userinfobot](https://t.me/userinfobot)
2. Send any message
3. Copy the numeric user ID it returns

## Step 3: Configure Environment Variables

Edit `~/.hermes/.env`:

```bash
TELEGRAM_BOT_TOKEN=123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_ALLOWED_USERS=123456789,987654321
```

## Step 4: Run the Gateway Setup Wizard

```bash
hermes gateway setup
```

Choose **Telegram** when prompted.

## Step 5: Start the Gateway

```bash
hermes gateway start
```

Now send a message to the bot in Telegram to start chatting.

## Supported Features

| Feature | Notes |
| --- | --- |
| Text messages | Fully supported |
| Voice messages | Transcribed and processed automatically |
| Images | Supported with a vision-capable model |
| Files | Documents and code attachments are supported |
| Chat commands | `/new`, `/reset`, `/model`, `/help`, and more |
| Long replies | Split automatically when needed |
| Code blocks | Formatted cleanly for Telegram display |

## Group Support

Hermes also works in Telegram groups:

1. Add the bot to the group
2. Give it permission to send messages
3. Obtain the group ID if needed
4. Mention the bot to trigger it:

```text
@MyHermesBot Summarize today's meeting notes
```

If you want the bot to respond to all group messages instead of only mentions, disable privacy mode in BotFather:

```text
/setprivacy -> select your bot -> Disable
```

## Recommended BotFather Settings

Improve discoverability by setting commands and a description:

```text
/setcommands
new - Start a new conversation
reset - Reset the current session
model - Switch models
help - Show help

/setdescription
A personal AI assistant powered by Hermes Agent

/setjoingroups -> Enable
```

## Troubleshooting

**The bot does not reply**

- Check `TELEGRAM_BOT_TOKEN`
- Make sure your user ID is in `TELEGRAM_ALLOWED_USERS`
- Run `hermes gateway status`
- Run `hermes doctor`

**Message delivery fails**

- Make sure `api.telegram.org` is reachable
- Confirm the bot is still active in BotFather

**How do I restrict access?**

- Put only approved user IDs in `TELEGRAM_ALLOWED_USERS`
- Unlisted users will be denied or ignored depending on policy
