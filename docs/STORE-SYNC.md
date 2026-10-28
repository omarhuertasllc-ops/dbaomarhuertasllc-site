# Keeping the site in step with the ServiceNow Store

Three pieces, all in this repo:

| Piece | What it does | Command |
|---|---|---|
| `src/content/servicenow-apps.json` | Source of truth for every Store app on the site. Hand-edit the app blocks (name, copy, features, `status`, `store_url`). The `store` block is machine-written. | edit by hand |
| `scripts/store-sync.mjs` | Reads each `store_url`, parses the Store page (`pageData`): published?, version, publish date, certified badge, pricing, compatible releases. If anything changed: rebuild, run tests, deploy to **staging**, commit locally, `ailog`, Mac notification. Never deploys live. | `npm run store:sync` (`--check` = dry run) |
| `scripts/promote.sh` | Rebuild + checks + deploy the **live** Worker + `git push`. Only after Omar has looked at staging and said yes. | `npm run promote` |

Staging: https://staging.dbaomarhuertasllc.com (Worker `dbaomarhuertasllc-site-staging`, `wrangler.staging.jsonc`). Deploy anything there with `npm run stage`.
Live: https://dbaomarhuertasllc.com (Worker `dbaomarhuertasllc-site`, `wrangler.jsonc`).

Schedule: launchd `com.omarhuertasllc.site-store-sync` runs the sync every 6 hours (`~/Library/LaunchAgents/com.omarhuertasllc.site-store-sync.plist`). Logs: `.build/store-sync.log` (what changed), `.build/store-sync.out|err` (raw).

## When a new app gets listed
1. Add its Store URL to `store_url` in the json (Store search needs a login, so discovery is manual) and set `status` to `listed`.
2. Put screenshots in `assets/snapps/<slug>/*.webp` (1600 px wide) and name them in `hero_image` / `sections[].image`.
3. `npm run store:sync` fills the `store` block. The build then makes it the home-page spotlight automatically: newest `store.certified_at` among listed, live apps wins.
4. Look at staging, then `npm run promote`.

## What the build guarantees
- "Certified" and the Store button only render when the Store says `published` and shows the certified badge. `in_review` / `coming_soon` apps get a "Get notified" contact button instead.
- Every page, the hub (`/servicenow-apps.html`), nav, footer, palette and sitemap come from the json, so nothing is lost on rebuild.

## Rollback
Live: `git revert <sha> && npm run promote`. Staging only: `npm run stage` from any commit.
