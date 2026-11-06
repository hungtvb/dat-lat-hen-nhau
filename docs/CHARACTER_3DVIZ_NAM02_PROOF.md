# Nam 02 — 3Dviz Pro Max character proof

**Status:** code authored; independent GitHub CI, screenshot review and runtime QA must pass before calling it verified.  
**Visual direction:** stylized adult male / quiet Đà Lạt traveler, ochre field jacket, pine-green scarf, small backpack, dark short hair. No character likeness, no copyrighted texture.  
**Product boundary:** isolated proof at `/character-poc.html`; **not** integrated into game scenes, multiplayer or deployed staging.

## Actual plugin application / provenance ledger

**Skill:** installed `3dviz-pro-max-chatgpt`, upstream MIT-licensed source.  
**Record:** `knowledge.blueprint-biped-walker` rev. 4; walker factory, 2-bone IK/stance/swing and frame-driven walking. Original skill scripts `upstream/scripts/search.py` and `upstream/scripts/design-context.py` executed for the chosen domain.  
**Source copied directly (not a reimplementation):**

- `src/character-poc/upstream/creatures/biped-walker.js` — original walker factory **as distributed**.
- `src/character-poc/upstream/kit-walk.js` — original gait and IK helpers **as distributed**.
- `src/character-poc/upstream/kit-core.js` — original helper module **minus two optional re-exports** of unrelated surface/LOD modules; this is the only adapted upstream file.
- `src/character-poc/DaLatMale.js` — original authored local customization of the instantiated upstream walker: remove original fantasy cap meshes, sculpt everyday hair, collar, jacket details, scarf and backpack attached to its moving torso/head joints. It does **not** replace or claim to improve the original walk IK.
- `src/character-poc/demo.js` — actual Three.js WebGL renderer, controls, state and optional static GLB export through `GLTFExporter`.

Source MIT license: see original `LICENSE-UPSTREAM` in plugin package; Three.js MIT. Authored additions and scripts are project-owned.

## Acceptance checklist

1. `npm ci && npm run typecheck && npm run build` — compilation/regression.
2. `npx playwright test tests/e2e/character-3dviz.spec.ts` — **actual** client renderer opens and WebGL screenshots saved: `front.png`, `side.png`, `back.png`, `walk.png`.
3. `window.__characterProof.source` resolves to the exact blueprint; triangle count reported; `walk` changes procedural gait phase; front and back frame hashes differ.
4. User-facing GLB export button produces `da-lat-nam02-3dviz-biped.glb` (static mesh hierarchy snapshot; **no skinned skeleton or baked animation clips**), and Playwright verifies nonempty file.
5. **Human image review required:** silhouette, shoulder seam, branch-like dangling polygons, hairstyle, grounded shoes, clipping, jacket straps from at least 3 viewpoints.
6. **Not part of this proof:** standalone Blender rig, physics/collision, in-game avatar replacement, retargeted sit/emotes, GPU FPS on real hardware, 6-player validation.

## Compliance distinction

- **Loaded:** official skill workflow and records read.
- **Applied:** shipped walker source + IK and gait modules used unchanged; custom costume builds on source joint hierarchy.
- **Verified:** only after passing CI and inspecting captured real-canvas screenshots.
- **Approved:** only after human visual review; tests cannot self-approve art.

If the silhouette remains puppet-like, retain it as a working **procedural rig reference** and move to a proper authored skinned-mesh character and animation pipeline; do not rename a basic procedural figure as production-quality art.

## Local proof

From repo root: `npm ci && npm run dev:web`, open `http://127.0.0.1:5173/character-poc.html`, orbit with pointer, click **Đi bộ**, then **Xuất GLB**. Real multiplayer server is not required for this isolated view.
