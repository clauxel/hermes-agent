---
title: "Configuration"
source: https://hermesagent.studio/guide/configuration
mirrored_at: 2026-04-12T01:11:32Z
---
# Configuration

Hermes Agent stores configuration in two files:

| File | Purpose |
| --- | --- |
| `~/.hermes/config.yaml` | Main configuration for non-sensitive settings |
| `~/.hermes/.env` | Secrets and credentials such as API keys |

Rule of thumb: keep secrets, tokens, and passwords in `.env`; keep everything else in `config.yaml`.

## Configuration Commands

```bash
# Show the current configuration
hermes config show

# Set a single configuration key
hermes config set key value

# Open the full configuration in your editor
hermes config edit

# Migrate legacy configuration formats
hermes config migrate
```

## Model and Provider Settings

Use the interactive selector to choose a default model:

```bash
hermes model
```

Or configure it directly in `config.yaml`:

```yaml
provider:
  default: nous_portal  # nous_portal | openrouter | openai | anthropic | google | deepseek | ollama

  models:
    nous_portal: hermes-3-llama-3.1-70b
    openrouter: anthropic/claude-3-5-sonnet
    openai: gpt-4o
    anthropic: claude-3-5-sonnet-20241022
    google: gemini-1.5-pro
    deepseek: deepseek-chat
    ollama: llama3.2

  custom_openai:
    base_url: https://your-endpoint.com/v1
    model: your-model-name
```

Corresponding keys in `.env`:

```bash
NOUS_API_KEY=nsk-xxxxxxxxxxxx
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
GOOGLE_API_KEY=AIzaxxxxxxxxxx
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxx
```

## Memory Settings

These settings control persistent memory and user profiling:

```yaml
memory:
  memory_enabled: true
  user_profile_enabled: true
  max_memory_entries: 500
  max_profile_tokens: 2000
  retrieval_threshold: 0.7

  vector_store:
    enabled: false
    backend: chroma  # chroma | qdrant
    path: ~/.hermes/vectordb
```

## Terminal Backend Settings

These settings define how Hermes Agent executes shell commands:

```yaml
terminal:
  # local       - run directly on the host
  # docker      - run inside Docker
  # ssh         - run on a remote server
  # singularity - run in an HPC environment
  # modal       - run in Modal serverless containers
  # daytona     - run in a Daytona cloud workspace
  backend: local

  timeout: 300

  docker:
    image: nousresearch/hermes-sandbox:latest
    allowed_mounts:
      - ~/projects
      - /tmp
    workdir: /workspace
    network: bridge
    memory_limit: 2g
    cpu_limit: "2.0"

  ssh:
    host: your-server.example.com
    port: 22
    user: ubuntu
    key_file: ~/.ssh/id_rsa
    # password: your_password

  singularity:
    image: /path/to/hermes.sif
    bind_paths:
      - /scratch:/workspace

  modal:
    app_name: hermes-agent
    cpu: 2
    memory: 4096
```

## Conversation Compression

When a conversation approaches the model context limit, Hermes Agent can summarize older turns automatically:

```yaml
compression:
  enabled: true
  threshold: 0.8
  summary_model: openai/gpt-4o-mini
  keep_recent: 10
```

## Display Settings

These options control the terminal experience:

```yaml
display:
  # block  - reject new input until the response finishes
  # queue  - queue new input
  # allow  - allow interrupting the current response
  busy_input_mode: allow

  tool_preview_length: 500
  bell_on_complete: false
  show_token_usage: true
  code_theme: monokai
  streaming: true
  timestamp_format: "%H:%M:%S"
```

## Skill Directory Settings

In addition to `~/.hermes/skills/`, you can mount extra skill directories:

```yaml
skills:
  external_dirs:
    - ~/my-team-skills
    - /opt/shared-skills
    - /home/user/projects/custom-skills

  auto_extract: true
  extraction_threshold: 0.8
```

## Personality Settings

Personalities define tone, expertise, and default behavior:

