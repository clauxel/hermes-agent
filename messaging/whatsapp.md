---
title: "WhatsApp Integration"
source: https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp/
mirrored_at: 2026-04-12T01:11:32Z
---
# WhatsApp Integration

Hermes can connect to WhatsApp through a WhatsApp Web bridge, so you can talk to your agent directly from WhatsApp.

---

## Requirements

- Hermes is installed and running
- You have a WhatsApp account linked to a phone number
- **Node.js v22 or later** is installed for the bridge dependency
- Your phone stays online, because the bridge depends on the mobile device connection

### Install Node.js v22

```bash
# Using nvm (recommended)
nvm install 22
nvm use 22

# Verify the version
node --version  # should print v22.x.x
```

---

## Setup

### Step 1: Start the WhatsApp setup flow

```bash
hermes whatsapp
```

This command launches the interactive setup wizard and walks you through the pairing process.

### Step 2: Scan the QR code

1. After the command starts, Hermes displays a **QR code** in the terminal.
2. Open WhatsApp on your phone.

   - iOS: `Settings -> Linked Devices -> Link a Device`
   - Android: `Menu -> Linked Devices -> Link a Device`
3. Scan the QR code shown in the terminal.
4. Wait for the pairing confirmation message.

### Step 3: Configure approved users

Edit `~/.hermes/.env` and add the phone numbers that are allowed to use the bot. Use international format without the `+` sign:

```bash
WHATSAPP_ALLOWED_USERS=8613800138000,8613900139000
```

For mainland China phone numbers, use `86` followed by the number without a leading `0`, for example `8613812345678`.

### Step 4: Start the gateway

```bash
hermes gateway start
```

---

## How It Works

After pairing is complete, send a WhatsApp message to the linked bot account from an approved number to begin chatting.

### Supported features

| Feature | Notes |
| --- | --- |
| Text messages | Fully supported |
| Voice messages | Transcribed to text automatically before processing |
| Images | Supported when you use a vision-capable model |
| Documents | Supports PDFs, text files, and similar attachments |
| Chat commands | Supports `/new`, `/reset`, `/model`, and `/help` |

---

## Important Notes

### WhatsApp terms and account safety

The WhatsApp bridge relies on a non-official WhatsApp Web API layer. That means:

- WhatsApp may detect automation and restrict the account
- It is safer to use a dedicated phone number instead of your primary personal account
- Avoid high-volume or highly repetitive messaging patterns

### Keep your phone online

The bridge depends on your phone maintaining a live connection to WhatsApp. If the phone goes offline or WhatsApp is suspended in the background, the session may disconnect and require re-pairing.

### QR code expiration

QR codes usually expire after about 60 seconds. If you miss the window, run `hermes whatsapp` again to generate a fresh code.

---

## Re-Pairing

If you need to pair again, for example after changing phones or losing the connection:

```bash
# Remove the old session data
rm -rf ~/.hermes/whatsapp-session/

# Start pairing again
hermes whatsapp
```

---

## Troubleshooting

**The connection drops right after I scan the QR code**

- Make sure WhatsApp on your phone stays active in the foreground or background
- Check that your phone network is stable
- On some Android devices, aggressive battery-saving modes can kill the WhatsApp background process

**Hermes says the Node.js version is incompatible**

- Verify your version with `node --version`
- Switch to Node.js 22 with `nvm use 22`

**Messages are delivered, but Hermes does not reply**

- Make sure your number is listed in `WHATSAPP_ALLOWED_USERS`
- Run `hermes gateway status` to confirm the gateway is online
- Run `hermes doctor` to diagnose configuration or runtime issues
