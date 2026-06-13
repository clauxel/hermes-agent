---
title: "Background Sessions"
source: https://hermesagent.studio/features/background
mirrored_at: 2026-04-12T01:11:32Z
---
# Background Sessions

Background sessions let Hermes Agent run long-lived work in parallel while you continue using the main conversation.

## What Are Background Sessions?

By default, a normal Hermes conversation is synchronous: you send a message, wait for the result, and then continue. Background sessions remove that bottleneck.

With the `/background` command, you can launch multiple independent tasks at the same time. Each task runs in its own isolated execution context and reports the result back to the main conversation when it finishes.

```text
Main conversation
  - Background task A: crawl 50 pages and extract data       [running]
  - Background task B: analyze a repository and draft docs   [running]
  - Background task C: download and process a dataset        [running]
```

## Start a Background Session

### Basic Usage

```text
/background Research the latest resources on Rust async programming and turn them into a study outline
```

```text
/background Analyze all Go files under ~/projects/my-app and identify potential performance problems
```

```text
/background Fetch my GitHub activity for the last 30 days through the GitHub API and generate a report
```

### Name a Task

Naming tasks makes them easier to track:

```text
/background --name "Literature Review" Search for recent papers on LLM inference optimization and summarize the latest progress
```

```text
/background --name "Code Review" Review all Go files under backend/api and list issues by severity
```

### Override the Toolsets

By default, a background task inherits the current conversation's toolsets. You can override them explicitly:

```text
/background --toolsets "web,file" Download and summarize the React documentation changelog
```

## Isolated Execution Environment

Each background session has its own execution context.

### Separate Conversation History

Background sessions do not share the same message history as the main conversation:

```text
Main conversation context          Background task A context
  [user chat history]               [system prompt]
  [current user message]            [task instruction]
                                   [task execution trace]
```

That means:

- Background tasks do not automatically inherit sensitive details from the main chat
- The main conversation does not get flooded with intermediate task output
- Multiple background tasks stay isolated from one another

### Independent Task IDs

Each task gets a unique ID such as `bg-a7f3c2d1`:

```text
Background task started
ID: bg-a7f3c2d1
Name: Literature Review
Status: running
```

## Monitor Task Status

### List All Background Tasks

```text
/background list
```

Example output:

```text
ID            NAME               STATUS    ELAPSED   PROGRESS
-----------   ----------------   -------   -------   -----------------------------
bg-a7f3c2d1   Literature Review  running   2m 34s    analyzing paper 8/15
bg-b8e4d3f2   Code Review        done      5m 12s    12 issues found
bg-c9f5e4g3   Data Processing    failed    1m 05s    connection timeout
```

### Inspect One Task

```text
/background status bg-a7f3c2d1
```

### Cancel a Task

```text
/background cancel bg-a7f3c2d1
```

## Result Presentation

When a task completes, Hermes posts the result into the main conversation as a separate panel instead of interrupting whatever you are currently doing.

Example:

```text
Background task completed: Literature Review [bg-a7f3c2d1]  Duration: 8m 23s

## LLM Inference Optimization: Recent Research

### Main directions
1. Quantization techniques: AWQ, GPTQ, SmoothQuant
2. Speculative decoding: Medusa, Eagle
3. KV cache optimization: PagedAttention, FlashAttention

### Recommended reading
- AWQ paper
- ...
```

### Continue Working from a Background Result

Once a background task finishes, you can jump back into it:

```text
/background resume bg-a7f3c2d1
```

This switches the active context to that background session so you can continue from its task-specific history.

## Common Use Cases

### Parallel Research

Run several investigations at once:

```text
/background --name "Competitor Analysis" Compare five major AI API gateway products, including pricing and feature coverage
/background --name "Technical Evaluation" Compare Kong, APISIX, and Traefik under high-concurrency workloads
/background --name "User Feedback" Search Reddit and Hacker News discussions about AI API proxies
```

### Long-Running Data Processing

```text
/background --name "Log Analysis" --toolsets "terminal,file" Analyze /var/log/nginx/access.log, summarize hourly traffic, error rate, and top 10 slow endpoints
```

### Background Code Generation

```text
/background --name "Test Generation" --toolsets "file,terminal" Generate testify-based unit tests for all Go files under service/ and save them to matching _test.go files
```

### Monitoring and Alerts

```text
/background --name "Service Monitor" Check https://api.myservice.com/health every 5 minutes and alert the main conversation after 3 consecutive failures
```

## Configuration

```yaml
# ~/.hermes/config.yaml
background:
  max_concurrent: 5
  default_timeout: 3600
  notify_on_complete: true
  notify_on_fail: true
  auto_cleanup_days: 7
```

## Notes

- Background tasks consume their own token budget
- If Hermes shuts down, running background tasks are paused and can be resumed later
- Background tasks do not inherit the main conversation's frozen memory snapshot, though they can still read persistent memory such as `MEMORY.md`
- For long-running tasks, a clear `--name` is strongly recommended
