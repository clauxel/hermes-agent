# Website Changelog

## 2026-06-25 - hermes-agent.space Cloudflare Worker repair

- Created the Cloudflare zone `hermes-agent.space` in this account; Cloudflare assigned `archer.ns.cloudflare.com` and `sydney.ns.cloudflare.com`, matching the current WHOIS nameservers.
- Added `wrangler.space.toml` so the existing `hermes-agent-space` Worker can be deployed from this source without colliding with the existing `my-hermesagent-studio` routes.
- Added `hermes-agent.space` and `www.hermes-agent.space` to the Worker host allowlist.
- Passed `npm test` and `npm run build`.
- Deployed Cloudflare Worker/Assets `hermes-agent-space` version `f87b4a8e-738c-41a6-a5ab-0119ebe2e1cf` with `hermes-agent.space/*` and `www.hermes-agent.space/*` routes.
- Verified the workers.dev preview serves the site and `/api/polar-checkout` returns a hosted `buy.polar.sh` checkout URL.
- Production verification is blocked because WHOIS reports `serverHold` and the apex/www production hosts fail DNS/HTTPS. The registrar or registry must remove the hold before the production host can reach Polar in Chrome.

## 2026-06-17 - Hotword overlay split

- Added independent Cloudflare Worker + Assets hotword pages for hermesagent.studio.
- Routes are scoped to the new intent pages plus sitemap, robots, and llms so existing homepage, checkout, API, and MCP behavior remain with the current production Worker.
- New pages: /hermes-agent-cli/, /ai-agent-cli/, /hermes-mcp-workflow/.

## 2026-06-12 exposure rescue pages

- Added AI-readable and human-useful static intent pages for uncovered traffic terms: `persistent AI agent`, `AI agent memory`, `agent workflow automation`.
- Replaced the old hidden SEO answer block with a readable first-packet fallback inside `#root` where an index shell exists.
- Refreshed pricing, checkout fallback, privacy, terms, sitemap, robots, and llms surfaces for the exposure-click rescue checklist.
- Verification pending: rebuild/deploy and rerun the exposure rescue checklist.

## 2026-07-01 - MiroFish contextual reference

- Added one contextual related-resource link to MiroFish AI Simulator with UTM tracking for hermes-agent.space.
- Placement rule: secondary Resources/Source context when available, otherwise the homepage tail; no hero, nav, pricing, checkout, or primary CTA links were changed.
- SEO safety: brand anchor only, one link per canonical site surface, visible editorial context, and no keyword-stuffed footer/sitewide block.
- Verification pending: run the site build/deploy workflow and live link checks after all portfolio edits are applied.
