---
title: "MCP Integration"
source: https://hermes-agent.nousresearch.com/docs/guides/use-mcp-with-hermes/
mirrored_at: 2026-04-12T01:11:32Z
---
# MCP Integration

MCP, the **Model Context Protocol**, standardizes how AI systems interact with external tools and resources. Hermes Agent can act as both an **MCP client** and an **MCP server**.

## Hermes as an MCP Client

### Basic Configuration

Configure MCP servers in `~/.hermes/config.yaml`:

```yaml
mcp_servers:
  filesystem:
    command: npx
    args:
      - "-y"
      - "@modelcontextprotocol/server-filesystem"
      - "/home/user/documents"

  my_remote_service:
    url: "https://api.example.com/mcp"
    headers:
      Authorization: "Bearer ${MY_API_KEY}"
      X-Custom-Header: "value"

  database_tools:
    command: python
    args:
      - "/opt/mcp-servers/db-server.py"
      - "--db-url"
      - "${DATABASE_URL}"
```

### Tool Naming

Tools exposed by MCP servers are registered automatically using the pattern `mcp_<server_name>_<tool_name>`:

| Server | Original tool | Hermes name |
| --- | --- | --- |
| `filesystem` | `read_file` | `mcp_filesystem_read_file` |
| `filesystem` | `write_file` | `mcp_filesystem_write_file` |
| `database_tools` | `query` | `mcp_database_tools_query` |
| `my_remote_service` | `search` | `mcp_my_remote_service_search` |

## Tool Filtering

### Allowlist with `include`

Expose only a subset of tools:

```yaml
mcp_servers:
  github:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-github"]
    include:
      - list_repositories
      - get_file_contents
      - create_issue
```

### Denylist with `exclude`

Hide specific tools while leaving the rest available:

```yaml
mcp_servers:
  filesystem:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/"]
    exclude:
      - delete_file
      - move_file
      - write_file
```

### Disable Resources and Prompts

If an MCP server also exposes resources or prompt templates, you can disable them:

```yaml
mcp_servers:
  my_server:
    command: ./my-mcp-server
    disable_resources: true
    disable_prompts: true
```

## Reload MCP Servers at Runtime

You can reload MCP configuration without restarting Hermes:

```text
/reload-mcp
```

Hermes will:

1. Close existing MCP connections
2. Reload the `mcp_servers` config
3. Reconnect and re-register tools

## Hermes as an MCP Server

Hermes can also expose its own capabilities to external MCP clients:

```bash
# Start the MCP server
hermes mcp serve

# Choose a port
hermes mcp serve --port 3000

# Choose a transport
hermes mcp serve --transport stdio
hermes mcp serve --transport sse
```

### Exposed Capabilities

When Hermes runs as an MCP server, its enabled toolsets become MCP tools:

```json
{
  "tools": [
    { "name": "web_search", "description": "..." },
    { "name": "terminal", "description": "..." },
    { "name": "memory", "description": "..." }
  ]
}
```

## MCP Sampling

MCP 1.0 introduced **sampling**, which allows an MCP server to request model inference from Hermes instead of shipping its own API key.

### Configuration

```yaml
mcp_servers:
  smart_tool:
    command: ./smart-mcp-server
    sampling:
      enabled: true
      model: claude-3-5-haiku-20241022
      max_tokens: 1000
      rate_limit:
        requests_per_minute: 10
        tokens_per_hour: 50000
      audit_log: true
```

### Audit Logging

When `audit_log` is enabled, sampling requests are written to `~/.hermes/logs/mcp-sampling.log`:

```json
{
  "timestamp": "2025-04-07T10:23:45Z",
  "server": "smart_tool",
  "model": "claude-3-5-haiku-20241022",
  "tokens_used": 342,
  "prompt_preview": "Analyze the following data...",
  "status": "success"
}
```

## ACP Editor Integration

Hermes also ships ACP integration so you can use it directly from your editor.

```bash
hermes acp
```

### VS Code

1. Install the Hermes VS Code extension
2. Configure the ACP endpoint:

```json
{
  "hermes.acp.endpoint": "http://localhost:7373",
  "hermes.acp.autoStart": true
}
```

3. Open the Hermes panel with `Ctrl+Shift+H`

### Zed

Add this to `settings.json`:

```json
{
  "assistant": {
    "provider": {
      "type": "hermes-acp",
      "endpoint": "http://localhost:7373"
    }
  }
}
```

### JetBrains

After installing the Hermes plugin, configure:

```text
ACP Endpoint: http://localhost:7373
Auto-connect: enabled
```

## Practical Examples

### PostgreSQL Tools

```yaml
mcp_servers:
  postgres:
    command: npx
    args:
      - "-y"
      - "@modelcontextprotocol/server-postgres"
      - "${DATABASE_URL}"
    include:
      - query
    disable_resources: false
```

### Slack Notifications

```yaml
mcp_servers:
  slack:
    url: "https://mcp.slack.com/v1"
    headers:
      Authorization: "Bearer ${SLACK_BOT_TOKEN}"
    include:
      - send_message
      - list_channels
```

### Local Knowledge Base

```yaml
mcp_servers:
  knowledge_base:
    command: python
    args: ["-m", "my_kb_server", "--data-dir", "/data/knowledge"]
    sampling:
      enabled: true
      max_tokens: 2000
```

## Common MCP Servers

| Server | Install command | Common use |
| --- | --- | --- |
| Filesystem | `npx @modelcontextprotocol/server-filesystem` | Read and write local files |
| GitHub | `npx @modelcontextprotocol/server-github` | Repo, issue, and PR operations |
| PostgreSQL | `npx @modelcontextprotocol/server-postgres` | Database queries |
| Brave Search | `npx @modelcontextprotocol/server-brave-search` | Web search |
| Puppeteer | `npx @modelcontextprotocol/server-puppeteer` | Browser automation |
| Memory | `npx @modelcontextprotocol/server-memory` | Knowledge graph memory |
| Slack | `npx @modelcontextprotocol/server-slack` | Slack messaging |
| Notion | `npx @modelcontextprotocol/server-notion` | Notion content access |
