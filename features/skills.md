---
title: "Skills"
source: https://hermes-agent.nousresearch.com/docs/user-guide/features/skills/
mirrored_at: 2026-04-12T01:11:32Z
---
# Skills

Skills are one of Hermes Agent's core extension mechanisms. They package reusable workflows as structured knowledge that Hermes can load on demand.

## Three-Stage Progressive Loading

### L0: Skill Summary List

At session start, Hermes loads only a compact list of installed skills. Each skill contributes a name, a short description, and a few tags. This keeps context usage low while still telling Hermes what is available.

Example:

```text
Available skills:
- research: deep information gathering and synthesis [research, web, analysis]
- coding: software development and debugging [dev, python, typescript]
- document-writer: technical documentation drafting [writing, markdown, docs]
```

### L1: Full `SKILL.md`

When Hermes decides a skill is relevant, it loads that skill's full `SKILL.md`, including usage guidance, procedures, pitfalls, and verification steps.

### L2: Referenced Files

If the skill depends on external materials, Hermes can continue by loading relevant files from directories such as `references/`, `templates/`, or `scripts/`.

## `SKILL.md` Format

Each skill is centered around a `SKILL.md` file with frontmatter metadata:

```markdown
---
name: research
description: Deep research and synthesis across multiple sources
version: 1.2.0
platforms:
  - hermes-cli
  - hermes-telegram
metadata:
  tags:
    - research
    - web
    - analysis
  category: productivity
  config:
    max_sources: 10
    default_depth: 3
    citation_style: apa
---

## When to Use

Use this skill when the user needs deep topic research, such as:
- Technical investigations
- Literature reviews
- Market analysis
- Fact checking

## Procedure

1. Clarify the research objective
2. Define a search strategy
3. Use `web_search` for discovery
4. Use `web_extract` for close reading
5. Cross-check critical facts
6. Produce a structured report

## Pitfalls

- Do not rely on a single source
- Check freshness and publication dates
- Separate facts from opinions
- Treat AI-generated content critically

## Verification

- [ ] Every key fact has at least two independent sources
- [ ] Publication dates are acceptable
- [ ] The report structure is clear
- [ ] Sources are cited
```

### Frontmatter Fields

| Field | Type | Required | Purpose |
| --- | --- | --- | --- |
| `name` | string | Yes | Unique skill ID used in commands |
| `description` | string | Yes | Short L0 summary |
| `version` | string | Yes | Semantic version |
| `platforms` | array | No | Supported platforms; empty means all |
| `metadata.tags` | array | No | Search and filtering tags |
| `metadata.category` | string | No | Category name |
| `metadata.config` | object | No | Skill-specific configuration |

## Install Sources and Trust Levels

Hermes supports multiple installation sources with a simple trust model.

### Trust Levels

```text
builtin > official > trusted > community
```

| Level | Meaning | Auto execution |
| --- | --- | --- |
| `builtin` | Built into Hermes | Yes |
| `official` | Published by the project | Yes |
| `trusted` | Reviewed third-party source | Yes, usually with confirmation |
| `community` | General community contribution | No, explicit approval recommended |

### Installation Sources

Current official Skills Hub examples:

```bash
hermes skills browse
hermes skills browse --source official
hermes skills search kubernetes
hermes skills inspect openai/skills/k8s
hermes skills install openai/skills/k8s
hermes skills install official/security/1password
hermes skills install well-known:https://mintlify.com/docs/.well-known/skills/mintlify
```

## Directory Structure

Skills are stored under `~/.hermes/skills/`, usually grouped by category:

```text
~/.hermes/skills/
  productivity/
    research/
      SKILL.md
      references/
        search-strategy.md
        citation-template.md
      templates/
        research-report.md
      scripts/
        extract-citations.py
      assets/
  development/
    coding/
      SKILL.md
    code-review/
      SKILL.md
  writing/
    document-writer/
      SKILL.md
```

## Skill Management Commands

### Browse and Search

```bash
hermes skills browse
hermes skills search "data analysis"
hermes skills inspect openai/skills/k8s
hermes skills list --source hub
```

### Install and Update

```bash
hermes skills install openai/skills/k8s
hermes skills check
hermes skills update
hermes skills audit
hermes skills uninstall k8s
```

### Create and Edit

```bash
hermes skills publish skills/my-skill --to github --repo owner/repo
```

### Manage Skill Content by Chat

Hermes can also manage skills through conversation:

```text
Create a new skill named "data-pipeline" for recurring data engineering tasks
Modify the research skill to add academic database search steps
Add a Python best-practices reference file to the coding skill
```

Typical underlying operations include `create`, `patch`, `edit`, `delete`, and `write_file`.

## Preload Skills

### Preload from the Command Line

Using `-s` skips discovery and loads the selected skills immediately at L1:

```bash
hermes -s research
hermes -s research,coding,document-writer
hermes -s coding --toolsets "terminal,file,browser"
```

### Preload by Default

```yaml
# ~/.hermes/config.yaml
skills:
  preload:
    - research
    - coding
```

## Skills Toolset

If you enable the `skills` toolset, Hermes can install and manage skills during a task:

```bash
hermes chat --toolsets "skills"
```

## Example Custom Skill

Here is a complete Go code review skill:

```markdown
---
name: go-code-review
description: Go code review specialist focused on performance, safety, and Go idioms
version: 1.0.0
platforms:
  - hermes-cli
metadata:
  tags:
    - golang
    - code-review
    - dev
  category: development
  config:
    check_security: true
    check_performance: true
    go_version: "1.22"
---

## When to Use

Use this skill when reviewing Go code or performing a self-check after implementation.

## Procedure

1. Read the target file or code snippet
2. Review structure and organization
3. Check error handling
4. Check concurrency safety
5. Evaluate performance
6. Confirm Go idioms and formatting
7. Review test coverage
8. Produce a structured review report

## Pitfalls

- Do not over-focus on style issues that `gofmt` already handles
- Separate must-fix issues from optional improvements
- Consider the real runtime context

## Verification

- [ ] All returned errors are handled
- [ ] No obvious data race risk
- [ ] Critical paths have benchmarks
- [ ] Public APIs have doc comments
```

Install it:

```bash
mkdir -p ~/.hermes/skills/development/go-code-review
cp go-code-review/SKILL.md ~/.hermes/skills/development/go-code-review/
hermes skills show go-code-review
```
