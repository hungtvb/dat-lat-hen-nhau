# Implementation Status — 2026-11-05

**Scope:** T01 bootstrap + typed contracts and staged T02/T03 Colyseus + Three.js network vertical slice. Repository `hungtvb/dat-lat-hen-nhau` has an active draft foundation PR. GitHub Actions has now executed real Colyseus + Chromium tests against the server/client; this is evidence for the network slice, **not** a finished game or multi-device WAN release.

| Work item | Current evidence | Status |
|---|---|---|
| T01 monorepo, typed shared contracts | `package.json` workspaces, tracked `package-lock.json`, 6 contract-test groups in GitHub CI | **CI VERIFIED** |
| T01 CI workflow | `npm ci`, 6 contract groups, typecheck, build and **8/8 real Colyseus/Playwright E2E** passed in [workflow 42023515834](https://github.com/hungtvb/dat-lat-hen-nhau/actions/runs/42023515834) (`87281e7`) | **CI VERIFIED** |
| T02 private room + invite gate | Direct `joinById` without token rejected; invite room survives failed attempt; six guests admitted, seventh rejected, freed seat reusable | **E2E VERIFIED (LOCAL CI)** |
| T03 server-authoritative movement | Remote avatar position changed in Playwright two-client E2E; speed/replay controls covered only in shared contract tests | **PARTIAL E2E VERIFIED** |
| T03 client presence / avatar | Two-client roster/reconnect identity; **45s timeout cleans ghost avatar**; no reused spawn slot; host handoff skips disconnected guest | **E2E VERIFIED (SCOPED)** |
| Lobby UI | Browser `page.set_content()` with authored HTML + CSS; screenshots saved 1440px and 390px, no horizontal overflow | **STATIC UI OBSERVED** |
| Staging deploy (ops PR #3) | Vercel static preview READY, Railway Colyseus single instance SUCCESS. GitHub Actions [remote smoke 42048418805 attempt 2](https://github.com/hungtvb/dat-lat-hen-nhau/actions/runs/42048418805/attempts/2) **3/3 PASS** over public HTTPS/WSS from one CI runner; real-device WAN test still outstanding | **STAGING E2E VERIFIED (REMOTE CI)** |
| Desktop session stability (PR #4) | Shared cleanup for terminal `onLeave` and voluntary leave, stale-session callback guard and owned-material disposal. Real Chromium tests verify exit→rejoin and terminal WebSocket close→lobby→new room; existing temporary SDK reconnect remains green. [CI 42068283706](https://github.com/hungtvb/dat-lat-hen-nhau/actions/runs/42068283706) **12/12 PASS** | **CI VERIFIED (SCOPED)** |
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

**Verified GitHub runner:** Ubuntu/Node 22, locked `npm ci`, 6 contract test groups, `npm run typecheck`, `npm run build`, and Chromium Playwright `npm run test:e2e` — **8/8 PASS (51.6s)**. [GitHub Actions run 42023515834](https://github.com/hungtvb/dat-lat-hen-nhau/actions/runs/42023515834) on `87281e7`.

**Covered runtime scenarios:** M01 create/join and server-controlled position visible in a separate browser context; M03 reconnection via real WebSocket close (same session ID); M04 45-second reconnect expiry removes disconnected player from authoritative state (seats not implemented); M05 sixth join accepted/seventh rejected and freed spot reused; M06 invalid/no token rejected and an unauthorized pre-host attempt does **not** dispose the room; M07 connected host promoted when previous host leaves while another guest is disconnected; joining after departure does not reuse occupied spawn slot. These run on **one GitHub CI runner**, not physical devices or WAN.

**Remaining review gates:** Railway GitHub App permission to replace temporary pinned-clone runtime deploy, independent real-device/WAN test, capacity/latency/performance on target laptop, 3–6 people playtest, stronger input-abuse/join throttling, HTTP create limiter memory bounds, terminal client cleanup UX and WebGL screenshot/visual inspection. Client/world social features, chairs/emotes/chat/photo and art proof are not implemented. PR #1 remains Draft until outstanding launch criteria are reviewed; no GPU visual PASS is claimed.

## Security caveats

- Invite token stays in URL fragment and is sent only as a join option (not query string). It is never logged intentionally.
- Direct `joinById` is still gated by `LakesideRoom.onAuth`, and no public create/join-or-create matchmaker methods are exposed.
- Creation rate limit is currently an in-memory per-process development safeguard; production still needs reverse-proxy/application-layer abuse limits.
- No login, persistent store, voice chat, photo upload, or personal analytics.
- No external assets or geographic claims incorporated into runtime; current world is symbolic geometry.

**PR #4 review addendum:** Added WebGL initialization failure browser scenario on 2026-11-05. Previous CI 42068283706 proves 12/12 lifecycle/room tests on commit 2d27925; the new scenario requires a fresh CI run before being called PASS.
