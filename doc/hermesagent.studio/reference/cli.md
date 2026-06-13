---
title: "CLI Reference"
source: https://hermesagent.studio/reference/cli
mirrored_at: 2026-04-12T01:11:32Z
---
# CLI Reference

This page summarizes the Hermes Agent command-line interface, including the most important commands, options, and usage patterns.

---

## Global Options

These options work with most Hermes commands:

| Option | Description |
| --- | --- |
| `-h`, `--help` | Show help information |
| `--version` | Show the installed Hermes version |
| `--config <path>` | Use a custom configuration file instead of `~/.hermes/config.yaml` |
| `--profile <name>` | Run the command with a specific profile |

---

## `hermes` / `hermes chat`

Starts an interactive chat session. This is the default command.

```bash
hermes [options]
hermes chat [options]
```

### Options

| Option | Description |
| --- | --- |
| `-q`, `--quiet` | Reduce output and run in a quieter mode |
| `-m`, `--model <model>` | Choose a model such as `claude-3-5-sonnet` or `gpt-4o` |
| `-t`, `--temperature <value>` | Set model temperature, usually between `0.0` and `2.0` |
| `--provider <provider>` | Choose a provider such as `anthropic`, `openai`, or `ollama` |
| `-s`, `--system <prompt>` | Override the system prompt for this run |
| `-v`, `--verbose` | Show more detailed diagnostic output |
| `-Q`, `--query <text>` | Run a single non-interactive query and exit |
| `--checkpoints` | Enable checkpoints for session rollback or recovery |
| `--yolo` | Skip tool-call approvals and auto-approve everything |
| `--max-turns <N>` | Limit the conversation length, default `90` |
| `-c`, `--continue` | Continue the most recent session |
| `-r`, `--resume <session-id>` | Resume a specific session |
| `-w`, `--workspace <dir>` | Set the working directory for the session |

### Examples

```bash
# Start a normal chat session
hermes

# Start with a specific model
hermes -m claude-3-5-sonnet

# Run one prompt and exit
hermes -Q "Summarize today's git changes"

# Continue the last session with a lower turn limit
hermes -c --max-turns 50

# Skip confirmation prompts for tool usage
hermes --yolo
```

---

## `hermes model`

Opens an interactive model selector, grouped by provider, and saves your choice as the default model.

```bash
hermes model
```

---

## `hermes gateway`

Manages messaging gateway services such as Telegram, Discord, Slack, and other integrations.

```bash
hermes gateway <subcommand>
```

| Subcommand | Description |
| --- | --- |
| `setup` | Run the interactive gateway setup flow |
| `install` | Install the gateway as a user service, or use `--system` for a system-wide service |
| `start` | Start the gateway service |
| `stop` | Stop the gateway service |
| `status` | Show gateway status and configured integrations |

### Examples

```bash
hermes gateway setup
hermes gateway install
hermes gateway start
hermes gateway status
sudo hermes gateway install --system
```

---

## `hermes setup`

Runs the first-run setup wizard for API keys, default model selection, terminal backend configuration, and other core settings.

```bash
hermes setup
```

---

## `hermes whatsapp`

Starts the WhatsApp pairing flow. This requires Node.js v22 or later.

```bash
hermes whatsapp
```

For the full setup process, see [WhatsApp Integration](../messaging/whatsapp.md).

---

## `hermes auth`

Manages authentication state, including OAuth tokens and API key status.

```bash
hermes auth
```

---

## `hermes status`

Shows the current Hermes runtime status, including:

- The configured provider and model
- Gateway service state
- Memory system status
- Active sessions

```bash
hermes status
```

---

## `hermes cron`

Manages scheduled tasks so Hermes can run prompts automatically at specific times.

```bash
hermes cron <subcommand>
```

| Subcommand | Description |
| --- | --- |
| `list` | List all scheduled tasks |
| `create` | Create a new scheduled task |
| `edit <task-id>` | Edit an existing task |
| `pause <task-id>` | Pause a task without deleting it |
| `resume <task-id>` | Resume a paused task |
| `run <task-id>` | Run a task immediately |
| `remove <task-id>` | Delete a task |
| `status <task-id>` | Show details and recent execution status for one task |
| `tick` | Trigger the scheduler loop manually for testing or debugging |

### Examples

```bash
hermes cron list
hermes cron create
hermes cron run abc123
```

---

## `hermes webhook`

Creates webhook subscriptions so external events can be routed into Hermes.

```bash
hermes webhook subscribe [options]
```

### `subscribe` options

| Option | Description |
| --- | --- |
| `--prompt <prompt>` | Prompt Hermes should use when an event arrives |
| `--events <event-list>` | Comma-separated list of events to subscribe to |
| `--description <text>` | Human-readable description of the webhook |
| `--skills <skill-list>` | Comma-separated skills to load during processing |
| `--deliver <method>` | Delivery method for results, such as `chat` or `email` |
| `--deliver-chat-id <id>` | Chat ID used for delivery |
| `--secret <secret>` | Shared secret for validating webhook signatures |

