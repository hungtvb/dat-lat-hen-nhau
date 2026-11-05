# Staging Deployment — Đà Lạt Hẹn Nhau

**Status:** Implementation plan accepted for **limited staging** by user's explicit deployment request; not a production launch.  
**Target source:** `ops/staging-deploy` stacked on `feat/multiplayer-foundation`, not `main`.  
**Scope:** Vite/Three.js on Vercel Preview + **single** Colyseus Node.js process on a new Railway staging project/environment.

## Architecture and responsibilities

1. **Railway:** build repository root with `npm ci --include=dev && npm run build` using `railway.json`; start `npm run start --workspace @dalat/server`. Railway supplies `PORT`, healthcheck `GET /health`, HTTPS/WSS ingress. Exactly one replica; in-memory Colyseus matchmaking cannot scale horizontally without a shared presence/driver.
2. **Vercel:** Git-linked project from the same repo and **staging feature branch**, Vite build from monorepo root: install `npm ci`, build `npm run build`, output `apps/web/dist`, Node 22. Set `VITE_API_ORIGIN=https://<railway-domain>` in **preview** environment **before** build.
3. **CORS:** Colyseus 0.17 matchmaker intercepts OPTIONS before Express and has its own CORS handling. A custom getCorsHeaders allowlist prevents wildcard responses (including /matchmake/joinById). Express room creation `POST /api/rooms` and `OPTIONS` accept only exact comma-separated `ALLOWED_ORIGINS` from Railway staging environment. Set to the verified Vercel preview URL; no raw invite credentials in logs. The CI server uses MAX_ROOM_CREATES_PER_5_MIN=30 to cover the sequential room-creation scenarios without obscuring the production default of 8. A rejected OPTIONS preflight may return HTTP 204 with an empty Access-Control-Allow-Origin; browser rejection is the invariant, not a specific status.
4. **Proxy:** `TRUST_PROXY=1` only because staging is behind the Railway ingress; do not trust spoofable forwarding headers from arbitrary direct clients.
5. **Isolation:** create fresh project `dat-lat-hen-nhau-staging`, **environment `staging`**, and Vercel project `dat-lat-hen-nhau-preview`. Do not repurpose unknown project `joyful-generosity`. No database or persistent state required.
6. **No secrets** are checked into Git. Public backend URL and build-time public `VITE_API_ORIGIN` are not secrets; room tokens remain high-entropy and client-held.

## Before publish checklist

- [x] GitHub Actions 10/10 local multiplayer/CORS E2E on staging commit `f82771b`.
- [x] Railway staging deployment SUCCESS; external `GET /health` 200 after fixing domain `targetPort` from 2567 to actual server PORT 8080.
- [x] `ALLOWED_ORIGINS` configured for exact Vercel preview origins; external negative POST 403; room create 201 and matchmaker preflights 204/joins 200 observed from Railway edge logs.
- [x] Vercel preview READY with public build-time `VITE_API_ORIGIN=https://dalat-colyseus-staging.up.railway.app`; remote two-browser join succeeds, proving no localhost fallback for that path.
- [ ] Physical two-device/WAN home/mobile session, voluntary leave and prolonged reconnect still required. **Automated proof:** two independent Chromium contexts on a remote GitHub runner joined the same staging room, verified roster and moving-player WebSocket state patches via HTTPS/WSS; this is not two separate physical networks.
- [x] No changes to `main` and no extra Colyseus replicas. Vercel **separate staging-named project** has preview deployment; automated test does not print invite tokens.

## Rollback

Disable access to the preview (or remove staging domain), then redeploy previous staging commit. Railway in-memory rooms are lost when the instance restarts, so notify testers of connection interruption. Do not claim sessions persist across deployments.

## Remaining blockers for public release

This deployment intentionally serves the **placeholder** lake/avatars, not the approved D2 art proof. Abuse throttling at proxy level, real-device GPU/FPS, mobile/UX, and multi-device WAN playtest need evidence before a public launch.

## Live staging records (2026-11-05)

- Railway project `dat-lat-hen-nhau-staging`, environment `staging`, Colyseus URL: `https://dalat-colyseus-staging.up.railway.app`. Initial Git integration incorrectly used `main` then failed to reconnect `ops/staging-deploy`: Railway's OAuth account lacks GitHub repository authorization. **Temporary fallback:** official public `node:22` container pulls the *public repository*, checks out and verifies CI-green commit `a090f4668d80ed9f79cba6cf590de047495f49bb`, installs/builds then launches `@dalat/server`. This is staging-only; restart takes much longer and network access to GitHub/npm is required. Replace with GitHub-sourced builds (grant Railway GitHub repo authorization) before maintainable CI/CD.
- Vercel project `dat-lat-hen-nhau-preview`, branch alias `https://dat-lat-hen-nhau-preview-git-ops-stagi-636dc7-hungtvbs-projects.vercel.app`; public build-time `VITE_API_ORIGIN` points at Railway URL. Vercel preview build is static-only; Colyseus remains on Railway.
- `playwright.remote.config.ts`, `tests/remote/staging-live.spec.ts`, and `.github/workflows/staging-smoke.yml` run HTTPS API + real two-browser WebSocket smoke separately from local CI; **do not claim WAN success unless this workflow passes**. This check uses GitHub CI (one cloud runner) rather than two separate home/mobile networks.
- Both platforms may accrue hosting usage. Keep the staging environment restricted to invited testers; no accounts, user analytics, persistent rooms or full D2 scene yet.

## Verified live staging — 2026-11-05

**Frontend:** [Open preview](https://dat-lat-hen-nhau-preview-git-ops-stagi-636dc7-hungtvbs-projects.vercel.app/), Vercel deployment from `f82771b` READY. **Backend:** `https://dalat-colyseus-staging.up.railway.app`, Railway service `dalat-colyseus` SUCCESS, single replica.

**External smoke:** [GitHub Actions run 42048418805, attempt 2](https://github.com/hungtvb/dat-lat-hen-nhau/actions/runs/42048418805/attempts/2) — **3/3 Playwright PASS (9.4s)**: HTTPS healthcheck, origin denial, two independent Chromium contexts through Vercel and Railway, invitation creation/join, 2/6 roster, server WebSocket state-patch traffic during movement. This proves browser multiplayer via public endpoints **from one remote cloud runner**, not actual two devices on different ISPs.

**Root cause fixed from first remote test:** Railway domain initially routed port `2567` while runtime listened on `8080`, producing HTTP 502. Domain target corrected to `8080`; Railway edge logs confirm `GET /health` 200, blocked `POST /api/rooms` 403, allowed create 201 and two matchmaker joins 200.

**Limitations:** This private-group test preview still renders symbolic lake/avatars. Railway GitHub OAuth access to this repository is missing; backend uses official Node image with a **pinned, CI-verified source checkout at runtime** (staging-only and slower restarts). Reconnect Railway GitHub App for reliable source builds before public release. Paid/free hosting quota usage may accrue. Neither real GPU quality nor two physical-user WAN reliability is accepted.
