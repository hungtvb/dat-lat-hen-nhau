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

- [ ] Review staging branch changes; GitHub Actions contract/typecheck/build/Playwright E2E green.
- [ ] Railway staging deployment reaches SUCCESS; `GET /health` externally returns 200.
- [ ] Set `ALLOWED_ORIGINS` on Railway and test positive and negative CORS preflight using Vercel origin.
- [ ] Vercel preview build READY, no `localhost:2567` in the built application network requests.
- [ ] 2 independent *remote* users join same room via HTTPS/WSS; movement sync, leave and reconnect. Distinguish browser contexts on one machine from physical devices.
- [ ] No accidental production-branch deploy or launch; no 2nd Colyseus replica, no room token in CI logs.

## Rollback

Disable access to the preview (or remove staging domain), then redeploy previous staging commit. Railway in-memory rooms are lost when the instance restarts, so notify testers of connection interruption. Do not claim sessions persist across deployments.

## Remaining blockers for public release

This deployment intentionally serves the **placeholder** lake/avatars, not the approved D2 art proof. Abuse throttling at proxy level, real-device GPU/FPS, mobile/UX, and multi-device WAN playtest need evidence before a public launch.

## Live staging records (2026-11-05)

- Railway project `dat-lat-hen-nhau-staging`, environment `staging`, Colyseus URL: `https://dalat-colyseus-staging.up.railway.app`. Initial Git integration incorrectly used `main` then failed to reconnect `ops/staging-deploy`: Railway's OAuth account lacks GitHub repository authorization. **Temporary fallback:** official public `node:22` container pulls the *public repository*, checks out and verifies CI-green commit `a090f4668d80ed9f79cba6cf590de047495f49bb`, installs/builds then launches `@dalat/server`. This is staging-only; restart takes much longer and network access to GitHub/npm is required. Replace with GitHub-sourced builds (grant Railway GitHub repo authorization) before maintainable CI/CD.
- Vercel project `dat-lat-hen-nhau-preview`, branch alias `https://dat-lat-hen-nhau-preview-git-ops-stagi-636dc7-hungtvbs-projects.vercel.app`; public build-time `VITE_API_ORIGIN` points at Railway URL. Vercel preview build is static-only; Colyseus remains on Railway.
- `playwright.remote.config.ts`, `tests/remote/staging-live.spec.ts`, and `.github/workflows/staging-smoke.yml` run HTTPS API + real two-browser WebSocket smoke separately from local CI; **do not claim WAN success unless this workflow passes**. This check uses GitHub CI (one cloud runner) rather than two separate home/mobile networks.
- Both platforms may accrue hosting usage. Keep the staging environment restricted to invited testers; no accounts, user analytics, persistent rooms or full D2 scene yet.
