---
title: "Session Management"
source: https://hermes-agent.nousresearch.com/docs/user-guide/sessions/
mirrored_at: 2026-04-12T01:11:32Z
---
# Session Management

Hermes Agent stores all conversations in SQLite and provides a full lifecycle for browsing, searching, exporting, compressing, and cleaning them up.

## Storage Layout

### Database Location

All session data lives in:

```text
~/.hermes/state.db
```

### Database Schema

```sql
CREATE TABLE sessions (
    id          TEXT PRIMARY KEY,
    name        TEXT,
    created_at  DATETIME,
    updated_at  DATETIME,
    profile     TEXT,
    model       TEXT,
    token_count INTEGER,
    compressed  BOOLEAN
);

CREATE TABLE messages (
    id          TEXT PRIMARY KEY,
    session_id  TEXT REFERENCES sessions(id),
    role        TEXT,
    content     TEXT,
    timestamp   DATETIME,
    token_count INTEGER
);

CREATE VIRTUAL TABLE messages_fts USING fts5(
    content,
    session_id UNINDEXED,
    role UNINDEXED,
    timestamp UNINDEXED,
    content='messages',
    content_rowid='rowid'
);
```

FTS5 makes full-text search fast even with a large history.

## `hermes sessions` Commands

### `list`

```bash
hermes sessions list
hermes sessions list --limit 50
hermes sessions list --profile work
hermes sessions list --since "2025-04-01" --until "2025-04-07"
```

Example output:

```text
ID              NAME                    MODEL                   MESSAGES  TOKENS    UPDATED
-----------     ---------------------   ---------------------   --------  -------   -------------------
abc123def       Go Code Review          claude-opus-4-5         45        12,340    2025-04-07 15:23
xyz789ghi       API Design Discussion   claude-sonnet-4-5       23        6,789     2025-04-07 11:05
mno456pqr       Database Migration      claude-opus-4-5         67        23,456    2025-04-06 18:30
```

### `browse`

```bash
hermes sessions browse
hermes sessions browse --search "PostgreSQL"
```

The interactive browser typically supports:

- Arrow keys for navigation
- `Enter` to open a session
- `/` to search
- `e` to export
- `d` to delete
- `q` to quit

### `export`

```bash
hermes sessions export abc123def
hermes sessions export abc123def --output ~/backups/session-abc123.jsonl
hermes sessions export --all --output ~/backups/all-sessions.jsonl
hermes sessions export abc123def --format markdown --output session.md
hermes sessions export abc123def --format text
```

JSONL example:

```jsonl
{"session_id":"abc123def","role":"user","content":"Review this Go code","timestamp":"2025-04-07T15:00:00Z"}
{"session_id":"abc123def","role":"assistant","content":"Here is the analysis...","timestamp":"2025-04-07T15:00:05Z"}
```

### `delete`

```bash
hermes sessions delete abc123def
hermes sessions delete abc123def --force
hermes sessions delete abc123def xyz789ghi mno456pqr
```

### `prune`

```bash
hermes sessions prune --older-than 30d
hermes sessions prune --older-than 90d --force
hermes sessions prune --keep-latest 100
hermes sessions prune --min-tokens 100
hermes sessions prune --older-than 30d --dry-run
```

### `stats`

```bash
hermes sessions stats
```

Example output:

```text
Session Statistics
------------------

Total sessions:      1,234
Total messages:      45,678
Total tokens:        12,345,678

By model:
  claude-opus-4-5      456 sessions (37%)
  claude-sonnet-4-5    678 sessions (55%)
  other                100 sessions (8%)

By time:
  today:         3 sessions
  this week:    23 sessions
  this month:   89 sessions
  older:      1,119 sessions

Storage:
  state.db size:       234 MB
  average session:     194 KB
```

### `rename`

```bash
hermes sessions rename abc123def "Go Code Review - April 2025"
```

## Resuming Sessions

### Continue the Last Session

```bash
hermes --continue
hermes -c
```

### Resume a Specific Session

```bash
hermes --resume abc123def
hermes --resume "Go Code Review"
```

## Automatic Compression

### How It Works

When a session becomes too large, Hermes can compress older turns:

1. Summarize older conversation history
2. Replace detailed early turns with the summary
3. Keep the most recent turns intact
4. Continue the session normally

### Configure Compression

```yaml
# ~/.hermes/config.yaml
session:
  auto_compress: true
  compress_threshold: 0.5
  compress_keep_recent: 20
  compress_model: claude-haiku-4-5
```

### Compress Manually

```bash
/compress
hermes sessions compress abc123def
```

## Session Search

Use FTS5-powered search across all history:

```bash
hermes sessions browse --search "PostgreSQL migration"
```

Or ask within a conversation:

```text
Search our past chats for anything about Docker deployment
```

## Backup and Migration

### Back Up the Database

```bash
cp ~/.hermes/state.db ~/backup/hermes-state-$(date +%Y%m%d).db
hermes sessions export --all --output ~/backup/sessions-$(date +%Y%m%d).jsonl
```

### Move to Another Machine

```bash
# Old machine
hermes sessions export --all --output sessions-backup.jsonl
scp sessions-backup.jsonl newmachine:~/

# New machine
hermes sessions import sessions-backup.jsonl
```

### Database Maintenance

```bash
hermes sessions vacuum
hermes sessions check
```
