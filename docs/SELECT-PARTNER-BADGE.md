# ServiceNow Select Partner (Build) badge — 2026-11-12
- Source: ~/Downloads/badges/Build Badge.png (official RGB; the CMYK .eps converts dull, so it was not used).
- Assets: assets/partner/servicenow-select-build-{160,320,640}.webp + -320.png.
- scripts/build.mjs: badge <p class="sn-badge"> under the hero "rail"; proof-strip label → "ServiceNow Select Partner, Build".
- scripts/snapps.mjs: uc-badge labels → "ServiceNow Select Partner, Build".
- assets/site.css: .sn-badge styles (appended).
- NOT changed (waiting on Omar's wording): "Registered ServiceNow Build & Consulting Partner" in schema, footer, meta description, snapps app copy.
- State: staged to staging.dbaomarhuertasllc.com (version c4e7dcc9), tests 27/27 pass. NOT live. Promote: `npm run promote`.
- Rollback: git checkout the files above, `npm run stage`.
