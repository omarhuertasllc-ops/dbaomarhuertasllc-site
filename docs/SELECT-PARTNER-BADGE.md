# ServiceNow Select Partner (Build) badge — 2026-11-12
- Source: ~/Downloads/badges/Build Badge.png (official RGB; the CMYK .eps converts dull, so it was not used).
- Assets: assets/partner/servicenow-select-build-{160,320,640}.webp + -320.png.
- scripts/build.mjs: badge <p class="sn-badge"> under the hero "rail"; proof-strip label → "ServiceNow Select Partner, Build".
- scripts/snapps.mjs: uc-badge labels → "ServiceNow Select Partner, Build".
- assets/site.css: .sn-badge styles (appended).
- NOT changed (waiting on Omar's wording): "Registered ServiceNow Build & Consulting Partner" in schema, footer, meta description, snapps app copy.
- State: LIVE on dbaomarhuertasllc.com, commit 297c7bc (promoted 2026-11-12, verified badge served).
- Rollback: git checkout the files above, `npm run stage`.

## 2026-11-13: moved to the footer (Omar: "move the build badge to the bottom of the pages in the foot areas")
- Hero badge removed (scripts/build.mjs); badge now in the footer brand column on every generated page (104px, alt "ServiceNow Select Partner – Build", lazy). `.sn-badge` CSS replaced by `.foot-badge`.
- Legacy obvera/*.html footers got the same badge inline (they don't use build.mjs).
- State: STAGING only (staging.dbaomarhuertasllc.com, version be327960). Tests 27/27. Production on Omar's yes: `npm run promote`.
- Rollback: `git revert` this commit, `npm run stage`.
