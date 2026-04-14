---
title: "Tool System"
source: https://hermes-agent.nousresearch.com/docs/user-guide/features/tools/
mirrored_at: 2026-04-12T01:11:32Z
---
# Tool System

The current official built-in tools reference documents **47 built-in tools** across many toolsets covering web access, files, terminal execution, browser automation, memory, and agent orchestration.

## Tool Categories

### Web Tools

| Tool | Purpose |
| --- | --- |
| `web_search` | Search the web and return structured results |
| `web_extract` | Extract article or page content from a URL |

Good for news lookups, document retrieval, and live web research.

```bash
hermes chat --toolsets "web"
```

### Terminal and File Tools

| Tool | Purpose |
| --- | --- |
| `terminal` | Run shell commands |
| `process` | Inspect or manage system processes |
| `read_file` | Read local file contents |
| `search_files` | Search file contents or find files by name |
| `patch` | Apply precise file edits through diffs |
| `write_file` | Replace a file's contents completely |

```bash
hermes chat --toolsets "terminal,file"
```

In current official docs, the `file` toolset is the preferred way to read, search, patch, and rewrite files instead of relying on shell-only fallbacks.

### Browser Tools

| Tool | Purpose |
| --- | --- |
| `browser_navigate` | Open a page in a headless browser |
| `browser_snapshot` | Capture the page accessibility tree |
| `browser_vision` | Analyze the rendered page visually |

```bash
hermes chat --toolsets "browser"
```

### Media Tools

| Tool | Purpose |
| --- | --- |
| `vision_analyze` | Analyze images from local paths or URLs |
| `image_generate` | Generate images with an image model |
| `text_to_speech` | Convert text into speech |

```bash
hermes chat --toolsets "vision,image_gen,tts"
```

### Agent-Orchestration Tools

| Tool | Purpose |
| --- | --- |
| `todo` | Track multi-step tasks |
| `clarify` | Ask the user for confirmation or clarification |
| `execute_code` | Run code in a sandbox |
| `delegate_task` | Hand work to another agent or sub-session |

```bash
hermes chat --toolsets "todo,clarify,code_execution,delegation"
```

### Memory Tools

| Tool | Purpose |
| --- | --- |
| `memory` | Read and write persistent memory |
| `session_search` | Search historical conversations |

```bash
hermes chat --toolsets "memory,session_search"
```

### Automation Tools

| Tool | Purpose |
| --- | --- |
| `cronjob` | Create scheduled tasks from natural language |
| `send_message` | Deliver notifications through a configured channel |

```bash
hermes chat --toolsets "cronjob"
```

### Home Assistant Tools

The `ha_*` tools integrate Hermes with Home Assistant:

| Tool | Purpose |
| --- | --- |
| `ha_get_states` | Read current entity states |
| `ha_set_state` | Set entity state or attributes |
| `ha_call_service` | Call Home Assistant services |
| `ha_get_history` | Retrieve entity history |

```bash
hermes chat --toolsets "homeassistant"
```

### MCP Tools

External MCP tools appear as `mcp_<server>_<tool>`. See [MCP Integration](mcp.md) for configuration details.

## Toolset Summary

| Toolset | Typical tools | Use case |
| --- | --- | --- |
| `web` | `web_search`, `web_extract` | Live web research |
| `terminal` | `terminal`, `process` | Shell execution |
| `file` | `read_file`, `search_files`, `patch`, `write_file` | File access and editing |
| `browser` | browser tools | Browser automation |
| `vision` | `vision_analyze` | Image understanding |
| `image_gen` | `image_generate` | Image creation |
| `tts` | `text_to_speech` | Spoken output |
| `todo` | task tracker | Multi-step planning |
| `memory` | memory tools | Persistent context |
| `session_search` | session search | Historical lookup |
| `cronjob` | scheduled tasks | Automation |
| `code_execution` | code runner | Sandbox execution |
| `delegation` | delegation tools | Multi-agent workflows |
| `clarify` | confirmation tools | Safer decisions |
| `skills` | skills toolset | Install and manage skills |
| `homeassistant` | `ha_*` tools | Smart-home control |
| `moa` | `mixture_of_agents` | Multi-model collaboration for hard problems |
| `rl` | `rl_*` tools | Reinforcement-learning workflows |

## Platform Presets

Different runtimes can ship with different default toolsets.

### `hermes-cli`

The CLI usually enables a broad developer-oriented set:

```text
web, terminal, file, browser, vision, image_gen, tts, todo, memory, session_search, cronjob, code_execution, delegation, clarify, skills
```

### `hermes-telegram`

Messaging-focused deployments usually enable a narrower default set:

```text
web, vision, tts, todo, memory, session_search, skills
```

For safety, terminal and file toolsets are often disabled by default on messaging platforms.

## Choose Toolsets Explicitly

### From the Command Line

```bash
# Web and terminal only
hermes chat --toolsets "web,terminal"

# Large all-purpose set
hermes chat --toolsets "web,terminal,file,browser,vision,image_gen,tts,todo,memory,session_search,cronjob,code_execution,delegation,clarify,skills"

# Plain chat with no tools
hermes chat --toolsets ""
```

### From Config

```yaml
toolsets:
  - web
  - terminal
  - file
  - browser
  - vision
  - memory
  - todo
  - skills
```

### Combine Toolsets with Skills

```bash
hermes -s research,coding --toolsets "web,terminal,file,browser"
```

## Safety and Permissions

For high-risk actions, Hermes can ask for confirmation before it proceeds, especially when:

- Deleting files or directories
- Running irreversible shell commands
- Sending data to external services

Typical config:

```yaml
approvals:
  mode: smart
  timeout: 30
```

Review the current tool and toolset availability with:

```bash
hermes tools
```

For the full per-tool list, prefer the official built-in tools reference:

<https://hermes-agent.nousresearch.com/docs/reference/tools-reference/>

## Custom Tools Through MCP

You can register any external service as a Hermes tool through MCP:

```yaml
mcp_servers:
  my_tool:
    command: python
    args: ["/path/to/my_tool_server.py"]
```

Once connected, Hermes exposes the server's tools using the `mcp_my_tool_<tool_name>` naming pattern.
