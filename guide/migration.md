---
title: "Migration from OpenClaw"
source: https://hermes-agent.nousresearch.com/docs/guides/migrate-from-openclaw
mirrored_at: 2026-04-12T01:11:32Z
---
# Migration from OpenClaw

If you previously used OpenClaw or an older OpenClaw-era Hermes layout, you can migrate to Hermes Agent with the built-in migration tooling in just a few minutes.

## Migration Overview

The `hermes claw migrate` command reads an older OpenClaw-style data directory, converts supported data formats, and writes them into Hermes Agent's layout.

### Supported Data Types

| Data type | OpenClaw / legacy layout location | Hermes Agent location |
| --- | --- | --- |
| Personas | `~/.hermes/personas/` | `~/.hermes/personas/` |
| Memory entries | `~/.hermes/memory/` | `~/.hermes/memories/` |
| Custom skills | `~/.hermes/skills/` | `~/.hermes/skills/` |
| Messaging config | `~/.hermes/messaging.yaml` | `~/.hermes/config.yaml` under `gateway` |
| API credentials | `~/.hermes/.env` | `~/.hermes/.env` |

## Before You Begin

### 1. Make Sure Hermes Agent Is Installed

```bash
hermes doctor
```

All checks should pass before you start the migration.

### 2. Back Up Your Existing Data

The migration tool does not modify the source data, but creating a backup first is still a good idea:

```bash
cp -r ~/.hermes ~/.hermes.backup.$(date +%Y%m%d)
```

### 3. Confirm the Source Directory

The default source directory is `~/.hermes`. If your old OpenClaw-era data lives somewhere else, pass it with `--source`.

## Migration Commands

### Basic Usage

```bash
hermes claw migrate
```

Without arguments, the migrator will:

1. Detect `~/.hermes`
2. Scan for supported data
3. Show a migration plan and request confirmation
4. Execute the migration and print a detailed report

### Full Command Form

```bash
hermes claw migrate [OPTIONS]
```

## Command Options

### `--dry-run`

Preview the plan without writing anything:

```bash
hermes claw migrate --dry-run
```

Example output:

```text
=== Migration Preview (--dry-run, no changes will be made) ===

Source: ~/.hermes
Target: ~/.hermes

Items to migrate:
  [OK] Personas (3)
      - assistant.yaml -> personas/assistant.yaml
      - coder.yaml     -> personas/coder.yaml
      - writer.yaml    -> personas/writer.yaml

  [OK] Memory entries (147)
      - memory.db -> memory/memory.db (SQLite v1 -> v2)

  [OK] Custom skills (12)
      - git_helper.yaml   -> skills/git_helper.yaml
      - daily_report.yaml -> skills/daily_report.yaml
      - ... 10 more

  [OK] Messaging configuration
      - Telegram bot token -> config.yaml (gateway.telegram)
      - Discord bot token  -> config.yaml (gateway.discord)

  [OK] API credentials (5)
      - OPENAI_API_KEY    -> .env
      - ANTHROPIC_API_KEY -> .env
      - ... 3 more

Conflicts detected:
  [WARN] skills/git_helper.yaml already exists in the target directory (use --overwrite)

Planned actions: write 23 files, convert 1 database, merge 1 config file

Run again without --dry-run to execute the migration.
```

Always run a dry run first if you want to understand the impact before changing anything.

### `--preset`

Migrate only a subset of data:

```bash
# Personas, memory, and skills
hermes claw migrate --preset user-data

# Messaging config and API keys only
hermes claw migrate --preset config-only

# Memory only
hermes claw migrate --preset memory-only

# Skills only
hermes claw migrate --preset skills-only

# Everything
hermes claw migrate --preset all
```

| Preset | Includes |
| --- | --- |
| `user-data` | Personas, memory, and custom skills |
| `config-only` | Messaging settings and API keys |
| `memory-only` | Memory database only |
| `skills-only` | Skill files only |
| `all` | All supported data |

### `--overwrite`

By default, existing target files are skipped with a warning. Use `--overwrite` to replace them:

```bash
hermes claw migrate --overwrite
```

> Be careful: `--overwrite` replaces target files without prompting again. If you have already customized the same skills or personas in Hermes Agent, those edits will be lost.

### `--source`

Use a custom source directory:

```bash
hermes claw migrate --source /custom/path/to/hermes
```

### `--target`

