# Implementation Plan v2 — Visual Baseline Recovery → Real Game Scene

**Date:** 2026-11-06  
**Status:** PROPOSED FOR REVIEW; implementation NOT AUTHORIZED by this document alone.  
**Base:** `feat/multiplayer-foundation` (PR #1), not `main` directly.  
**Owner collaboration:** Game Studio (design/runtime/playtest), 3Dviz Pro Max (art/model/visual QA).

## 1. Why this plan replaces the previous art approach

The current path PR #5 (procedural ribbon lake, flat ground, primitive rocks, no validated hero pine) and unmerged experimental `feat/d2a2-pine-and-framing` risk becoming a different art product than the original 3Dviz visualization liked by the user. Keep them as technical evidence/experiments, **not** an accepted source for production art.

**The original scene's exact reusable source is NOT LOCATED.** Existing design notes, lobby CSS, screen capture and GitHub diff cannot prove it exists. First task is recover and identify it; no claim of reuse before verification.

## 2. Baseline audit & decision

### R0 — Source recovery (no game code)

1. Search original ChatGPT artifact/session, GitHub refs, local source/Drive/Library for the liked 3Dviz scene; gather candidate HTML, JS/TS, Blender, GLB/GLTF, textures, shaders, original screenshot/video.
2. For every candidate: record URI/path, author, copyright/license, file checksum, renderer, axes, units, assets, camera, lighting. Open and run it as provided; capture before frame if runnable.
3. Ask art owner to identify **the same version they liked**. If no source recoverable, mark `REFERENCE_ONLY`; any new scene will be a **redesign inspired by**, not “imported from original”.
4. Create a side-by-side evidence sheet: verified baseline or user-approved reference vs current PR5 canvas vs new candidate.

**Gate R0:** baseline status `SOURCE_VERIFIED`, `REFERENCE_ONLY` or `MISSING`, with URLs/files and who verified; choose path `IMPORT` or `REAUTHOR` explicitly. Do not guess.

### R1 — One beautiful frozen frame, without multiplayer changes

- Only after R0: create one scene component for S01 lake meeting within current 44×44m walkable rectangle; decorate beyond with non-walkable distant art.
- Adapt/reuse original geometry/materials/lighting if source and license permit; do not import another gameplay engine.
- Provide asset manifest with stable IDs, scene anchors, units/pivots, dependencies and source attribution.
- Present 1440×900 / 1280×720 actual Three.js canvas captures, HUD hidden/visible, renderer identity and commit SHA.
- Compare silhouette/shore/lighting/material against approved reference; fix until human reviewer says the world is attractive enough to stay in.

**Gate R1:** world has clear near/middle/far depth, pine hero, broad lake and distinctive morning light; screenshot and review evidence **from running game**. Not just build green.

### R2 — Recover playable visual quality

- Apply R1 scene through a `SceneLoader` or a small scene module. Preserve private room state, inputs and lifecycle.
- Camera follow, occlusion and grounding measured in screenshot/gameplay; no decorative collider accidentally controlling network position.
- Avatar readability at 2–6 players; ensure the vista is still visible from actual player position.
- Scene asset load failures and WebGL context loss show meaningful UI and cleanup, not silent generic fallback.
- Observe three fixed shots S01/S02/S03 + a walking camera sweep from two Chromium contexts.

**Gate R2:** existing network, leave/rejoin, reconnect, invite/auth and no-WebGL E2E remain green, plus in-world multi-client screenshots.

### R3 — Performance + playable staging art signoff

- Measure named GPU devices at 1280×720, 1440×900; 6 avatar target, ≥2 min sample; record min/median and low-percentile FPS and memory; 30 FPS on Low is a **target only**, not current PASS.
- Check asset cold/cached load, draw calls, shader/frame cost, texture sizes, low/high lighting parity, LOD and occlusion.
- Publish a separate preview at a pinned commit, do not overwrite the stable PR4 preview without release review.
- Conduct a real 3–6-person, independent-network 15–20min playtest; note whether players spontaneously stop at the viewpoint.

**Gate R3:** human art signoff + technical signoff + real device/playtest acceptance; only then proceed to social features.

### R4 — Togetherness follow-on (separate code reviews)

Order: one seat occupancy mechanism + authoritative server state → emotes → compact text chat (escaped/rate-limited) → local PNG photo → shared time-of-day presets. Do **not** implement to hide the absence of a convincing scene.

### R5 — 60–100m path extension (separate architecture PR)

The current server bounds are `x,z ∈ [-22,22]`. A wider walkable route needs approved server-authoritative corridor/collision design, tests for speed/teleport/security and new spawn/seat relationships. Rendering a 100m path in client **does not** authorize walking it.

## 3. Proposed PR breakdown

| PR | Changes | Tests / evidence | Gate |
|---|---|---|---|
| Design-only (this PR) | v2 vision, Art Bible, migration plan | docs reviewed, source-status accurate | User reviews direction |
| D2-R0 | original prototype/asset provenance record, baseline screenshot tools | audit, verified source/ref, deterministic camera | R0 |
| D2-R1 | scene/assets/lighting one SHOT-01 | actual browser screenshots, visual review | R1 |
| D2-R2 | camera/loaders/grounding + scene integration | 2-browser E2E, reconnect, JS errors, scene screenshot | R2 |
| D2-R3 | GPU perf, LOD/texture optimizations, staging proof | real-GPU profile, WAN playtest, visual signoff | R3 |
| D3+ | interactions/photo separately | E2E state tests + user acceptance | After art |

Each implementation PR updates `docs/IMPLEMENTATION_STATUS.md`, `docs/TEST_PLAN.md`, acceptance evidence and current branch references. No direct commits to `main`.

## 4. Proposed file boundaries (not code written yet)

- `apps/web/src/game/World.ts`: thin orchestration renderer/camera/state only, preserve cleanup.
- `apps/web/src/game/scenery/`: scene loader, authored environment geometry/models, light/material rig; no Colyseus state.
- `apps/web/src/game/assets/` or `assets/world/`: GLB/texture manifest, provenance and performance notes.
- `apps/web/src/game/camera/`: follow, collision, camera reset & fixed-shot QA.
- `apps/web/src/network/`: unchanged unless explicit protocol/authority design review.
- `apps/server/`, `packages/shared/`: unchanged for R0–R3 except separately reviewed authority tests/corridor extension.
- `tests/e2e/`: captures real canvas, two-browser actor presence and movement, leave/rejoin, WebGL unavailable and GPU metadata.
- `docs/`: design, source ledger, actual render comparisons and measured perf log.

**Do not reimplement the game with Phaser, R3F, Godot, a fresh Babylon world or a bespoke WebGL renderer.**

## 5. Minimum regression checklist

- Private invite/create/join; unauthorized direct join blocked, 6th accepted and 7th rejected.
- Server-authoritative movement/clamping, reconnect identity, terminal leave/rejoin without duplicate canvas, host handoff.
- HUD does not intercept movement incorrectly; modal input blocks movement/camera when appropriate; Vietnamese name rendering.
- Hero pine, lake and horizon readable at 1440×900 and 1280×720 with HUD hidden and normal HUD; first load/asset failure handled.
- No floating avatars/stone, mesh gaps, camera clipping or depth readability loss on walk.
- CI screenshot ≠ human art approval, virtual GPU ≠ physical GPU performance, E2E same runner ≠ WAN across physical devices.

## 6. Acceptance ledger

| Item | At creation | Proof required to change |
|---|---|---|
| Original 3Dviz scene source | **MISSING / unverified** | exact asset/source reference and owner match |
| PR1 network foundation | CI verified in prior PR | unchanged E2E regression after integration |
| PR4 staging | scoped remote CI verified | independently verified released candidate |
| PR5 procedural scenic | CI pass, **not art approved** | human screenshot review |
| New v2 scenic scene | **DESIGN ONLY** | R1–R3 artifacts, reviews and playtests |
| 60–100m corridor | **DEFERRED** | server authoritative plan + tests |
| Social features | **DEFERRED** | R3 signoff |

**Blocking decision:** do not merge/deploy the unapproved `feat/d2a2-pine-and-framing` branch as scenic quality work. Keep older PRs untouched pending explicit supersession/disposition decision.

## 7. Evidence statement

This plan is a design artifact. It contains **no new game model, no screenshot of a rebuilt scene, no runtime FPS result, no production deployment, no verified original source**. Release/test assertions require fresh evidence.
