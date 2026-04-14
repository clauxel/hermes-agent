---
title: "Configuration Reference"
source: https://hermes-agent.nousresearch.com/docs/user-guide/configuration/
mirrored_at: 2026-04-12T01:11:32Z
---
# Configuration Reference

Hermes stores its main configuration in `~/.hermes/config.yaml`. This page documents the available settings, their defaults, and how they are typically used.

Use `hermes config edit` to open the file in your editor, or `hermes config set <key> <value>` to change a single setting from the CLI.

Treat this page as a convenience snapshot. For the latest behavior, compare with `hermes config show` and the official configuration docs. Keep secrets in `~/.hermes/.env`.

---

## Full Example Configuration

```yaml
memory:
  memory_enabled: true
  user_profile_enabled: true
  memory_char_limit: 8000
  user_char_limit: 2000

terminal:
  backend: local
  cwd: ~
  timeout: 120
  docker_image: "ghcr.io/nousresearch/hermes:latest"
  container_cpu: 2
  container_memory: "4g"
  container_disk: "20g"
  container_persistent: false

compression:
  enabled: true
  threshold: 80000
  summary_model: "claude-3-haiku-20240307"

display:
  busy_input_mode: interrupt
  tool_preview_length: 500
  bell_on_complete: false

skills:
  external_dirs:
    - ~/my-hermes-skills
    - /opt/company-skills

agent:
  personalities:
    default:
      name: Hermes
      system_prompt: "You are a capable and friendly AI assistant."
    coder:
      name: Coder
      system_prompt: "You are a professional software engineer focused on writing and debugging code."

quick_commands:
  morning_report:
    type: exec
    command: "hermes -Q 'Generate a short plan for the day'"

approvals:
  mode: smart
  timeout: 30

security:
  website_blocklist:
    enabled: false
    domains:
      - "example-blocked.com"

mcp_servers:
  filesystem:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user"]
    include: ["read_file", "write_file"]
    exclude: []
  remote_api:
    url: "https://my-mcp-server.example.com/sse"
    headers:
      Authorization: "Bearer mytoken"

tts:
  provider: edge
  edge:
    voice: "en-US-JennyNeural"
    rate: "+0%"
    pitch: "+0Hz"
  elevenlabs:
    voice_id: "your-voice-id"
    model: "eleven_multilingual_v2"
    stability: 0.5
    similarity_boost: 0.75
  openai:
    voice: "nova"
    model: "tts-1"
    speed: 1.0
```

---

## `memory`

Controls Hermes long-term memory behavior.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `memory.memory_enabled` | `bool` | `true` | Enables long-term memory extraction and storage |
| `memory.user_profile_enabled` | `bool` | `true` | Enables user-profile memory such as preferences and habits |
| `memory.memory_char_limit` | `int` | `8000` | Maximum number of memory characters injected into context |
| `memory.user_char_limit` | `int` | `2000` | Maximum number of user-profile characters injected into context |

### Notes

- Memory changes usually take effect in the **next session**, not immediately in the current conversation.
- Use `hermes memory` to inspect or manage stored memory entries.
- Lowering the character limits can reduce token usage.

---

## `terminal`

Controls how Hermes runs shell commands.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `terminal.backend` | `string` | `local` | Terminal backend type |
| `terminal.cwd` | `string` | `~` | Default working directory |
| `terminal.timeout` | `int` | `120` | Command timeout in seconds |
| `terminal.docker_image` | `string` | none | Docker image used by the Docker backend |
| `terminal.container_cpu` | `int` | `2` | CPU cores assigned to the container |
| `terminal.container_memory` | `string` | `"4g"` | Memory assigned to the container |
| `terminal.container_disk` | `string` | `"20g"` | Disk space assigned to the container |
| `terminal.container_persistent` | `bool` | `false` | Whether the container should preserve state between runs |

### Backend values

| Value | Description |
| --- | --- |
| `local` | Run commands directly on the local machine |
| `docker` | Run commands inside a Docker container |
| `ssh` | Run commands on a remote machine over SSH |
| `singularity` | Use a Singularity or Apptainer container, common in HPC environments |
| `modal` | Run commands on Modal |
| `daytona` | Run commands in a Daytona development environment |

---

## `compression`

Controls automatic context compression when conversations become long.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `compression.enabled` | `bool` | `true` | Enables automatic compression |
| `compression.threshold` | `int` | `80000` | Context-length threshold that triggers compression |
| `compression.summary_model` | `string` | `"claude-3-haiku-20240307"` | Model used to summarize older conversation history |

---

## `display`

Controls CLI display behavior.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `display.busy_input_mode` | `string` | `interrupt` | What happens if you type while Hermes is busy |
| `display.tool_preview_length` | `int` | `500` | Maximum number of preview characters shown for tool output |
| `display.bell_on_complete` | `bool` | `false` | Ring the terminal bell when a task finishes |

### `busy_input_mode` values

| Value | Description |
| --- | --- |
| `interrupt` | New user input interrupts the current task |
| `queue` | New user input waits until Hermes finishes the current task |

