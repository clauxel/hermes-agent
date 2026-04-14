---
title: "Frequently Asked Questions (FAQ)"
source: https://hermes-agent.nousresearch.com/docs/
mirrored_at: 2026-04-12T01:11:32Z
---
# Frequently Asked Questions (FAQ)

---

## Basics

### How do I switch models?

Run `hermes model` to open the interactive model picker. Hermes groups models by provider and saves your selection as the new default.

You can also choose a model only for the current run:

```bash
hermes -m gpt-4o
hermes -m claude-3-5-sonnet-20241022
```

Or set it directly in the configuration:

```bash
hermes config set model claude-3-5-sonnet-20241022
```

---

### How do I check whether my installation is healthy?

Run:

```bash
hermes doctor
```

If you want Hermes to try automatic repairs where possible:

```bash
hermes doctor --fix
```

`hermes doctor` checks:

- Python version compatibility
- Dependency integrity
- API key configuration
- Network connectivity
- Configuration file format

---

### Which operating systems are supported?

| Platform | Support status |
| --- | --- |
| Linux | Fully supported |
| macOS | Fully supported |
| WSL2 (Windows Subsystem for Linux) | Supported and recommended on Windows |
| Native Windows (`cmd` / PowerShell) | Not supported |

If you are on Windows, install WSL2 with Ubuntu 22.04 or later and run Hermes inside the WSL environment.

---

### How do I add API keys?

Edit `~/.hermes/.env`:

```bash
# Open it in your preferred editor
nano ~/.hermes/.env
# or
code ~/.hermes/.env
```

Then add the keys you need:

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxx
GEMINI_API_KEY=xxxxxxxx
```

Restart Hermes after saving the file. You can also configure keys interactively with `hermes setup`.

---

## Terminal Backends

### Should I use the Docker backend or the local backend?

| Comparison | Local backend | Docker backend |
| --- | --- | --- |
| Setup complexity | Simple, works out of the box | Requires Docker installation |
| Isolation | No isolation, commands run on the host | Fully isolated environment |
| Security | Lower | Higher |
| Performance | Faster | Slightly slower, especially on first launch |
| Best for | Personal development and trusted environments | Production, multi-user setups, or untrusted code |

Recommended defaults:

- Use `local` for normal personal use
- Use `docker` when you need isolation
- Use `ssh` when Hermes should work on a remote machine

To switch:

```bash
hermes config set terminal.backend docker
```

---

## Memory

### Why does memory not update immediately?

Hermes writes new memory entries after the current session ends. That means:

- Information learned during this session is usually injected starting with the next session
- If you need Hermes to use something right away, mention it directly in the current conversation

To inspect stored memory:

```bash
hermes memory
```

---

## Session Management

### How do I reset or clear sessions?

You can delete a specific session, browse sessions interactively, or prune older ones:

```bash
# Delete one session
hermes sessions delete <session-id>

# Browse and delete interactively
hermes sessions browse

# Keep only the 20 most recent sessions
hermes sessions prune --keep 20
```

---

### How do I export sessions or profile data?

**Export a session**

```bash
# Export as Markdown
hermes sessions export <session-id> --format markdown > session.md

# Export as JSON
hermes sessions export <session-id> --format json > session.json
```

**Export a profile**

```bash
hermes profile export <profile-name> > my-profile.yaml
```

**Back up everything**

The entire `~/.hermes/` directory contains your configuration, session history, and memory data:

```bash
tar -czf hermes-backup.tar.gz ~/.hermes/
```

---

## Gateway And Messaging Platforms

### Can the gateway hit rate limits?

Hermes itself does not enforce a built-in rate limit, but upstream AI providers such as Anthropic and OpenAI do.

If you hit `429` rate-limit errors:

- Rotate to backup API keys when available
- Increase the spacing between messages or tasks
- Spread bulk jobs across time with `hermes cron`

---

## Models And Providers

### Does Hermes support Ollama or local models?

Yes. Hermes can use local models through Ollama.

1. Make sure Ollama is installed and running:

   ```bash
   ollama serve
   ollama pull llama3.2
   ```
2. Add the base URL to your `.env` file:

   ```bash
   OLLAMA_BASE_URL=http://localhost:11434
   ```
3. Start Hermes with the Ollama provider and model:

   ```bash
   hermes --provider ollama -m llama3.2
   ```

You can also choose an Ollama model through `hermes model`.

---

### Which AI providers are supported?

Hermes supports major providers including:

- Anthropic
- OpenAI
- Google Gemini
- Mistral
- Groq
- Ollama
- OpenRouter
- Together AI
- Perplexity
- Other providers that expose an OpenAI-compatible API

---

## Troubleshooting

### Hermes starts but does not respond. What should I check?

1. Verify API keys with `hermes doctor`
2. Confirm your network connection is working
3. Check logs in `~/.hermes/logs/hermes.log`
4. Start Hermes in verbose mode with `hermes -v`

---

### Tool calls keep failing. What should I do?

```bash
# Check whether tools loaded correctly
hermes tools

# Show detailed runtime logs
hermes -v

# Reset to the local backend to rule out Docker issues
hermes config set terminal.backend local
```

---

### How do I fully reset Hermes?

```bash
# Back up your data first
cp -r ~/.hermes/ ~/.hermes-backup/

# Remove all Hermes configuration and state
rm -rf ~/.hermes/

# Run setup again
hermes setup
```

---

## More Help

- Run `hermes --help` for the top-level command list
- Run `hermes <command> --help` for subcommand details
- Run `hermes doctor` to diagnose common issues
- Visit [GitHub Issues](https://github.com/NousResearch/hermes-agent/issues) to report bugs or ask questions
