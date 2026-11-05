# Staging Deployment — Đà Lạt Hẹn Nhau

**Status:** Implementation plan accepted for **limited staging** by user's explicit deployment request; not a production launch.  
**Target source:** `ops/staging-deploy` stacked on `feat/multiplayer-foundation`, not `main`.  
**Scope:** Vite/Three.js on Vercel Preview + **single** Colyseus Node.js process on a new Railway staging project/environment.

## Architecture and responsibilities

1. **Railway:** build repository root with `npm ci --include=dev && npm run build` using `railway.json`; start `npm run start --workspace @dalat/server`. Railway supplies `PORT`, healthcheck `GET /health`, HTTPS/WSS ingress. Exactly one replica; in-memory Colyseus matchmaking cannot scale horizontally without a shared presence/driver.
2. **Vercel:** Git-linked project from the same repo and **staging feature branch**, Vite build from monorepo root: install `npm ci`, build `npm run build`, output `apps/web/dist`, Node 22. Set `VITE_API_ORIGIN=https://<railway-domain>` in **preview** environment **before** build.
3. **CORS:** Colyseus 0.17 matchmaker uses its own CORS handling. Express room creation `POST /api/rooms` and `OPTIONS` accept only exact comma-separated `ALLOWED_ORIGINS` from Railway staging environment. Set to the verified Vercel preview URL; no raw invite credentials in logs.
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
