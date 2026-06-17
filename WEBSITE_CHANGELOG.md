# Website Changelog

## 2026-06-17 - Hotword overlay split

- Added independent Cloudflare Worker + Assets hotword pages for hermesagent.studio.
- Routes are scoped to the new intent pages plus sitemap, robots, and llms so existing homepage, checkout, API, and MCP behavior remain with the current production Worker.
- New pages: /hermes-agent-cli/, /ai-agent-cli/, /hermes-mcp-workflow/.

## 2026-06-12 exposure rescue pages

- Added AI-readable and human-useful static intent pages for uncovered traffic terms: `persistent AI agent`, `AI agent memory`, `agent workflow automation`.
- Replaced the old hidden SEO answer block with a readable first-packet fallback inside `#root` where an index shell exists.
- Refreshed pricing, checkout fallback, privacy, terms, sitemap, robots, and llms surfaces for the exposure-click rescue checklist.
- Verification pending: rebuild/deploy and rerun the exposure rescue checklist.
