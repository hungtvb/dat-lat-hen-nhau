# Implementation Status — 2026-11-05

**Scope:** T01 bootstrap + typed contracts and staged T02/T03 Colyseus + Three.js network vertical slice. Repository `hungtvb/dat-lat-hen-nhau` has an active draft foundation PR. GitHub Actions has now executed real Colyseus + Chromium tests against the server/client; this is evidence for the network slice, **not** a finished game or multi-device WAN release.

| Work item | Current evidence | Status |
|---|---|---|
| T01 monorepo, typed shared contracts | `package.json` workspaces, tracked `package-lock.json`, 6 contract-test groups in GitHub CI | **CI VERIFIED** |
| T01 CI workflow | `npm ci`, contract tests, server/web typecheck, build and Playwright E2E passed in [workflow 41998367589](https://github.com/hungtvb/dat-lat-hen-nhau/actions/runs/41998367589) (`f72a3afd`) | **CI VERIFIED** |
| T02 private room + invite gate | Real create + join-by-invite with two isolated browser contexts; invalid invite rejected; room full/expiry/direct-ID cases not yet E2E | **PARTIAL E2E VERIFIED** |
| T03 server-authoritative movement | Remote avatar position changed in Playwright two-client E2E; speed/replay controls covered only in shared contract tests | **PARTIAL E2E VERIFIED** |
| T03 client presence / avatar | Two clients observe roster and remote presence; test drops real WebSocket using Colyseus code 4010 after SDK 5s minUptime, then verifies same session ID returns | **E2E VERIFIED (BASIC RECONNECT)** |
| Lobby UI | Browser `page.set_content()` with authored HTML + CSS; screenshots saved 1440px and 390px, no horizontal overflow | **STATIC UI OBSERVED** |
| T04 polished lakeside art proof | Placeholder only; no GPU camera/lighting/photo review | **NOT STARTED** |
| T05+ social actions | None | **NOT STARTED** |

## Verified local commands

Node.js `v22.16.0`, TypeScript globally installed, Python 3.13.5, Chromium available through Playwright.

1. `tsc -p packages/shared/tsconfig.json` → exit 0; generated `packages/shared/dist`.
2. `node --test tests/integration/contracts.test.mjs` → **6 test groups passed**, 0 failures.
3. TypeScript syntax parser over 10 source `.ts` files → **0 syntax errors**. This is not a dependency-resolved typecheck.
4. PostCSS parsed authored CSS → **93 style nodes**, 0 parse errors (before final readable-text overrides).
5. Headless Chromium `page.set_content` with the authored HTML+CSS (no JS runtime) → desktop 1440/1440 and mobile 390/390 scroll/client width. Images from the local source bundle: `docs/evidence/lobby-desktop.png`, `lobby-mobile.png`; GitHub import currently contains the HTML preview only, not these two PNG artifacts.

## Blocking conditions and next gate

**Verified GitHub runner:** Ubuntu, Node 22, `npm ci --no-audit --no-fund`, `npm test` (six groups), `npm run typecheck`, `npm run build`, Chromium Playwright `npm run test:e2e` (3/3 PASS, 19.4s). Evidence: [workflow 41998367589](https://github.com/hungtvb/dat-lat-hen-nhau/actions/runs/41998367589). Scenarios: M01 two isolated browser contexts with join + synchronized movement, M06 invalid invite token, and M03 subset abnormal WebSocket close/reconnect with same avatar/session ID. For M03 this **does not** prove a 10–20 second physical network outage or full seat reservation (seats not implemented).

**Remaining gates:** Real two-device/WAN connections, 6-person capacity, disconnect beyond reservation time, host handoff, full invite edge cases, real WebGL screenshots/visual inspection and FPS QA. CI can construct Three.js canvas in headless Chromium but this is **not** visual-quality proof. Foundation stays Draft until acceptance/review; do not conflate the placeholder lake with the polished scenic slice. Local environment npm registry DNS remains unavailable, so full app was executed on GitHub runner, not locally here.

## Security caveats

- Invite token stays in URL fragment and is sent only as a join option (not query string). It is never logged intentionally.
- Direct `joinById` is still gated by `LakesideRoom.onAuth`, and no public create/join-or-create matchmaker methods are exposed.
- Creation rate limit is currently an in-memory per-process development safeguard; production still needs reverse-proxy/application-layer abuse limits.
- No login, persistent store, voice chat, photo upload, or personal analytics.
- No external assets or geographic claims incorporated into runtime; current world is symbolic geometry.
