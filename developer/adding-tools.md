---
title: "Adding Tools"
source: https://hermes-agent.nousresearch.com/docs/developer-guide/contributing/
mirrored_at: 2026-04-12T01:11:32Z
---
# Adding Tools

This guide explains how to add custom tools and slash commands to Hermes Agent, and how to set up a local development environment for that work.

## Tool System Overview

Hermes uses a self-registration pattern for tools:

1. Create a tool file under `tools/`
2. Import it in `model_tools.py`
3. Register it in `toolsets.py`

Each tool handler receives structured arguments and returns a **JSON string** that the model can interpret.

## Add a New Tool

### Step 1: Create the Tool File

Create a new file such as `tools/my_tool.py`:

```python
import json
from tools.registry import tool

@tool(
    name="my_custom_tool",
    description="Describe clearly what the tool does so the model knows when to call it.",
    parameters={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The query to process"
            },
            "limit": {
                "type": "integer",
                "description": "Maximum number of results to return",
                "default": 10
            }
        },
        "required": ["query"]
    }
)
def my_custom_tool(query: str, limit: int = 10) -> str:
    """Implementation for the tool."""
    try:
        results = do_something(query, limit)
        return json.dumps({
            "success": True,
            "results": results,
            "count": len(results)
        }, ensure_ascii=False)
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e)
        }, ensure_ascii=False)

def do_something(query: str, limit: int) -> list:
    return [f"Result {i}: {query}" for i in range(limit)]
```

Key conventions:

- Every tool handler should return a JSON string via `json.dumps()`
- The `@tool` decorator registers the tool automatically
- The `description` field strongly influences tool selection
- `parameters` should follow JSON Schema conventions

### Step 2: Import It in `model_tools.py`

Open `hermes_cli/model_tools.py` and add the import:

```python
# Existing imports...
from tools.file_tools import *
from tools.shell_tools import *
# ...other tools...

# Your tool
from tools.my_tool import *
```

### Step 3: Register It in `toolsets.py`

Open `tools/toolsets.py` and add the tool to an existing toolset, or define a new one:

```python
TOOLSETS = {
    "filesystem": ["read_file", "write_file", "list_directory"],
    "shell": ["run_command", "run_script"],

    # Add to an existing toolset
    "web": ["fetch_url", "my_custom_tool"],

    # Or define a dedicated toolset
    "my_tools": ["my_custom_tool"],
}
```

## Return Value Conventions

All tool handlers should return JSON strings. A common pattern is:

```python
# Success
return json.dumps({
    "success": True,
    "data": result_data
}, ensure_ascii=False)

# Failure
return json.dumps({
    "success": False,
    "error": "Describe what went wrong"
}, ensure_ascii=False)

# Simple result
return json.dumps({"result": "some value"}, ensure_ascii=False)
```

Using `ensure_ascii=False` helps preserve readable non-ASCII text when needed.

## Add a Slash Command

Slash commands such as `/new` and `/reset` are defined in `hermes_cli/commands.py` with `CommandDef`:

```python
from hermes_cli.commands import CommandDef, register_command

@register_command
class MyCommand(CommandDef):
    name = "mycommand"
    aliases = ["mc"]
    description = "My custom command"
    requires_agent = False

    def execute(self, args: str, context: dict) -> str | None:
        """
        args: the raw text after the slash command
        context: current session context
        """
        if args:
            return f"You passed: {args}"
        return "Command executed"
```

Users can then trigger it with `/mycommand` or `/mc`.

## Local Development Environment

### Clone the Repository

```bash
git clone --recurse-submodules https://github.com/NousResearch/hermes-agent.git
cd hermes-agent
```

### Install `uv`

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or install via pip
pip install uv
```

### Create a Virtual Environment and Install Dependencies

```bash
# Create the venv
uv venv venv --python 3.11
export VIRTUAL_ENV="$(pwd)/venv"

# Install Hermes with common extras + dev tooling
uv pip install -e ".[all,dev]"

# Optional but recommended for full contributor setup
uv pip install -e "./tinker-atropos"
```

### Run the Test Suite

```bash
# Run all tests
pytest

# Run one test file
pytest tests/test_tools.py

# Run one test function
pytest tests/test_tools.py::test_my_tool

# Verbose output
pytest -v

# Coverage report
pytest --cov=hermes_cli --cov-report=html
```

### Run Hermes Locally

```bash
# With the virtual environment activated
hermes

# Or run as a module
python -m hermes_cli
```

## Test Your Tool

Write tests under `tests/`:

```python
import json
from tools.my_tool import my_custom_tool

def test_my_tool_basic():
    result = my_custom_tool(query="test query")
    data = json.loads(result)
    assert data["success"] is True
    assert "results" in data

def test_my_tool_with_limit():
    result = my_custom_tool(query="test", limit=5)
    data = json.loads(result)
    assert data["count"] == 5

def test_my_tool_error_handling():
    result = my_custom_tool(query="")
    data = json.loads(result)
    # Add assertions that match your error-handling behavior
```

## Best Practices

### Write Precise Descriptions

The model mainly chooses tools based on the description, so make it concrete and actionable.

```python
# Too vague
description = "Process data"

# Better
description = "Search the local filesystem for files matching a pattern and return their paths. Use this when you need to find files by name or glob."
```

### Document Parameters Well

```python
"parameters": {
    "type": "object",
    "properties": {
        "pattern": {
            "type": "string",
            "description": "Glob pattern such as '*.py' or '**/*.json'"
        },
        "directory": {
            "type": "string",
            "description": "Starting directory for the search; defaults to the current working directory",
            "default": "."
        }
    },
    "required": ["pattern"]
}
```

### Handle Errors Cleanly

Convert runtime exceptions into structured JSON instead of letting them crash the agent:

```python
try:
    result = risky_operation()
    return json.dumps({"success": True, "result": result})
except FileNotFoundError as e:
    return json.dumps({"success": False, "error": f"File not found: {e}"})
except PermissionError as e:
    return json.dumps({"success": False, "error": f"Permission denied: {e}"})
except Exception as e:
    return json.dumps({"success": False, "error": f"Unexpected error: {e}"})
```

### Keep Tools Focused

A tool should do one job well. If a workflow is complex, split it into multiple tools and let the model chain them together.
