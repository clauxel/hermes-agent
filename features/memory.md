---
title: "Memory System"
source: https://hermes-agent.nousresearch.com/docs/user-guide/features/memory/
mirrored_at: 2026-04-12T01:11:32Z
---
# Memory System

Hermes Agent includes a persistent memory system so it can keep important information across conversations and deliver more consistent, personalized responses.

## Core Memory Files

Hermes stores its core persistent memory in two Markdown files under `~/.hermes/memories/`.

### `MEMORY.md`

- **Path**: `~/.hermes/memories/MEMORY.md`
- **Limit**: about 2,200 characters
- **Purpose**: agent-side notes such as project state, important discoveries, and durable operating preferences

Example:

```markdown
# Agent Memory

## User Preferences
- Prefers concise answers
- Wants Python examples when possible
- Timezone: Asia/Shanghai

## Project Information
- Current project: new-api (Go + React)
- Databases: SQLite in development, PostgreSQL in production
- Frontend package manager: Bun

## Important Reminders
- API keys live in .env and should never be committed
```

### `USER.md`

- **Path**: `~/.hermes/memories/USER.md`
- **Limit**: about 1,375 characters
- **Purpose**: user profile data such as background, habits, and communication preferences

Example:

```markdown
# User Profile

## Background
- Full-stack developer
- Works with Go, Python, React, and TypeScript
- Preferred working language: Chinese

## Working Style
- Handles hard tasks in the morning
- Likes TDD
- Uses VS Code with Vim keybindings

## Communication Style
- Direct and concise
- Likes code examples
- Does not want excessive politeness
```

## Memory Injection Model

### Frozen Snapshot Injection

At the start of a session, Hermes injects memory as a frozen snapshot:

```text
System prompt
  -> [frozen memory block]
       - MEMORY.md
       - USER.md
  -> dynamic conversation content begins here
       - user messages
       - assistant replies
```

Why use a frozen snapshot?

1. It enables provider-side prefix caching for better cost and latency characteristics
2. It avoids confusing in-session memory shifts while a conversation is underway

### Cross-Session Persistence

- Memory changes are written to disk immediately
- Updated memory becomes part of the injected snapshot in the **next** session
- During the current session, memory tools can still read the latest file contents directly

## Memory Tool Operations

Use the `memory` tool to manipulate persistent memory.

### `add`

Append new information:

```text
Remember that I am building a VitePress documentation site named hermes-docs.
It uses Vue 3 and Vite and is deployed on Vercel.
```

### `replace`

Update existing content through substring matching:

```text
Update the memory entry that says "Database: SQLite" so it now says "Database: PostgreSQL (migrated)"
```

### `remove`

Delete obsolete content:

```text
Remove the memory entry about the old project
```

### View the Files Directly

```bash
cat ~/.hermes/memories/MEMORY.md
cat ~/.hermes/memories/USER.md
```

## External Memory Providers

In addition to local file-based memory, Hermes can integrate with several external providers:

| Provider | Strength | Good fit |
| --- | --- | --- |
| **Honcho** | Shared user modeling across agents | Multi-agent coordination |
| **OpenViking** | Open-source vector memory | Self-hosted privacy-first deployments |
| **Mem0** | Smart extraction and deduplication | Long-term assistant memory |
| **Hindsight** | Feedback-driven memory optimization | Preference learning |
| **Holographic** | High-dimensional vector storage | Rich semantic retrieval |
| **RetainDB** | Relational memory | Structured knowledge |
| **ByteRover** | Lightweight embedded storage | Resource-constrained environments |

### Configure an External Provider

```yaml
# ~/.hermes/config.yaml
memory:
  provider: mem0
  api_key: "your-api-key"
  keep_local: true
```

`keep_local: true` preserves fast access through the local files while using an external provider for richer storage and retrieval.

## Session Search

Beyond `MEMORY.md` and `USER.md`, Hermes also supports conversation-history search using **SQLite FTS5**.

### How It Works

All messages are stored in `~/.hermes/state.db`, and FTS5 indexes make cross-session search fast:

```sql
CREATE VIRTUAL TABLE messages_fts USING fts5(
    content,
    session_id UNINDEXED,
    role UNINDEXED,
    timestamp UNINDEXED
);
```

### Use the `session_search` Tool

```text
Search our past conversations for anything related to the PostgreSQL migration
```

```text
Find the discussion we had last week about API design
```

### Search from the CLI

```bash
hermes sessions browse --search "PostgreSQL"
hermes sessions export --search "API design" --format jsonl
```

For broader session lifecycle operations, see [Session Management](sessions.md).

## Best Practices

### What Belongs in `MEMORY.md`

- Current project context
- Important technical decisions and why they were made
- Common commands or file locations that matter often
- Incomplete tasks and next steps
- Durable working patterns the agent has learned

### What Belongs in `USER.md`

- User background and technical level
- Communication preferences
- Timezone and work habits
- Preferred tools and stack
- Language preferences

### Keep Memory Clean

The file limits are intentionally small, so regular cleanup matters:

```text
Clean up MEMORY.md by removing completed tasks and refreshing the current project status
```

```text
Compress MEMORY.md and keep only the highest-value information
```

## Privacy and Security

- Local memory files stay on disk and are not uploaded automatically
- External memory providers follow their own transport and privacy models
- You can edit or clear memory at any time:

```bash
# Clear all memory
echo "" > ~/.hermes/memories/MEMORY.md
echo "" > ~/.hermes/memories/USER.md

# Back up memory
cp -r ~/.hermes/memories/ ~/backup/hermes-memories-$(date +%Y%m%d)/
```
