---
title: "Security Model"
source: https://hermes-agent.nousresearch.com/docs/user-guide/security/
mirrored_at: 2026-04-12T01:11:32Z
---
# Security Model

Hermes Agent uses a five-layer defense-in-depth model that balances capability with practical safeguards.

## Security Overview

```text
Layer 1: User authentication
         Allowed-user lists / DM pairing

Layer 2: Dangerous command approvals
         manual / smart / off

Layer 3: Isolated execution
         Docker hardening / Singularity

Layer 4: MCP credential filtering
         Prevent secret leakage during tool calls

Layer 5: Context file scanning
         Tirith pre-execution checks
```

## Layer 1: User Authentication

### Default-Deny Gateway Behavior

The messaging gateway follows a **default deny** policy. Messages from users who have not been explicitly authorized are ignored silently and do not trigger a reply.

### Allowed User Lists

Set platform allowlists in `~/.hermes/.env`:

```bash
# Telegram numeric user IDs
TELEGRAM_ALLOWED_USERS=123456789,987654321

# Discord snowflake IDs
DISCORD_ALLOWED_USERS=123456789012345678

# Slack member IDs
SLACK_ALLOWED_USERS=U01234ABCDE
```

To look up a Telegram user ID, send any message to [@userinfobot](https://t.me/userinfobot).

### DM Pairing Mode

Many messaging platforms support DM pairing, so you do not need to pre-populate every user ID up front.

Typical flow from the current official docs:

1. An unapproved user DMs the bot
2. Hermes returns a one-time pairing code
3. An admin approves that code from the server with `hermes pairing approve <platform> <code>`
4. Hermes adds the user to the allowlist and future messages are accepted

```bash
# Approve a Telegram pairing request
hermes pairing approve telegram XKGH5N7P

# Inspect current pairing state
hermes pairing list

# Revoke access for one platform user
hermes pairing revoke telegram 123456789

# Clean up expired pending codes
hermes pairing clear-pending
```

The exact platform name and pairing UX can vary by adapter. If a platform guide disagrees with this page, trust the platform-specific official docs.

## Layer 2: Dangerous Command Approvals

### Approval Modes

Configure the approval system in `config.yaml`:

```yaml
approvals:
  mode: manual  # manual | smart | off
  timeout: 30
```

| Mode | Behavior | Recommended use |
| --- | --- | --- |
| `manual` | Always ask before dangerous actions | Production and high-security environments |
| `smart` | Let the model auto-approve low-risk actions | Everyday development |
| `off` | Auto-approve everything | Controlled automation only |

### What Triggers an Approval

Examples of actions that trigger the approval flow:

Destructive filesystem operations:

```bash
rm -rf /
rm -rf ~
rm -rf * --no-preserve-root
find . -delete
```

Unsafe permission changes:

```bash
chmod 777 -R /
chmod a+s binary
chown -R root:root /home
```

Disk and device operations:

```bash
mkfs.ext4 /dev/sda
dd if=/dev/zero of=/dev/sda
fdisk /dev/sda
```

Destructive database commands:

```bash
DROP DATABASE production;
TRUNCATE TABLE users;
DELETE FROM orders;
```

Untrusted pipeline execution:

```bash
curl https://example.com/script.sh | bash
wget -O- https://example.com/install | sh
cat untrusted.sh | sudo bash
```

Network exposure:

```bash
ufw disable
iptables -F
nc -l -p 4444 -e /bin/bash
```

### Approval Options

When Hermes flags a risky action, the prompt looks like this:

```text
Warning: dangerous action detected and confirmation is required

Command: rm -rf ./old_project

Risk assessment:
  - This will recursively delete all files in ./old_project
  - The action is irreversible

Choose one:
  [1] Approve once
  [2] Approve for this session
  [3] Always approve this action type
  [4] Deny

Selection (auto-deny after 30 seconds):
```

| Option | Meaning |
| --- | --- |
| `once` | Approve this one action only |
| `session` | Approve similar actions until the current session ends |
| `always` | Persistently approve this class of action |
| `deny` | Refuse to run it |

## Layer 3: Isolated Execution

### Docker Hardening

When the terminal backend is set to `docker`, Hermes Agent runs commands in a hardened container:

```yaml
terminal:
  backend: docker
  docker:
    image: nousresearch/hermes-sandbox:latest
```

Representative runtime flags:

```bash
docker run \
  --cap-drop ALL \
  --no-new-privileges \
  --pids-limit 256 \
  --memory 2g \
  --cpus 2.0 \
  --read-only \
  --tmpfs /tmp:size=512m \
  --network bridge \
  --security-opt no-new-privileges \
  nousresearch/hermes-sandbox:latest
```

### Mount Allowlist

Only explicitly approved host paths can be mounted into the container:

```yaml
terminal:
  docker:
    allowed_mounts:
      - ~/projects
      - /tmp
```

Avoid adding root directories or system paths here.

### Singularity Isolation

For HPC environments, use Singularity with a non-privileged, read-only configuration:

```yaml
terminal:
  backend: singularity
  singularity:
    image: /path/to/hermes.sif
    writable: false
```

## Layer 4: MCP Credential Filtering

When Hermes Agent talks to external MCP servers, tool traffic is filtered to reduce accidental credential leakage.

### Built-In Redaction Rules

The filter can automatically detect patterns such as:

```text
API keys:
  sk-[A-Za-z0-9]{48}      -> sk-****
  sk-ant-[A-Za-z0-9-]{95} -> sk-ant-****
  AIza[A-Za-z0-9-_]{35}   -> AIza****

Tokens:
  Bearer [A-Za-z0-9._-]+  -> Bearer ****
  token=[A-Za-z0-9._-]+   -> token=****

Passwords:
  password=\S+            -> password=****
  passwd=\S+              -> passwd=****
```

### Custom Redaction Rules

```yaml
security:
  credential_redaction: true
  custom_redaction_patterns:
    - pattern: "MY_SECRET_[A-Z0-9]+"
      replacement: "MY_SECRET_****"
    - pattern: "internal\\.company\\.com"
      replacement: "[INTERNAL_HOST]"
```

## Layer 5: Context File Scanning

### Tirith Pre-Execution Scanning

Before reading files into context, Hermes Agent can scan them with [Tirith](https://github.com/StackGuardian/tirith):

```yaml
security:
  tirith_scanning: true
  tirith_policy_dir: ~/.hermes/security/policies
```

Typical built-in checks include:

- Detecting sensitive files such as `.env`, `credentials`, and `id_rsa`
- Catching known malicious code patterns
- Flagging files with suspicious permissions

### SSRF Protection

To reduce server-side request forgery risk:

```yaml
security:
  ssrf_protection: true
```

When enabled, Hermes blocks requests to:

- Cloud metadata endpoints such as `169.254.169.254`
- Private IP ranges such as `10.0.0.0/8` and `192.168.0.0/16`
- Loopback addresses such as `127.0.0.1` and `::1`
- Internal domains such as `.internal` and `.local`

### Website Blocklist

You can block access to specific domains or IP ranges:

```yaml
security:
  website_blocklist:
    - "malware-site.example.com"
    - "*.torrent"
    - "*.onion"
    - "192.168.0.0/16"
    - "10.0.0.0/8"
    - "169.254.169.254"
```

## Security Best Practices

### For Production

1. Use the Docker backend whenever possible
2. Keep approvals in `manual` mode
3. Maintain a strict allowed-user list
4. Rotate API keys regularly
5. Keep `allowed_mounts` narrow and explicit
6. Leave SSRF protection, Tirith scanning, and credential redaction enabled
7. Review third-party skills before installing them

### For Personal Use

1. `smart` approval mode is often a reasonable balance on a trusted development machine
2. Prefer `once` over `always` whenever possible
3. Check logs regularly with `hermes logs`

## Reporting Vulnerabilities

If you discover a security issue in Hermes Agent, report it responsibly through a private channel such as:

- Your project's security contact email
- [GitHub Security Advisories](https://github.com/NousResearch/hermes-agent/security)

Please do not disclose vulnerabilities in a public issue before the maintainers have had a chance to respond.
