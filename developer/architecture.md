---
title: "Architecture"
source: https://hermes-agent.nousresearch.com/docs/developer-guide/architecture/
mirrored_at: 2026-04-12T01:11:32Z
---
# Architecture

This document gives developers a high-level view of Hermes Agent's internal design, including the main entry points, the core agent runtime, and the supporting subsystems around it.

## System Overview

Hermes Agent is built from three main entry points, a core agent runtime, and several shared subsystems:

```text
Entry points
  - CLI (`cli.py`)
  - Gateway (`gateway/run.py`)
  - ACP adapter

Core runtime
  - AIAgent (`run_agent.py`)
    - Prompt builder
    - Provider resolution
    - Tool dispatch

Shared subsystems
  - Tool registry
  - Config system
  - Memory system
  - Session storage
  - Logging and observability
```

## Entry Points

### 1. CLI (`cli.py`)

The CLI is the interactive terminal entry point. It is responsible for:

- Parsing command-line arguments and subcommands
- Initializing the Rich-powered terminal UI
- Managing keyboard shortcuts and interactive controls
- Passing user input to `AIAgent`
- Streaming responses and tool activity back to the terminal

The CLI uses [Rich](https://github.com/Textualize/rich) for color output, progress display, code highlighting, tables, and structured logs.

### 2. Gateway (`gateway/run.py`)

The gateway is the messaging-platform entry point. It:

- Listens for incoming messages from Telegram, Discord, Slack, and other platforms
- Normalizes incoming message payloads into a shared internal format
- Passes requests to `AIAgent`
- Converts responses back into platform-specific message shapes
- Maintains per-user conversation isolation
- Runs as a long-lived background service

Each platform has its own adapter module, such as `gateway/adapters/telegram.py`, that encapsulates API-specific behavior.

### 3. ACP Adapter

The ACP adapter is used for agent-to-agent integration scenarios. It can:

- Expose Hermes as an ACP-compatible service
- Accept calls from other agents or orchestration systems
- Support delegated execution and capability sharing

## Core Agent Runtime

`AIAgent` in `run_agent.py` implements the main ReAct-style loop:

```text
User input
  -> Prompt builder
  -> Provider resolution
  -> LLM request
  -> Tool call?
       yes -> Tool dispatch -> Tool result -> back to the model
       no  -> Final response
  -> Persist session and update memory
```

### Prompt Builder

The prompt builder constructs the full request payload for each model call. Typical inputs include:

1. System instructions from the active persona
2. Persistent memory and user profile context
3. Tool descriptions for the currently enabled toolsets
4. Conversation history, possibly compressed
5. The latest user message

This layering keeps prompt construction predictable and easier to debug.

### Provider Resolution

Provider resolution chooses the active provider and model for a request. It handles:

- Default provider and model lookup from config
- Per-run overrides such as `-m` / `--model`
- Fallback behavior when a provider is unavailable
- Provider-specific request shaping and credential lookup

### Tool Dispatch

Tool dispatch handles model-initiated tool calls:

- Parse the tool call returned by the model
- Look up the handler in the global registry
- Check whether approval is required
- Execute the tool
- Serialize the result and send it back into the loop
- Handle timeouts and failures cleanly

## Tool Registry

The registry in `tools/registry.py` manages Hermes Agent's built-in and dynamically loaded tools.

- Hermes ships with **47 built-in tools** grouped into **19 toolsets**
- Tool files register themselves via decorators
- Toolsets group capabilities by domain such as filesystem, web, execution, or memory
- Tools exposed by MCP servers are folded into the same runtime model

### Toolset Categories

| Category | Example capabilities |
| --- | --- |
| Filesystem | Read files, write files, list directories, search |
| Shell execution | Run commands and scripts |
| Networking | HTTP requests, page fetches, downloads |
| Code analysis | Search code, inspect structure, check syntax |
| System information | Processes, environment variables, resource info |
| Memory | Save and retrieve long-term facts |
| Media | Image analysis and format conversion |
| Time and scheduling | Time lookup, reminders, scheduling helpers |

## CLI Orchestration Layer

The CLI layer turns the raw agent loop into an interface people can comfortably use:

- Markdown rendering and syntax highlighting
- Status bars for model, token usage, and current activity
- Tool preview panels for inputs and outputs
- Keyboard shortcuts such as `Ctrl+C` and `Tab`
- Streaming responses as they arrive from the model

## Configuration System

Hermes Agent uses a two-layer configuration model:

```text
~/.hermes/
  config.yaml   -> feature settings such as models, display, memory, and tool behavior
  .env          -> sensitive values such as API keys and tokens
  sessions/     -> conversation history storage
  memory/       -> long-term memory storage
  logs/         -> runtime logs
```

- `config.yaml` stores structured application settings
- `.env` keeps secrets out of version-controlled config
- `hermes config migrate` helps move older config formats forward

## Data Flow

### CLI Data Flow

```text
Keyboard input
  -> CLI input handling
  -> AIAgent.run()
  -> Prompt build with memory and tools
  -> LLM request
  -> Streamed output rendering
  -> Tool execution if needed
  -> Session persistence and memory extraction
```

### Gateway Data Flow

```text
Platform message
  -> Platform adapter
  -> User authorization check
  -> Session lookup
  -> AIAgent.run()
  -> Platform-specific response formatting
  -> Send reply
  -> Persist session
```

### Cron Data Flow

```text
Scheduled trigger
  -> Load task configuration
  -> Create a headless agent run
  -> AIAgent.run()
  -> Store results
  -> Optionally deliver output through the gateway
```

## Design Principles

### Stable Prompt Construction

The prompt builder is intentionally deterministic. Given the same user input, memory, enabled tools, and persona, Hermes Agent should construct the same prompt structure. That makes behavior easier to reason about and test.

### Observable Execution

The runtime is designed to be inspectable. Tool calls, model requests, and key execution steps are logged and surfaced through the CLI so users can see what the agent is doing.

### Platform-Neutral Core

`AIAgent` itself does not depend on any single user interface. The CLI, gateway, and ACP adapter live at the edges, while the core runtime stays reusable across all of them.