```yaml
agent:
  personalities:
    - id: default
      name: Hermes
      description: General-purpose assistant
      system_prompt: |
        You are Hermes, an AI assistant maintained by HermesAgent Studio.
        You are capable, helpful, and concise.
        Prefer Chinese when the user is operating in a Chinese-speaking context.

    - id: dev
      name: Developer Assistant
      description: A technical assistant focused on software development
      system_prompt: |
        You are a senior software engineer focused on code quality and best practices.
        Prefer practical, runnable examples with concise explanations.
        For architecture questions, clarify requirements before recommending a design.

    - id: writer
      name: Writing Assistant
      description: A persona for drafting and refining content
      system_prompt: |
        You are a professional writer with strong editing instincts.
        Prioritize accuracy, clarity, and flow in every response.
```

Activate a personality with:

```bash
hermes --persona dev
hermes --persona writer
```

## Quick Commands

Define reusable prompt shortcuts:

```yaml
quick_commands:
  commands:
    standup: "Generate today's standup update, including yesterday's work, today's plan, and blockers."
    review: "Perform a code review focused on performance, security, and maintainability."
    translate: "Translate the following content into English while preserving tone and structure."
    summarize: "Summarize the following content in three sentences."
    commit: "Generate a Conventional Commits message from the current git diff."
```

Use them like this:

```bash
hermes /standup
hermes /review < mycode.py
```

## Approval Settings

Approvals control whether Hermes must ask before running sensitive actions:

```yaml
approvals:
  mode: manual  # manual | smart | off
  timeout: 30
  auto_approve_threshold: 0.2
  always_require:
    - recursive_delete
    - system_modification
    - network_expose
```

## Security Settings

```yaml
security:
  website_blocklist:
    - "*.torrent"
    - "*.onion"
    - "192.168.0.0/16"
    - "10.0.0.0/8"

  ssrf_protection: true
  tirith_scanning: true
  credential_redaction: true
```

## MCP Server Settings

Use this section to integrate external MCP servers:

```yaml
mcp:
  servers:
    - name: filesystem
      type: stdio
      command: npx
      args:
        - "-y"
        - "@modelcontextprotocol/server-filesystem"
        - "/home/user/documents"

    - name: custom-tools
      type: sse
      url: https://your-mcp-server.example.com/sse
      headers:
        Authorization: "Bearer ${MCP_SERVER_TOKEN}"

    - name: brave-search
      type: stdio
      command: npx
      args:
        - "-y"
        - "@modelcontextprotocol/server-brave-search"
      env:
        BRAVE_API_KEY: "${BRAVE_API_KEY}"
```

## TTS Settings

```yaml
tts:
  # edge       - Microsoft Edge TTS, free and keyless
  # elevenlabs - premium voices with API key
  # openai     - OpenAI TTS
  engine: edge

  edge:
    voice: zh-CN-XiaoxiaoNeural
    rate: "+0%"
    pitch: "+0Hz"

  elevenlabs:
    voice_id: your_voice_id
    model: eleven_multilingual_v2
    stability: 0.5
    similarity_boost: 0.75

  openai:
    model: tts-1-hd
    voice: nova  # alloy | echo | fable | onyx | nova | shimmer
    speed: 1.0

  auto_speak: false
```

The related key goes in `.env`:

```bash
ELEVENLABS_API_KEY=your_key_here
```

## Full Example

Here is a compact baseline configuration:

```yaml
provider:
  default: openrouter
  models:
    openrouter: anthropic/claude-3-5-sonnet

memory:
  memory_enabled: true
  user_profile_enabled: true
  max_memory_entries: 300

terminal:
  backend: docker
  timeout: 180
  docker:
    image: nousresearch/hermes-sandbox:latest
    allowed_mounts:
      - ~/projects

compression:
  enabled: true
  threshold: 0.8
  summary_model: openai/gpt-4o-mini

display:
  busy_input_mode: allow
  tool_preview_length: 300
  bell_on_complete: true
  show_token_usage: true
  streaming: true

approvals:
  mode: smart
  timeout: 30
  auto_approve_threshold: 0.2

security:
  ssrf_protection: true
  credential_redaction: true

tts:
  engine: edge
  edge:
    voice: zh-CN-XiaoxiaoNeural
  auto_speak: false
```
