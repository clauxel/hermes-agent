---
title: "Context Files"
source: https://hermes-agent.nousresearch.com/docs/guides/use-soul-with-hermes/
mirrored_at: 2026-04-12T01:11:32Z
---
# Context Files

Context files are Markdown files that Hermes Agent automatically loads into the conversation context to provide project-specific rules, conventions, and background information.

## File Priority

Hermes looks for context files in the working directory and parent directories in this order:

```text
.hermes.md    -> highest priority, Hermes-specific
AGENTS.md     -> shared multi-agent conventions
CLAUDE.md     -> Claude Code compatibility
.cursorrules  -> Cursor compatibility, lowest priority
```

If multiple files exist at the same level, Hermes loads all of them. Higher-priority files win when instructions conflict.

### Priority Summary

| File | Priority | Typical use |
| --- | --- | --- |
| `.hermes.md` | Highest | Hermes-only project rules |
| `AGENTS.md` | High | Shared team guidance across tools |
| `CLAUDE.md` | Medium | Migration from Claude Code conventions |
| `.cursorrules` | Low | Reuse existing Cursor project rules |

## `SOUL.md`: Global Personality Configuration

`~/.hermes/SOUL.md` is a special global context file that defines Hermes Agent's baseline personality and behavior across all projects.

Example:

```markdown
<!-- ~/.hermes/SOUL.md -->

# Hermes Soul

You are a pragmatic, efficient engineering assistant.

## Communication Style
- Keep answers concise and direct
- Prefer actionable commands and code
- Ask clarifying questions only when needed
- Reply in Chinese unless the user clearly prefers English

## Working Principles
- Prioritize safety, maintainability, and testability
- Be honest about uncertainty
- Respect the user's technical judgment
- Surface risks proactively

## Avoid
- Empty praise or filler language
- Over-explaining completed work
- Recommending tools you cannot support well
```

`SOUL.md` is loaded before project-specific context files and acts as the global baseline.

## Size Limits

To avoid context bloat, Hermes enforces size limits:

| File type | Limit |
| --- | --- |
| Root-level context file | 20,000 characters |
| Nested context file | 8,000 characters |

Content beyond those limits is truncated and a warning is logged.

### Multi-Directory Loading

Hermes walks upward from the working directory and collects all matching context files:

```text
~/projects/my-app/
  .hermes.md
  backend/
    .hermes.md
    api/
      .hermes.md
  frontend/
    .hermes.md
```

If Hermes is working in `backend/api/`, it loads:

1. `~/projects/my-app/.hermes.md`
2. `~/projects/my-app/backend/.hermes.md`
3. `~/projects/my-app/backend/api/.hermes.md`

## Prompt Injection Protection

Hermes scans context files to reduce prompt injection risk. It looks for patterns such as:

- Fake system messages such as `[SYSTEM]` or `<system>`
- Role override instructions such as "you are now..." or "ignore previous instructions"
- Privilege escalation attempts such as "you have permission..." or "run without confirmation"

If a file looks suspicious, Hermes can:

1. Refuse to load it
2. Show a warning to the user
3. Write an event to the security log

```bash
cat ~/.hermes/logs/security.log
```

## Example Project-Specific Context Files

### Go Backend Project (`.hermes.md`)

```markdown
# Project: new-api

## Stack
- Go 1.22+, Gin, GORM v2
- Databases: SQLite / MySQL / PostgreSQL
- Frontend: React 18 + Vite + Semi Design

## Coding Rules

### JSON
Use wrappers from `common/json.go`:
- `common.Marshal()`
- `common.Unmarshal()`
- Do not import `encoding/json` directly

### Database
- Prefer GORM over raw SQL
- Handle cross-database compatibility carefully
- Test migrations against all supported databases

### Request DTOs
Optional fields should use pointer types such as `*int` or `*bool` together with `omitempty`

## Architecture
Router -> Controller -> Service -> Model
Do not skip layers

## Forbidden
- Do not modify protected project identifiers
- Do not commit `.env`
- Do not rely on MySQL-only functions without PostgreSQL equivalents
```

### Python Data Project (`.hermes.md`)

```markdown
# Project: data-pipeline

## Environment
- Python 3.11+, managed with uv
- pandas, polars, scikit-learn, matplotlib
- DuckDB locally, S3 in production

## Code Standards
- All public functions must have type hints
- Use Google-style docstrings
- Tests use pytest with >80% coverage
- Format with `ruff format` and validate with `ruff check`

## Data Processing
- Prefer Polars for large datasets
- Avoid `pandas.apply` inside loops
- Keep data pipelines idempotent

## Structure
src/
  ingestion/
  processing/
  analysis/
  visualization/
```

### React Frontend Project (`AGENTS.md`)

```markdown
# Frontend Agent Guidelines

## Stack
- React 18 + TypeScript 5
- Vite 5
- Tailwind CSS + shadcn/ui
- Zustand
- React Query

## Components
- Prefer function components and hooks
- Use `ComponentNameProps` for prop interfaces
- Keep one directory per component

## Styling
- Prefer Tailwind utility classes
- Build mobile-first
- Use CSS variables for dark mode instead of hard-coded values

## Avoid
- Class components
- Inline styles unless truly dynamic
- Calling `fetch` directly inside UI components
```

## Debug Context Loading

To see which files Hermes actually loaded:

```bash
hermes chat --debug-context
```

Example output:

```text
[Context] Loaded SOUL.md (1,234 chars)
[Context] Loaded /home/user/projects/my-app/.hermes.md (3,456 chars)
[Context] Loaded /home/user/projects/my-app/backend/.hermes.md (1,789 chars)
[Context] Total context files: 3 files, 6,479 chars
```

## Best Practices

1. Keep context files compact and focused
2. Use clear headings so Hermes can find the right rule quickly
3. Prefer concrete instructions over vague principles
4. Update context files as the project evolves
5. Put global rules at the repository root and local rules in subdirectories