---

## `skills`

Defines additional directories Hermes should search for skills.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `skills.external_dirs` | `list` | `[]` | Extra directories that contain custom skills |

### Example

```yaml
skills:
  external_dirs:
    - ~/my-skills
    - /opt/team-skills
```

---

## `agent`

Configures agent personalities.

| Key | Type | Description |
| --- | --- | --- |
| `agent.personalities` | `map` | Mapping of personality names to personality definitions |
| `agent.personalities.<name>.name` | `string` | Display name for the personality |
| `agent.personalities.<name>.system_prompt` | `string` | System prompt used for that personality |

### Example

```yaml
agent:
  personalities:
    default:
      name: Hermes
      system_prompt: "You are Hermes, a strong and friendly AI assistant."
    analyst:
      name: Analyst
      system_prompt: "You are a careful data analyst who answers with clear reasoning and well-structured conclusions."
    writer:
      name: Writer
      system_prompt: "You are a creative writing assistant with polished, expressive language."
```

Use `hermes honcho` to switch personalities interactively.

---

## `quick_commands`

Defines named shortcut commands.

| Key | Type | Description |
| --- | --- | --- |
| `quick_commands.<name>.type` | `string` | Command type, currently `exec` |
| `quick_commands.<name>.command` | `string` | Shell command to run |

### Example

```yaml
quick_commands:
  daily_standup:
    type: exec
    command: "hermes -Q 'Generate a standup update for today'"
  check_server:
    type: exec
    command: "hermes -Q 'Check server health and report anything unusual'"
```

---

## `approvals`

Controls whether Hermes asks for confirmation before using tools such as file writes or shell commands.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `approvals.mode` | `string` | `smart` | Approval behavior |
| `approvals.timeout` | `int` | `30` | Seconds to wait for approval before denying the action |

### `mode` values

| Value | Description |
| --- | --- |
| `manual` | Require approval for every tool call |
| `smart` | Approve safe actions automatically and ask for risky ones |
| `off` | Skip all approvals, similar to `--yolo` |

---

## `security`

Defines safety-related restrictions.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `security.website_blocklist.enabled` | `bool` | `false` | Enables website blocking |
| `security.website_blocklist.domains` | `list` | `[]` | Domains Hermes should not access |

### Example

```yaml
security:
  website_blocklist:
    enabled: true
    domains:
      - "social-media-distraction.com"
      - "streaming-site.com"
```

---

## `mcp_servers`

Defines MCP (Model Context Protocol) servers that extend Hermes with external tools and resources.

Each MCP server can be either a local process or a remote SSE endpoint.

### Local-process example

```yaml
mcp_servers:
  filesystem:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user"]
    include: ["read_file", "write_file"]
    exclude: []
```

### Remote SSE example

```yaml
mcp_servers:
  remote_api:
    url: "https://mcp-server.example.com/sse"
    headers:
      Authorization: "Bearer <token>"
    include: []
    exclude: []
```

### Key reference

| Key | Type | Description |
| --- | --- | --- |
| `command` | `string` | Startup command for a local MCP server |
| `args` | `list` | Command arguments |
| `url` | `string` | SSE endpoint URL for a remote MCP server |
| `headers` | `map` | HTTP headers, usually for authentication |
| `include` | `list` | Only load these tools, empty means load all |
| `exclude` | `list` | Exclude these tools |

---

## `tts`

Configures text-to-speech output.

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `tts.provider` | `string` | `edge` | Which TTS provider Hermes should use |

### Provider values

| Value | Description |
| --- | --- |
| `edge` | Microsoft Edge TTS, free and does not require an API key |
| `elevenlabs` | Higher-quality synthesis through ElevenLabs, requires an API key |
| `openai` | OpenAI TTS, requires an API key |

### Edge example

```yaml
tts:
  provider: edge
  edge:
    voice: "en-US-JennyNeural"
    rate: "+0%"
    pitch: "+0Hz"
```

Common voices include `en-US-JennyNeural` and `en-US-GuyNeural`, but any supported Edge voice can be used.

### ElevenLabs example

```yaml
tts:
  provider: elevenlabs
  elevenlabs:
    voice_id: "your-voice-id"
    model: "eleven_multilingual_v2"
    stability: 0.5
    similarity_boost: 0.75
```

### OpenAI example

```yaml
tts:
  provider: openai
  openai:
    voice: "nova"
    model: "tts-1"
    speed: 1.0
```

---

## Environment Variables

Sensitive values such as API keys and tokens should be stored in `~/.hermes/.env`, not in `config.yaml`.

```bash
# AI provider keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# Messaging platform tokens
TELEGRAM_BOT_TOKEN=...
TELEGRAM_ALLOWED_USERS=123456789,987654321
DISCORD_BOT_TOKEN=...
DISCORD_ALLOWED_USERS=...
SLACK_BOT_TOKEN=...

# TTS
ELEVENLABS_API_KEY=...
```

Tip: use `hermes setup` for guided setup, or `hermes config edit` to review configuration manually.
