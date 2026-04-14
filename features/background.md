---
title: "Background Work"
source: https://hermes-agent.nousresearch.com/docs/
mirrored_at: 2026-04-14T00:00:00Z
---
# Background Work

This page replaces an older mirror that described a `/background` slash command in detail.

For ordinary developers, the important thing to know is:

- older Hermes documentation sometimes mentioned `/background`
- current official Hermes docs focus more on **cron**, **delegation**, **sessions**, and normal long-running terminal processes

If your installed version still exposes `/background`, treat it as **version-specific behavior** and verify it with `hermes --help`, in-chat `/help`, or the current official docs.

## Recommended Modern Patterns

### 1. Scheduled Work

Use cron for recurring autonomous jobs:

```bash
hermes cron list
hermes cron create
hermes cron run <task-id>
```

Good for:

- daily summaries
- health checks
- periodic research
- automated reporting

### 2. Parallel or Delegated Work

For multi-step tasks inside an active conversation, use the current delegation tooling and toolsets documented in the official docs.

Related topics:

- [Tools](tools.md)
- [Sessions](sessions.md)
- [Skills](skills.md)

### 3. Long-Running Shell Jobs

If the real work is a shell command, use a durable environment:

- `tmux`
- `screen`
- `systemd`
- Docker / SSH / Modal / Daytona terminal backends

This is often more reliable than inventing a separate background-session abstraction.

### 4. Messaging Gateway as a Long-Running Service

When Hermes should stay available outside the terminal:

```bash
hermes gateway run
```

Or install it as a service:

```bash
hermes gateway install
hermes gateway start
```

## Practical Guidance

If you are deciding between several ways to run work in the background:

- use `hermes cron` for scheduled repeatable tasks
- use gateway service mode for always-on messaging access
- use terminal/process managers for heavy shell workloads
- use sessions and delegation for iterative agent work

## Current Recommendation

Do not build new workflows around the old `/background` documentation unless your installed version clearly supports it. Prefer the officially documented primitives above.
