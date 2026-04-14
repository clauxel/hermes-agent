---
title: "Profiles"
source: https://hermes-agent.nousresearch.com/docs/user-guide/features/personality/
mirrored_at: 2026-04-12T01:11:32Z
---
# Profiles

Profiles are Hermes Agent's isolation mechanism. They let you create fully separate Hermes environments for different projects, clients, or identities.

## What Is a Profile?

Each profile is an isolated Hermes workspace with its own configuration, memory, and session history:

```text
~/.hermes/profiles/
  default/
    config.yaml
    memories/
      MEMORY.md
      USER.md
    state.db
    skills/
  work/
    config.yaml
    memories/
    state.db
  personal/
    config.yaml
    memories/
    state.db
```

Key isolation rule: profiles do **not** share config, memory, or conversation history unless you explicitly move data between them.

## Why Use Multiple Profiles?

### Separate Work and Personal Usage

- A **work** profile can use company APIs, company bots, and work-specific memory
- A **personal** profile can use personal accounts, separate preferences, and different model settings

### Separate Clients

Keep client-specific information isolated:

```bash
hermes -p client-alpha "Analyze this contract"
hermes -p client-beta "Review this repository"
```

### Separate Bots

Different bots often need different tokens and permissions:

```yaml
# work profile config.yaml
telegram:
  token: "bot_token_for_work_bot"

# personal profile config.yaml
telegram:
  token: "bot_token_for_personal_bot"
```

### Safe Experimentation

Clone a profile and test changes without affecting your main setup:

```bash
hermes profile create test-config --clone-all
hermes -p test-config chat
```

## `hermes profile` Commands

### `list`

```bash
hermes profile list
```

Example output:

```text
NAME          ALIAS    SESSIONS   LAST USED             DESCRIPTION
-----------   ------   --------   -------------------   ------------------
* default     -        234        2025-04-07 15:23      Default profile
  work        w        89         2025-04-07 14:00      Work projects
  personal    p        45         2025-04-06 22:30      Personal usage
  client-a    ca       12         2025-04-05 10:15      Client Alpha
```

### `use`

```bash
hermes profile use work
hermes profile use default
```

This switches the default active profile for future Hermes commands.

### `create`

```bash
# Create an empty profile
hermes profile create work

# Clone config only
hermes profile create work-v2 --clone work

# Clone config, memory, and session history
hermes profile create work-backup --clone-all work
```

### `delete`

```bash
hermes profile delete test-config
hermes profile delete test-config --force
```

You cannot delete the currently active profile.

### `show`

```bash
hermes profile show work
```

Example output:

```text
Profile: work
Path: ~/.hermes/profiles/work/
Created: 2025-03-15 10:00:00
Last used: 2025-04-07 14:00:32

Configuration:
  Model: claude-opus-4-5
  Toolsets: web, terminal, file, browser, vision
  Telegram bot: configured

Memory:
  MEMORY.md: 1,834 chars
  USER.md: 987 chars

Sessions:
  Total: 89
  This month: 23
  Database size: 45 MB
```

### `alias`

Use aliases for faster switching:

```bash
hermes profile alias work w
hermes profile alias personal p
hermes profile alias client-alpha ca

hermes -p w chat
hermes -p ca "Review the latest contract"
```

### `rename`

```bash
hermes profile rename test-config experimental
```

### `export`

Export a profile as a portable archive:

```bash
hermes profile export work
hermes profile export work --output ~/backups/work-profile-2025-04.tar.gz
hermes profile export work --no-sessions --output work-config-only.tar.gz
```

### `import`

```bash
hermes profile import work-profile-2025-04.tar.gz
hermes profile import work-profile-2025-04.tar.gz --name work-restored
hermes profile import work-profile-2025-04.tar.gz --overwrite
```

## Using Profiles

### Choose a Profile Per Command

Use `-p` or `--profile` for one-off runs:

```bash
hermes -p work chat
hermes -p w "Review this PR"
hermes -p p cron list
```

### Use an Environment Variable

```bash
export HERMES_PROFILE=work
hermes chat

HERMES_PROFILE=work hermes chat
```

### Shell Aliases

Add shortcuts to your shell config:

```bash
alias hw="hermes -p work"
alias hp="hermes -p personal"
alias hca="hermes -p client-alpha"

hw "Analyze the performance issues in this Go file"
hp "What is on my schedule tomorrow?"
```

## Example Profile Configurations

### Work Profile

```yaml
# ~/.hermes/profiles/work/config.yaml
model: claude-opus-4-5

toolsets:
  - web
  - terminal
  - file
  - browser
  - vision
  - memory
  - todo

telegram:
  token: "${WORK_BOT_TOKEN}"
  allowed_users: [123456789, 987654321]

memory:
  provider: mem0
  api_key: "${MEM0_API_KEY}"

stt:
  provider: groq
  api_key: "${GROQ_API_KEY}"

tts:
  provider: edge_tts
  voice: zh-CN-YunxiNeural
```

### Personal Profile

```yaml
# ~/.hermes/profiles/personal/config.yaml
model: claude-sonnet-4-5

toolsets:
  - web
  - vision
  - tts
  - memory
  - todo
  - cronjob

telegram:
  token: "${PERSONAL_BOT_TOKEN}"

tts:
  provider: edge_tts
  voice: zh-CN-XiaoxiaoNeural
```

## Cross-Profile Operations

Profiles are isolated by default, but some workflows can bridge them deliberately:

```bash
# Export a session from one profile and import it into another
hermes -p work sessions export abc123 | hermes -p personal sessions import

# Sync skills across profiles
hermes profile sync-skills --from work --to personal
```

## Migration and Sharing

Profile export and import are useful for:

- Moving to a new machine
- Sharing a standardized work profile with teammates
- Scheduled backups

Example backup script:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
hermes profile export work --output ~/Dropbox/hermes-backups/work-$DATE.tar.gz
hermes profile export personal --no-sessions --output ~/Dropbox/hermes-backups/personal-config-$DATE.tar.gz
echo "Backup completed: $DATE"
```
