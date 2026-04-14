---
title: "Scheduled Tasks"
source: https://hermes-agent.nousresearch.com/docs/guides/automate-anything-with-cron/
mirrored_at: 2026-04-12T01:11:32Z
---
# Scheduled Tasks

Hermes Agent includes a built-in scheduling system that lets you describe recurring work in natural language and have Hermes run it automatically.

## Natural-Language Scheduling

Unlike traditional cron-only workflows, Hermes lets you describe schedules in plain language:

```text
Every morning at 9, check my email and summarize anything important
```

```text
Every Monday, send this week's work plan to Telegram
```

```text
Check server health every 30 minutes and alert me if anything is wrong
```

Hermes converts the description into its internal schedule format and saves it persistently.

## `hermes cron` Subcommands

### `list`

```bash
hermes cron list
```

Example output:

```text
ID    NAME                  SCHEDULE          STATUS    LAST RUN              NEXT RUN
---   -------------------   ---------------   -------   -------------------   -------------------
1     daily-email-summary   0 9 * * *         active    2025-04-07 09:00:05   2025-04-08 09:00:00
2     weekly-report         0 9 * * 1         active    2025-04-07 09:00:12   2025-04-14 09:00:00
3     server-monitor        */30 * * * *      paused    2025-04-07 08:30:00   -
4     db-backup             0 2 * * *         active    2025-04-07 02:00:03   2025-04-08 02:00:00
```

### `create`

```bash
# Natural language
hermes cron create "Back up the database every day at 2 AM"

# Explicit cron expression
hermes cron create --schedule "0 2 * * *" --name "db-backup" "Back up the database and upload it to S3"

# With execution settings
hermes cron create \
  --schedule "0 9 * * 1-5" \
  --name "daily-standup" \
  --profile work \
  "Summarize yesterday's git commits and draft today's work plan"
```

### `edit`

```bash
# Edit interactively
hermes cron edit 1

# Update the schedule directly
hermes cron edit 1 --schedule "0 10 * * *"
```

### `pause`

```bash
# Pause by ID
hermes cron pause 3

# Pause by name
hermes cron pause server-monitor
```

Paused tasks keep their configuration but stop running until resumed.

### `resume`

```bash
hermes cron resume 3
hermes cron resume server-monitor
```

### `run`

Run a task immediately instead of waiting for the next scheduled time:

```bash
hermes cron run 1
hermes cron run daily-email-summary
```

### `remove`

```bash
hermes cron remove 3
hermes cron remove server-monitor

# Remove all paused tasks
hermes cron remove --paused
```

### `status`

```bash
hermes cron status 1
```

Example output:

```text
Task: daily-email-summary (ID: 1)
Schedule: 0 9 * * * (every day at 09:00)
Status: active
Created: 2025-04-01 10:23:45
Last Run: 2025-04-07 09:00:05 (success, 23s)
Next Run: 2025-04-08 09:00:00
Run Count: 7
Success Rate: 100%
```

### `tick`

Manually trigger the scheduler check loop:

```bash
hermes cron tick
```

This is mainly useful for testing and debugging.

## Schedule Examples

### Daily Automation

```bash
# Morning news digest
hermes cron create "Every day at 7:30 AM, search for technology news and send the summary to Telegram"

# End-of-day reminder
hermes cron create --schedule "0 18 * * 1-5" "Remind me to organize today's work notes before I finish for the day"

# Monthly report
hermes cron create --schedule "0 9 1 * *" "Generate last month's work summary report"
```

### System Monitoring

```bash
hermes cron create --schedule "*/5 * * * *" \
  --name "health-check" \
  "Check whether the API service is healthy and send an alert if it is not"

hermes cron create --schedule "0 8 * * *" \
  "Check server disk usage and alert me when it exceeds 80%"
```

### Data Processing

```bash
hermes cron create --schedule "0 * * * *" \
  --name "data-sync" \
  "Fetch the latest data from the upstream API and update the local database"

hermes cron create --schedule "0 3 * * *" \
  "Delete files in /tmp that are older than 24 hours"
```

### Content Creation

```bash
hermes cron create --schedule "0 17 * * 5" \
  --name "weekly-report" \
  "Summarize this week's work, save a Markdown report to ~/reports/"

hermes cron create "Every day at 10 AM, turn the latest technology news into three short social posts"
```

## Execution Environment

### Session Isolation

Every scheduled task runs in its own isolated session with:

- Its own conversation history
- The profile and toolsets active when the task was created, unless overridden
- A separate task identity and execution record

### Toolset Configuration

You can choose toolsets explicitly:

```bash
hermes cron create \
  --toolsets "web,terminal,file" \
  --schedule "0 6 * * *" \
  "Download yesterday's stock data and generate an analysis report"
```

### Notifications

Task outcomes can be sent through a configured delivery channel:

```yaml
# ~/.hermes/config.yaml
cron:
  notification:
    on_success: false
    on_failure: true
    channel: telegram
```

## Cron Expression Reference

Hermes supports standard cron expressions in addition to natural language:

```text
min  hour  day  month  weekday
*    *     *    *      *

Examples:
0 9 * * *       # every day at 09:00
*/30 * * * *    # every 30 minutes
0 9 * * 1-5     # weekdays at 09:00
0 0 1 * *       # first day of every month
0 2 * * 0       # every Sunday at 02:00
```

## Persistence

Cron configuration is stored in `~/.hermes/state.db` and restored automatically after restart.

```bash
# Export all scheduled tasks
hermes cron list --export > my-crons.json

# Restore from backup
hermes cron import my-crons.json
```
