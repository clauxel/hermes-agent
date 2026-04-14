---
title: "Themes"
source: https://hermes-agent.nousresearch.com/docs/user-guide/cli/
mirrored_at: 2026-04-12T01:11:32Z
---
# Themes

Hermes CLI supports theme skins that let you customize colors and visual styling in the terminal UI.

## Built-In Themes

Hermes ships with four built-in themes managed through `SkinConfig`:

| Theme | Style |
| --- | --- |
| `default` | Balanced blue-purple default palette for most terminals |
| `ares` | Bold red high-contrast theme |
| `mono` | Monochrome palette with fewer visual distractions |
| `slate` | Low-saturation dark slate palette for long sessions |

### Switch a Built-In Theme

```bash
hermes config set display.skin default
hermes config set display.skin ares
hermes config set display.skin mono
hermes config set display.skin slate
```

Or edit `~/.hermes/config.yaml` directly:

```yaml
display:
  skin: ares
```

## Custom Themes

### Theme File Location

Place custom theme files under `~/.hermes/skins/`:

```text
~/.hermes/
  skins/
    my-theme.yaml
    company-theme.yaml
```

### Theme File Format

Create `~/.hermes/skins/my-theme.yaml`:

```yaml
name: my-theme
description: "My custom theme"
author: "Your Name"

colors:
  user_message: "#61AFEF"
  user_label: "#528BFF"

  agent_message: "#ABB2BF"
  agent_label: "#C678DD"

  tool_name: "#E5C07B"
  tool_input: "#98C379"
  tool_output: "#56B6C2"
  tool_border: "#3E4451"

  status_bar_bg: "#21252B"
  status_bar_fg: "#ABB2BF"
  status_bar_model: "#61AFEF"
  status_bar_tokens: "#98C379"

  prompt_bg: "#282C34"
  prompt_fg: "#ABB2BF"
  prompt_cursor: "#528BFF"
  prompt_border: "#3E4451"

  highlight: "#E06C75"
  success: "#98C379"
  warning: "#E5C07B"
  error: "#E06C75"
  info: "#61AFEF"

  code_bg: "#1E2127"
  code_border: "#3E4451"

styles:
  user_label_bold: true
  agent_label_bold: true
  tool_name_bold: true
  show_tool_borders: true
  compact_mode: false
  show_timestamps: false

icons:
  user: ">"
  agent: "*"
  tool: "#"
  success: "+"
  error: "x"
  thinking: "."
```

### Use a Custom Theme

```bash
hermes config set display.skin my-theme
```

The new theme is picked up the next time Hermes starts.

## Supported Color Formats

Theme files support several color syntaxes:

| Format | Example | Notes |
| --- | --- | --- |
| Hex | `"#61AFEF"` | Recommended |
| RGB | `"rgb(97,175,239)"` | Explicit RGB values |
| Terminal color name | `"blue"`, `"bright_red"` | Built-in terminal color names |
| Indexed terminal color | `"color(33)"` | 256-color palette index |

## Theme Examples

### Dark One Dark Style

```yaml
name: one-dark
description: "Atom One Dark inspired theme"

colors:
  user_message: "#61AFEF"
  user_label: "#528BFF"
  agent_message: "#ABB2BF"
  agent_label: "#C678DD"
  tool_name: "#E5C07B"
  tool_input: "#98C379"
  tool_output: "#56B6C2"
  tool_border: "#3E4451"
  status_bar_bg: "#21252B"
  status_bar_fg: "#ABB2BF"
  status_bar_model: "#61AFEF"
  status_bar_tokens: "#98C379"
  prompt_bg: "#282C34"
  prompt_fg: "#ABB2BF"
  prompt_cursor: "#528BFF"
  prompt_border: "#3E4451"
  highlight: "#E06C75"
  success: "#98C379"
  warning: "#E5C07B"
  error: "#E06C75"
  info: "#61AFEF"
  code_bg: "#1E2127"
  code_border: "#3E4451"

styles:
  user_label_bold: true
  agent_label_bold: true
  show_tool_borders: true
  compact_mode: false
```

### Minimal Light Theme

```yaml
name: light-minimal
description: "Minimal theme for bright terminal backgrounds"

colors:
  user_message: "#0550AE"
  user_label: "#0969DA"
  agent_message: "#24292F"
  agent_label: "#8250DF"
  tool_name: "#953800"
  tool_input: "#116329"
  tool_output: "#0969DA"
  tool_border: "#D0D7DE"
  status_bar_bg: "#F6F8FA"
  status_bar_fg: "#24292F"
  status_bar_model: "#0969DA"
  status_bar_tokens: "#116329"
  prompt_bg: "#FFFFFF"
  prompt_fg: "#24292F"
  prompt_cursor: "#0969DA"
  prompt_border: "#D0D7DE"
  highlight: "#CF222E"
  success: "#116329"
  warning: "#7D4E00"
  error: "#CF222E"
  info: "#0969DA"
  code_bg: "#F6F8FA"
  code_border: "#D0D7DE"

styles:
  user_label_bold: true
  agent_label_bold: false
  show_tool_borders: true
  compact_mode: true
  show_timestamps: true

icons:
  user: ">"
  agent: "*"
  tool: "#"
```

## Sharing Themes

You can distribute a theme file to other Hermes users:

```bash
# Export
cp ~/.hermes/skins/my-theme.yaml ./my-theme.yaml

# Install on another machine
cp my-theme.yaml ~/.hermes/skins/
hermes config set display.skin my-theme
```

## Troubleshooting

**The theme does not load**

- Make sure the filename matches `display.skin` without the `.yaml` suffix
- Validate the YAML syntax:

```bash
python3 -c "import yaml; yaml.safe_load(open('~/.hermes/skins/my-theme.yaml'))"
```

- Restart Hermes after editing the file

**Colors look wrong**

- Make sure your terminal supports 24-bit color
- Check `echo $COLORTERM`; it should usually be `truecolor` or `24bit`
- If truecolor is unavailable, prefer named terminal colors such as `"blue"` or `"bright_cyan"`
