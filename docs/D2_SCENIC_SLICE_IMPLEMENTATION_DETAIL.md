# D2 Scenic Slice — Implementation Detail

**Đà Lạt Hẹn Nhau · 2026-11-05 · T04 / D2**  
**Status: PROPOSED FOR REVIEW — NOT IMPLEMENTED.** This plan does not authorize a large 3D code change until reviewed.

## Outcome and scope

D2 should make two to six connected friends feel they are together at a recognisable Hồ Xuân Hương lakeside. Style: **“Sương đầu mùa — Đà Lạt hiện hữu và ấm áp”**, semi-stylized painterly realism. A readable avatar, broad-branched mature pine, authentic shore transitions and a believable layered lake are more important than many landmarks or visual effects.

**D2-A / SHOT-01, first deliverable:** one **30–40 m** lakefront meet-up area around existing spawn, one asymmetric *hero pine*, a walkable bank/path, a curved lake edge, muted water and distant treeline/buildings, morning light, actual Colyseus avatars. Show one real in-engine 16:9 frame and a 2-client walkthrough. Decorative bench only if needed for composition; **no seating interaction** yet.

**D2-B / SHOT-02 after visual approval:** expand the same walking route to 60–100 m, add one visually coherent bench and a second distinct pine composition. Do **not** build the café interior, entire 300×220m world, voice/chat/emotes or other gameplay.

**D2-C / SHOT-03 conditional:** the camera location that would show Lâm Viên from the intended shore has **not been verified**. Neither the glass landmark nor fictional café is part of D2-A. Verify a view from ground-level photos / geo-tagged viewpoints first; otherwise label the composition an artistic interpretation, never a surveyed replica.

## Existing architecture and critical spatial mismatch

- Client renderer/game: \`apps/web/src/game/World.ts\` (Three.js) currently owns avatar meshes, input, camera, render loop and primitive cone/plane/circle world. Preserve the working multiplayer architecture and lifecycle while improving visuals.
- Server authoritative movement: \`packages/shared/src/index.ts\` uses \`SPIKE_BOUNDS\` with x,z limits ±22 m; movement is enforced by \`advancePlayer\` in server \`LakesideRoom.ts\`. The current square is **44×44m**.
- Long-term \`world/scene-spec.json\` describes a 300×220 m artistic world; it is design-only, not the implemented collision/walkable map.
- **D2-A must fit server bounds.** D2-B requires a separately reviewed **server-authoritative walkable corridor/bounds change** and cross-client tests, otherwise clients can see a 100m path they cannot traverse.
- Reuse the existing Colyseus room, avatar state and network regression suite; keep scene-local camera/graphics state on client. No database or new multiplayer framework.

## Source and geometry decisions

- [R01] Báo Lâm Đồng: real shore-side bench beneath *spreading mature pine boughs*; [R02] lake mist and spatial depth; [R04] water and far shore. Source pages are research references, **not textures/assets**.
- Draw shoreline and slope **before** props. Avoid current flat \`CircleGeometry\` lake edge and water/ground seams. Keep human-scale walkway and camera clearance.
- Make one hero pine with exposed trunk, broad asymmetric tiers, side-reaching boughs and visible gaps. The 3Dviz record \`knowledge.blueprint-tree-conifer\` models a *narrow spruce-like* tree, so reuse construction ideas only, not its silhouette unchanged.
- Water: restrained small wave/ripple cues, credible roughness and highlights. Avoid heavy planar reflections until measured on hardware. Far shore: softened tree-and-city layers, not pristine wilderness or fantasy village.
- Morning mist only for the first fixed camera QA. Do not hide character faces/head silhouettes. Future light variants use **identical camera transform** for fair comparison.
- If importing GLB/materials, record author, license, units (metres), axes, draw costs and shader/texture sources. No unlicensed photograph-to-texture copying.

## Proposed code change boundaries (after approval)

| Scope | Minimal change | Explicitly avoid |
|---|---|---|
| \`apps/web/src/game/World.ts\` | Retain renderer, existing input/network listeners, camera, avatar lifecycle; integrate new authored scenery | Rewriting Colyseus or broad gameplay refactor |
| \`apps/web/src/game/scenery/\` (only if needed) | Small factories for shoreline/water/hero pine, deterministic placement | Building a procedural city/world engine |
| \`tests/e2e/\` | Scene startup, WebGL error fallback, JS errors, deterministic screenshot with named camera, 2-client walking | Replacing E2E with mocked screenshots |
| \`packages/shared/src/index.ts\` and server (D2-B only) | Documented corridor movement authority and regression tests for 60–100m route | Client-only widening, teleport over water |
| \`docs/TEST_PLAN.md\`, \`docs/IMPLEMENTATION_STATUS.md\` | Evidence, GL renderer identity, images, FPS measurements and known defects | Calling build success “visual QA PASS” |

One change set per reviewable slice; do not begin the distant plaza/café or social features until SHOT-01 image reviewed.

## Milestones and acceptance evidence

| Milestone | Deliverable / test | Status |
|---|---|---|
| **T04-A1** | Path+bank+lake greybox in 30–40m area; real WebGL screenshot with camera FOV, pose, viewport and renderer identity | NOT RUN |
| **T04-A2** | Hero pine and close-up; silhouette compared to R01; branches/trunk recognisable and no repeated cone crowns | NOT RUN |
| **T04-A3** | Water material, mist/lighting, far shore layers, image compared with R02/R04 and shot framing for six avatars | NOT RUN |
| **T04-A4** | Walkthrough with 2 actual browser clients; **all eight network E2E remain green**, camera avoids clipping, avatar feet align to ground | NOT RUN for D2 |
| **T04-B** | 60–100m walkable route and server-authoritative bounds/collision contract + regression tests | DEFERRED |
| **SHOT-03** | Grounded Lâm Viên viewpoint evidence + reviewed camera before modelling | BLOCKED ON VIEWPOINT |

Visual QA: capture SHOT-01 overview at 1440×900 and 1280×720; pine/water/feet close-ups; camera sweep along path; label which render frames are generated by headless software WebGL versus a **real measured GPU**. If possible run 2-minute FPS capture on a named mid-range desktop/laptop, target 30 FPS minimum with six visible avatars, report min/median/p95 and renderer/resolution. This FPS value is a **target**, not a current measurement.

Accessibility/resource gate: genuine fallback when WebGL fails; control focus does not move player while typing; listeners/RAF/materials released on room exit; no uncaught errors. Photo mode and seating mechanics belong to later phases.

## Review and release boundaries

**D2 approval requires:** (1) representative *actual application* screenshot and silhouette critique, (2) two-client scene walkthrough, (3) source/license ledger, (4) no regression to Colyseus, (5) documented hardware/method for FPS test. A static concept mockup, an npm build, or software-rendered CI snapshot **alone** cannot demonstrate real-GPU quality.

**PR #1:** 8/8 Colyseus E2E passed in GitHub Actions and remains Draft. Two-device/WAN playtest, abuse hardening and real-GPU performance remain separate gates; do not claim deployment readiness.

**Proposed decision:** approve *planning* D2-A SHOT-01 only, then review this detailed plan before substantial Three.js implementation. PR #2 remains documentation-only, stacked onto PR #1, never merged directly into main ahead of the network foundation.
