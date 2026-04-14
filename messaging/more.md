---
title: "More Platforms"
source: https://hermes-agent.nousresearch.com/docs/user-guide/messaging/
mirrored_at: 2026-04-12T01:11:32Z
---
# More Platforms

In addition to the primary messaging platforms, Hermes can integrate with a wider range of services. In most cases, you configure them with `hermes gateway setup` and start them with `hermes gateway start`.

---

## Signal

Signal is a privacy-focused encrypted messaging platform. It is a good fit for teams or individuals who care deeply about secure communication.

**Requirements**

- A dedicated phone number registered with Signal
- A bridge layer such as [signal-cli](https://github.com/AsamK/signal-cli) or [signal-cli-rest-api](https://github.com/bbernhard/signal-cli-rest-api)

**Environment variables**

```bash
SIGNAL_PHONE_NUMBER=+8613812345678
SIGNAL_ALLOWED_USERS=+8613900139000
```

---

## SMS (Twilio)

With Twilio, Hermes can receive and respond to plain SMS messages, so users can interact without installing any extra app.

**Requirements**

- A [Twilio](https://www.twilio.com/) account with a purchased phone number
- A Twilio webhook configured to point at the Hermes gateway

**Environment variables**

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_ALLOWED_USERS=+8613812345678
```

**Best for**

- Users without smartphones
- Internal tools that need broad reach through standard text messaging
- Non-technical stakeholders who prefer SMS over chat apps

---

## Email

Hermes can also work over email. You send a message to the bot mailbox, and Hermes replies by email.

**Requirements**

- A dedicated mailbox, such as Gmail, Outlook, or a self-hosted mail server
- Working SMTP for sending mail and IMAP for receiving it

**Environment variables**

```bash
EMAIL_ADDRESS=hermes-bot@example.com
EMAIL_PASSWORD=your-app-password
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_IMAP_HOST=imap.gmail.com
EMAIL_IMAP_PORT=993
EMAIL_ALLOWED_SENDERS=you@example.com,colleague@example.com
```

**Tip**

For Gmail, use an app password rather than your normal account password.

---

## Home Assistant

Hermes can integrate with [Home Assistant](https://www.home-assistant.io/) to support smart-home workflows, voice interactions, and automations.

**Requirements**

- A running Home Assistant instance
- A Home Assistant long-lived access token

**Environment variables**

```bash
HOME_ASSISTANT_URL=http://192.168.1.100:8123
HOME_ASSISTANT_TOKEN=eyJhbGciOiJIUzI1NiJ9...
```

**Common use cases**

- Talk to Hermes through Assist or another voice workflow
- Trigger analysis from automations
- Combine home control with natural-language reasoning

---

## Mattermost

Mattermost is an open-source team chat platform that can be self-hosted, which makes it a strong choice for organizations with data residency or compliance requirements.

**Requirements**

- A Mattermost server, typically v7.0 or later
- A bot account access token

**Environment variables**

```bash
MATTERMOST_URL=https://mattermost.your-company.com
MATTERMOST_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
MATTERMOST_ALLOWED_USERS=username1,username2
```

---

## Matrix

Matrix is a decentralized, open communication protocol with end-to-end encryption support and a growing ecosystem of clients such as Element and Cinny.

**Requirements**

- A Matrix account on `matrix.org` or a self-hosted homeserver
- An access token for the bot account

**Environment variables**

```bash
MATRIX_HOMESERVER=https://matrix.org
MATRIX_USER_ID=@hermes-bot:matrix.org
MATRIX_ACCESS_TOKEN=syt_xxxxxxxxxxxxxxxxxx
MATRIX_ALLOWED_USERS=@you:matrix.org
```

---

## DingTalk

DingTalk is Alibaba's enterprise collaboration platform and is widely used inside Chinese companies.

**Requirements**

- An internal enterprise app created in the DingTalk developer platform
- The bot application's `AppKey` and `AppSecret`

**Environment variables**

```bash
DINGTALK_APP_KEY=dingxxxxxxxxxxxxxxxx
DINGTALK_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DINGTALK_ALLOWED_USERS=user1,user2
```

**Setup outline**

1. Sign in to the [DingTalk developer platform](https://open.dingtalk.com/).
2. Create an internal enterprise app.
3. Enable messaging permissions.
4. Copy the `AppKey` and `AppSecret` into your Hermes environment.

---

## Feishu / Lark

Feishu (mainland China) and Lark (international) are ByteDance collaboration platforms used for internal messaging, automation, and workflow integration.

**Requirements**

- A self-built app in the Feishu/Lark developer platform
- An `App ID` and `App Secret`

**Environment variables**

```bash
FEISHU_APP_ID=cli_xxxxxxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FEISHU_ALLOWED_USERS=ou_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Setup outline**

1. Sign in to the [Feishu developer platform](https://open.feishu.cn/).
2. Create a custom enterprise app.
3. Enable both receive-message and send-message permissions.
4. Configure event subscriptions for message events.

---

## WeCom

WeCom is Tencent's enterprise messaging platform, often used for internal communication and workflow automation in Chinese companies.

**Requirements**

- A WeCom application created in the admin console
- `Corp ID`, `AgentID`, and `Secret`

**Environment variables**

```bash
WECOM_CORP_ID=ww_xxxxxxxxxxxxxxxx
WECOM_AGENT_ID=1000000
WECOM_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WECOM_TOKEN=xxxxxxxx
WECOM_ENCODING_AES_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Open WebUI

If you prefer working in a browser, Hermes can also be exposed through a web interface without requiring any dedicated desktop or mobile client.

**Requirements**

- The Hermes gateway is running
- Your browser can reach the gateway address

**Access**

```bash
# Once the gateway is running, open:
http://localhost:8765
```

The web UI offers a ChatGPT-style experience with features such as:

- Multi-session chat management
- File uploads
- Conversation history browsing
- Markdown rendering

---

## Webhook Subscriptions

Webhook subscriptions let outside services such as GitHub, Jira, or monitoring tools send events to Hermes and trigger automated AI handling.

### Create a webhook subscription

```bash
hermes webhook subscribe \
  --prompt "Analyze this GitHub push event and summarize the code changes" \
  --events "push,pull_request,issues" \
  --description "GitHub repository event processing" \
  --skills "code-review" \
  --deliver chat \
  --deliver-chat-id 123456789 \
  --secret my-webhook-secret
```

### Option reference

| Option | Description |
| --- | --- |
| `--prompt` | The prompt Hermes uses when an event arrives |
| `--events` | Comma-separated event types to subscribe to |
| `--description` | A human-readable description of the subscription |
| `--skills` | Comma-separated skills to load for handling the event |
| `--deliver` | How the result is delivered, such as `chat` or `email` |
| `--deliver-chat-id` | The target chat ID for delivery, such as a Telegram user ID |
| `--secret` | A shared secret used to verify webhook signatures |

### Endpoint URL

After you create the subscription, Hermes returns a webhook URL:

```text
https://your-server.example.com/webhook/abc123def456
```

Add that URL to the external service, for example in `GitHub -> Repository Settings -> Webhooks`.

### Example use cases

| Use case | Example setup |
| --- | --- |
| Automated GitHub PR review | Subscribe to `pull_request` events and use a code review prompt |
| Alert triage | Send monitoring alerts to Hermes for analysis and diagnosis suggestions |
| Scheduled data reports | Combine webhook triggers with `hermes cron` tasks for recurring workflows |
| CI/CD failure summaries | Subscribe to build-failure events and let Hermes explain the failure context |
