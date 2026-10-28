#!/bin/sh
# Promote what is on staging to live. Run only after Omar has looked at https://staging.dbaomarhuertasllc.com and said yes.
# Rebuilds from the committed sources, re-runs the checks, deploys the LIVE Worker, then pushes main so the repo matches live.
set -e
cd "$(dirname "$0")/.."
if [ -n "$(git status --porcelain)" ]; then echo "Working tree is not clean. Commit or stash first."; git status --short; exit 1; fi
npm run build
npm test
python3 scripts/check_site.py
npx wrangler deploy -c wrangler.jsonc
git push origin main
sha=$(git rev-parse --short HEAD)
ailog add claude "dbaomarhuertasllc-site PROMOTED to live: $sha (wrangler.jsonc). Staging and live now match. Rollback: git revert + npm run promote." || true
echo "Live: https://dbaomarhuertasllc.com ($sha)"