Use a custom Hermes Agent destination:

```bash
hermes claw migrate --target /custom/path/to/hermes-agent
```

### Combined Example

```bash
# Preview a user-data migration and allow overwrite
hermes claw migrate --dry-run --preset user-data --overwrite

# Execute it for real
hermes claw migrate --preset user-data --overwrite
```

## Recommended Step-by-Step Migration

### Step 1: Run a Dry Run

```bash
hermes claw migrate --dry-run
```

Pay attention to:

- Conflicting files
- Format conversion notes
- The number of files that will be written

### Step 2: Migrate Credentials

Move the credentials first so Hermes Agent can connect to providers immediately:

```bash
hermes claw migrate --preset config-only
```

Verify that the keys work:

```bash
hermes doctor
hermes chat -q "Hello"
```

### Step 3: Migrate Memory

```bash
hermes claw migrate --preset memory-only
```

Check the result:

```bash
hermes memory list
```

### Step 4: Migrate Skills

```bash
hermes claw migrate --preset skills-only
```

Validate them:

```bash
hermes skills list
hermes -s your_skill_name
```

### Step 5: Migrate Personas

```bash
hermes claw migrate --preset user-data
# If memory and skills are already migrated, this mainly adds personas
```

Verify a persona:

```bash
hermes --persona your_persona_name
```

### Step 6: Reconfigure or Restart the Gateway

Messaging tokens migrate automatically, but the gateway must be restarted for changes to take effect:

```bash
hermes gateway restart
```

Then test the bot on each platform you use.

### Step 7: Validate and Clean Up

Run a final validation pass:

```bash
hermes doctor
hermes config show
hermes skills list
hermes memory list
```

Once everything looks good, keep the backup for a while before deleting the old install.

## Data Format Conversion

### Persona Conversion

Legacy Hermes `.claw` persona files are converted to Hermes Agent YAML:

Legacy format:

```text
[persona]
name = MyAssistant
prompt = You are a helpful assistant...
language = zh
```

Converted format:

```yaml
id: MyAssistant
name: MyAssistant
description: Migrated from Hermes
system_prompt: |
  You are a helpful assistant...
language: zh
```

### Memory Database Conversion

Legacy Hermes stores memory in SQLite v1. Hermes Agent uses a v2 format with vector-index support. The migration tool performs the conversion automatically while preserving the entry content.

### Skill Conversion

Legacy `.skill` files in TOML are converted to Hermes Agent YAML:

Legacy format:

```toml
[skill]
name = "git_summary"
description = "Generate git summary"

[[steps]]
type = "shell"
cmd = "git log --oneline -10"
```

Converted format:

```yaml
name: git_summary
description: Generate git summary
version: "1.0"
migrated_from: hermes

steps:
  - tool: terminal
    command: git log --oneline -10
```

### Messaging Config Conversion

Bot tokens and related settings from `messaging.yaml` are merged into the `gateway` section of Hermes Agent's `config.yaml`.

## Common Migration Issues

### A Skill Fails After Migration

Some legacy skills may reference Hermes-specific commands such as `!claw_search`. Those do not exist in Hermes Agent and need to be replaced with equivalent Hermes Agent tools.

To identify skills that need manual work:

```bash
hermes claw migrate --dry-run 2>&1 | grep "manual attention required"
```

### Migrated API Keys Do Not Work

Some Hermes versions stored API keys in an encrypted form. If the imported key fails, copy the original key manually:

```bash
# Inspect the original file
cat ~/.hermes/.env

# Write the real key into Hermes Agent
hermes config set OPENAI_API_KEY your_actual_key
```

### Memory Migration Is Slow

Large memory databases can take a few minutes to convert. That is normal. If needed, migrate only recent entries first:

```bash
hermes claw migrate --preset memory-only --since 2024-01-01
```

### Webhook URLs Changed

Hermes Agent uses a different webhook path format. Update the endpoint in each external platform after migration:

```text
Old URL: https://your-server.com/hermes/webhook
New URL: https://your-server.com/hermes/gateway/webhook
```

## Need Help?

```bash
# Full help
hermes claw migrate --help

# Generate a migration report
hermes claw migrate --dry-run --verbose > migration_report.txt
```

You can also open an issue on [GitHub Issues](https://github.com/NousResearch/hermes-agent/issues). If you attach `migration_report.txt`, make sure you remove secrets first.
