---
title: "Keyboard Shortcuts"
source: https://hermes-agent.nousresearch.com/docs/user-guide/cli/
mirrored_at: 2026-04-12T01:11:32Z
---
# Keyboard Shortcuts

This page lists the main keyboard shortcuts available in the Hermes CLI interface.

---

## Message Input

| Shortcut | Description |
| --- | --- |
| `Enter` | Send the current message |
| `Alt+Enter` or `Ctrl+J` | Insert a newline inside the input box |

---

## Clipboard And Media

| Shortcut | Description |
| --- | --- |
| `Alt+V` | Paste an image from the clipboard as an attachment |
| `Ctrl+V` | Paste text, or paste both text and an image when the clipboard includes one |

---

## Voice Input

| Shortcut | Description |
| --- | --- |
| `Ctrl+B` | Start recording, then press again to stop and transcribe |

After recording finishes, Hermes automatically converts the audio into text and places it in the input box so you can edit it before sending.

---

## Session Control

| Shortcut | Description |
| --- | --- |
| `Ctrl+C` | Interrupt the current task. Press twice within 2 seconds to force-exit Hermes |
| `Ctrl+D` | Exit Hermes, similar to typing `/exit` |
| `Ctrl+Z` | Suspend the process on Unix-like systems and return to the shell. Run `fg` to resume |

---

## Autocomplete

| Shortcut | Description |
| --- | --- |
| `Tab` | Accept the current suggestion or complete a slash command |

Typing `/` and then pressing `Tab` is a quick way to browse available commands.

---

## Tips

### Multi-line input

Hermes uses `Enter` to send messages. If you need to write code blocks or longer notes, use `Alt+Enter` or `Ctrl+J` for line breaks.

```text
This is the first line  <- Alt+Enter
This is the second line <- Alt+Enter
This is the third line
[Press Enter to send]
```

### Pasting images

When you are using a vision-capable model such as Claude 3 or GPT-4o, you can paste screenshots or copied images directly into the chat input:

1. Copy an image or screenshot to the clipboard
2. In Hermes, press `Alt+V` for image-only paste, or `Ctrl+V` if text may also be included
3. Confirm the image attachment appears above the input box
4. Type your question and press `Enter`

### Interrupting or exiting

- Press `Ctrl+C` once to stop the current tool call or long-running task and return to the input state
- Press `Ctrl+C` twice quickly to force-exit Hermes
- Press `Ctrl+D` for a normal exit with session state preserved

### Voice recording flow

1. Press `Ctrl+B` to start recording
2. Speak your message
3. Press `Ctrl+B` again to stop
4. Hermes transcribes the recording into text
5. Review the text if needed, then press `Enter` to send