### Example

```bash
hermes webhook subscribe \
  --prompt "Analyze this GitHub event and summarize the changes" \
  --events "push,pull_request" \
  --deliver chat \
  --deliver-chat-id 12345678 \
  --secret mywebhooksecret
```

---

## `hermes doctor`

Runs diagnostics to check your Hermes installation, dependencies, network connectivity, and configuration.

```bash
hermes doctor [--fix]
```

| Option | Description |
| --- | --- |
| `--fix` | Try to repair issues automatically when possible |

---

## `hermes config`

Manages the Hermes configuration file at `~/.hermes/config.yaml`.

```bash
hermes config <subcommand>
```

| Subcommand | Description |
| --- | --- |
| `set <key> <value>` | Update a configuration key directly |
| `show` | Print the current configuration |
| `edit` | Open the config file in your default editor |
| `migrate` | Upgrade an older config format to the latest version |

### Examples

```bash
hermes config set display.bell_on_complete true
hermes config show
hermes config edit
hermes config migrate
```

---

## `hermes pairing`

Manages messaging-platform pairing and access approval.

```bash
hermes pairing <subcommand>
```

| Subcommand | Description |
| --- | --- |
| `approve <request-id>` | Approve a pairing request |
| `revoke <user-id>` | Revoke access for a previously approved user |

---

## `hermes skills`

Manages Hermes skills and skill marketplace operations.

```bash
hermes skills <subcommand>
```

| Subcommand | Description |
| --- | --- |
| `browse` | Browse the skill marketplace |
| `install <skill-name>` | Install a named skill |
| `manage` | Manage installed skills, including enable, disable, and uninstall actions |

---

## `hermes honcho`

Opens the personality-management interface so you can configure or switch between agent personalities.

```bash
hermes honcho
```

---

## `hermes memory`

Shows and manages Hermes memory, including stored user-profile details and long-term memory entries.

```bash
hermes memory
```

---

## `hermes acp`

Manages ACP (Agent Communication Protocol) adapter settings for multi-agent workflows.

```bash
hermes acp
```

---

## `hermes mcp`

Manages MCP (Model Context Protocol) servers.

```bash
hermes mcp <subcommand>
```

| Subcommand | Description |
| --- | --- |
| `serve` | Run Hermes itself as an MCP server |
| `manage` | Add, remove, and test configured MCP servers |

---

## `hermes plugins`

Lists installed plugins and manages third-party plugin integration.

```bash
hermes plugins
```

---

## `hermes tools`

Lists every available tool, including built-in tools, toolsets, and tools loaded through MCP servers.

```bash
hermes tools
```

---

## `hermes sessions`

Manages conversation history.

```bash
hermes sessions <subcommand>
```

| Subcommand | Description |
| --- | --- |
| `list` | List saved sessions |
| `browse` | Open an interactive session browser |
| `export <session-id>` | Export a session as Markdown or JSON |
| `delete <session-id>` | Delete a session |
| `prune` | Remove older sessions while keeping the most recent ones |
| `stats` | Show usage statistics such as session counts and token consumption |
| `rename <session-id> <name>` | Rename a session |

### Examples

```bash
hermes sessions list
hermes sessions export abc123 --format markdown
hermes sessions delete abc123
hermes sessions prune --keep 20
```

---

## `hermes insights`

Shows usage insights such as model frequency, token consumption, and tool-call patterns.

```bash
hermes insights [--days <N>]
```

| Option | Description |
| --- | --- |
| `--days <N>` | Report on the most recent `N` days, default `7` |

---

## `hermes claw migrate`

Migrates configuration and related settings from Claw to Hermes.

```bash
hermes claw migrate
```

---

## `hermes profile`

Manages profiles. Each profile can have its own model, prompts, and configuration values.

```bash
hermes profile <subcommand>
```

| Subcommand | Description |
| --- | --- |
| `list` | List all profiles |
| `use <name>` | Switch to a profile |
| `create <name>` | Create a new profile |
| `delete <name>` | Delete a profile |
| `show [name]` | Show profile details |
| `alias <name> <alias>` | Create an alias for a profile |
| `rename <old> <new>` | Rename a profile |
| `export <name>` | Export a profile as YAML |
| `import <path>` | Import a profile from YAML |

### Examples

```bash
hermes profile create work
hermes profile use work
hermes profile list
hermes profile export work > work-profile.yaml
hermes profile import ./work-profile.yaml
```

---

## `hermes completion`

Generates shell-completion scripts.

```bash
hermes completion [bash|zsh]
```

### Examples

```bash
# Bash completion
hermes completion bash >> ~/.bashrc

# Zsh completion
hermes completion zsh >> ~/.zshrc
```

---

## `hermes update`

Checks for updates and upgrades Hermes to the latest installed version.

```bash
hermes update
```

---

## `hermes uninstall`

Uninstalls Hermes and related files.

```bash
hermes uninstall
```

Hermes asks for confirmation before removing files, and you can usually choose whether to keep data in `~/.hermes/`.
