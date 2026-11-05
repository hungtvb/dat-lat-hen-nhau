# Hồ Xuân Hương — Visual Reference Study (ART-01)

**Project:** Đà Lạt Hẹn Nhau · **Date:** 2026-11-05 · **Status:** RESEARCH / DESIGN PROPOSAL — **no 3D scene produced or visually validated**.

## 1. Objective & scope

Recreate **one recognisable lakeside experience at Hồ Xuân Hương** where 2–6 online friends can walk, sit, look out over the water and take photos together. This is **not** a GIS-accurate replica. Recognisable composition matters more than road-navigation fidelity, but actual architectural/landscape features must not be misrepresented.

**Approved visual direction:** *“Sương đầu mùa — Đà Lạt hiện hữu và ấm áp”*; semi-stylized painterly realism, realistic site identity, modest artistic compression. No quests, collectibles or sightseeing checkpoints.

**Location logic / limitation:** Hồ Xuân Hương and quảng trường Lâm Viên are adjacent, separated by a road. The lake has landscaped banks, mature pines, paved pedestrian stretches, urban buildings and varied shore treatments. **A pine-framed grassy bank, an unobstructed square silhouette and a café terrace are not established as one verified real-world viewpoint.** Combine them only if the shot is clearly an artistic composition; otherwise require location-specific photo/360° validation.

## 2. Reference board — photographs and evidence

Use the *linked source pages* as the reference board. They identify an observed feature and provide visual evidence; **they are not game textures and are not copied into the repository**.

| ID | Reference and original link | Evidence to extract | Provenance / rights | Status |
|---|---|---|---|---|
| **R01** | [Báo Lâm Đồng — bờ hồ, ghế dưới tán thông](https://baolamdong.vn/bo-sung-chinh-sua-ho-so-khoa-hoc-di-tich-danh-lam-thang-canh-ho-xuan-huong-420823.html) | Mature horizontal pine boughs; grass slope tapering toward water; bench proportion; quiet human-scale viewpoint | Editorial photograph; **view for research only**, rights to reuse not established | Verified published reference; precise camera location unconfirmed |
| **R02** | [VietnamOnline — mặt hồ sương sớm](https://www.vietnamonline.com/attraction/xuan-huong-lake.html) | Layered distant shoreline; soft haze; pine branch foreground; low-contrast reflections | Editorial/reference only; license not established | Visual atmosphere reference, not geometric survey |
| **R03** | [Wikimedia Commons — Phường Xuân Hương aerial view](https://commons.wikimedia.org/wiki/File:Ph%C6%B0%E1%BB%9Dng_Xu%C3%A2n_H%C6%B0%C6%A1ng_-_%C4%90%C3%A0_L%E1%BA%A1t.jpg) | Relative lake outline, banks, nearby urban greenery; large-scale composition | Photographer **Bún bòa**, 2025; **CC0 1.0** according to source | Useful for broad layout, not precise terrain data |
| **R04** | [Wikimedia Commons — Da Lat - Xuan Huong Lake](https://commons.wikimedia.org/wiki/File:Da_Lat_-_Xuan_Huong_Lake.jpg) | Lake surface proportions, far shore tree/building density | **P. Hughes**, source describes 2015; **CC BY 4.0**; attribution required if copied/distributed | Comparison image; viewpoint must be calibrated |
| **R05** | [Wikimedia Commons — Lâm Viên Đà Lạt](https://commons.wikimedia.org/wiki/File:L%C3%A2m_Vi%C3%AAn_%C4%90%C3%A0_L%E1%BA%A1t.JPG) | Actual plaza identity, glass landmark form and surrounding context | Photographer **EA / The Earth Nguyen**, 2018; **CC BY-SA 4.0** | Architectural silhouette reference |
| **R06** | [Wikimedia Commons — Xuân Hương panorama](https://commons.wikimedia.org/wiki/File:Xuan_Huong_Lake_(panorama).jpg) | Overall horizon rhythm and city/hill layering | Original photographer **Trần Huy Phương**; derivative panorama **CC BY-SA 3.0** on source page; verify derivative obligations before reuse | Secondary panorama; not measurement-grade |
| **R07** | [Cổng du lịch Đà Lạt — hồ Xuân Hương](https://dalat.vn/vi/hoxuanhuong) | Confirm site names: Dalat Palace, Thanh Thủy, Thủy Tạ, popular walks/rides and central-lake identity | Official visitor information; imagery terms not verified | **Factual cross-check**, not a licensed asset |
| **R08** | [Wikimedia Commons — Hồ Xuân Hương, Đà Lạt](https://commons.wikimedia.org/wiki/File:H%E1%BB%93_Xu%C3%A2n_H%C6%B0%C6%A1ng%2C_%C4%90%C3%A0_L%E1%BA%A1t.jpg) | Historic low viewpoint of shore edge and pedestrian-bank relationship | Original uploader **Dongson.vmvn**; **CC BY-SA 3.0** | Age-sensitive reference; check against more recent pictures |

**Rights policy:** The table documents source licenses for the *photographs*, not a blanket license for architecture, brands or any future textures. CC BY / BY-SA reuse requires following the applicable license, including attribution and derivative terms. Prefer original modelling/materials; do not import editorial or stock photographs into the game. Before embedding any photo or derived texture, create an asset-level license record.

## 3. Photographic observations vs creative choices

| Element | Observed in references | Must preserve in 3D | Allowed creative compression | Avoid |
|---|---|---|---|---|
| **Pine trees** | Mature pines with irregular spreading branches over lakefront; not identical narrow party-hat cones (R01, R02) | Main pine hero silhouette, exposed trunk, asymmetrical crown, branching negative space | Procedural branch clusters; fewer background variants | Repeating three `ConeGeometry` crowns for all hero trees |
| **Shoreline** | Water bordered by graded lawn, hard pedestrian edges and changes in bank profile (R01, R03, R08) | Curved bank with transitions; recognizable broad lake | Shorten total shoreline; consolidate safe walkable space | Flat `CircleGeometry` lake, abrupt grass/water clipping |
| **Water** | Fine ripple/reflection and muted morning tones (R02, R04) | Perspective scale, calm small waves, grounded highlights | Simple screen-space/environment reflection appropriate to budget | Glassy chrome water or busy ocean surf |
| **Distance** | Trees, low/mid-rise town buildings and gentle hills (R02–R04, R06) | Layered near/mid/far separation and visual horizon | Simplify building groups; atmospheric perspective | Unrealistic wilderness with no visible urban identity |
| **Lâm Viên** | Large, open paved plaza; glass botanical forms; road at lakeside (R05, R07) | Distinctive **dã quỳ/artichoke-inspired** silhouette when visible from plausible camera | Low-detail distant landmark, stylistically unified | Inserting the full plaza/landmark directly onto the grass or middle of lake |
| **Café** | Real venues exist around lake (R07); not every shore view includes a café | Distinguish **fictional** `Cà phê Góc Sương` from real landmarks | Move to a fictional small terrace off the main photo viewpoint | Claim it is a real, accurately located café |
| **Atmosphere** | Light mist and soft distance contrast in some photos (R02) | Social avatars discernible at close range; silhouettes unobscured | Local fog and authored lighting presets | Using dense fog to hide unfinished geometry |

**Correction to previous art spec:** The original scene study treated “pine trail → café → Lâm Viên visible across lake” as one continuous postcard. That is a **creative possibility**, not verified local geography. Require multi-angle validation before labelling any shot a faithful reconstruction.

## Priority decision for D2 implementation (2026-11-05)

- **D2-A / SHOT-01 first:** construct only a 30–40 m shoreline meeting scene within current server x,z ±22 m bounds. One mature asymmetric pine, curved bank, walkable path, calm water and 2–6 real connected avatars. No café, interactive bench or invented plaza panorama.
- **D2-B / SHOT-02 after image review:** extend path toward 60–100 m, **together with** server-authoritative movement bounds and E2E; a pretty but unwalkable path is not acceptable.
- **SHOT-03 conditional:** keep unverified Lâm Viên camera location blocked until source-aligned views are available. Position relative to lake is known broadly; specific line-of-sight from game camera is not.
- Proposed authoring and QA detail: [D2_SCENIC_SLICE_IMPLEMENTATION_DETAIL.md](D2_SCENIC_SLICE_IMPLEMENTATION_DETAIL.md). No new 3D/rendered evidence yet.

## 4. Three composition plates / approval shots

These are **authoring requirements**, not images we have rendered. Use IDs in `world/reference-shots.json`.

### SHOT-01 · Điểm hẹn dưới tán thông — primary hero shot
- **Intent:** friends arrive, stand together, naturally look toward the water.
- **Reference:** R01 (near bank), R02 (mood), R04 (distant context).
- **Layering:** foreground asymmetrical pine branches + small grass/stone edge → 2–6 avatars on unobstructed path → calm water → tree-lined built opposite shore → light mist.
- **Scene constraint:** preserve walking lane; group photo frame must fit six avatars and shore identity without floating feet or blocked heads.
- **Acceptance:** at a single representative 16:9 camera angle, the silhouette reads as a *real pine-framed Đà Lạt lake*, not a generic fantasy pond.

### SHOT-02 · Con đường ven hồ — exploration shot
- **Intent:** walking together and pausing at a bench.
- **Reference:** R01, R03, R08.
- **Layering:** continuous walkable curved path; bank edge/profile; two distinct mature pines; rest zone under branches; water on one side and urban/park context on the other.
- **Scene constraint:** avoid collisions and camera blocking from trunks; photo camera should not be pushed into branches.
- **Acceptance:** route visually connects all its stops; surfaces intersect intentionally; character scale consistent with benches, paving and tree trunks.

### SHOT-03 · Nhìn về quảng trường — distant landmark shot
- **Intent:** an identifiable city landmark in the view, without leaving the lakeside scene.
- **Reference:** R05 (building/urban shape), R03 (layout), R04 (lake width).
- **Layering:** water foreground → shore/road where verified → urban platform/plaza → distinctive distant curved-glass forms.
- **Scene constraint:** actual camera/shore alignment **still unverified**. If the planned camera cannot plausibly see the square, adjust location or present the view explicitly as a stylized composite.
- **Acceptance:** source-check silhouette against front/oblique reference; no invented landmarks; visible at player-level not only aerial view.

**Optional mood variant:** R02 dawn/mist; capture all three shots from *identical camera positions* in clear-afternoon and purple-dusk to evaluate readability and lighting continuity.

## 5. 3D production handoff (3Dviz-backed, not kit-as-finished-art)

**Read source records consulted:** `knowledge.blueprint-tree-conifer`, `knowledge.terrain-landmark-rhythm`, `knowledge.navigable-density-rest-areas`, `references/lighting-direction-and-scale.md` from 3Dviz Pro Max v0.3.0.

1. **Greybox / geometry fidelity:** draw lake shore, natural slope, traffic-side/footpath separation, rest zone and sightlines **before** scattering props. Treat current `World.ts` flat plane/circle/cone geometry as network placeholders only.
2. **Hero pine:** original kit can inform procedural trunk/branch sockets and instancing, but its narrow spruce-like silhouette is *not* a faithful mature Đà Lạt pine. Build custom spreading, asymmetric branches from R01, or author an appropriate asset; use simplified instanced background pines after silhouette review.
3. **Water & edges:** shape irregular shoreline mesh, shoreline normals/roughness and ripples that match the actual lake's spatial scale. Do not use photographs as textures by default.
4. **Sensible architecture:** treat plaza as distant, multi-part form (rather than one colored dome) and café as fictional; use contextual geometry only where source photos support it.
5. **Lighting:** morning mist, afternoon and dusk are distinct configurations. Keep source directions/receivers consistent in a fixed A/B/C camera comparison. Maintain visible faces, avatars and paved route in mist.
6. **Visual proof:** first deliver 3 in-engine screenshots labelled SHOT-01/02/03 and a short comparison against the linked references; then review actual model silhouette, shadows and camera occlusion. Only after that build out the rest of the zone.

**Process update (2026-11-05):** PR #1 đã qua `npm ci`, typecheck, build và 8/8 Colyseus/Playwright E2E ([run 42024094826](https://github.com/hungtvb/dat-lat-hen-nhau/actions/runs/42024094826)), nhưng hai thiết bị vật lý/WAN và visual GPU chưa được kiểm chứng. Tài liệu art chỉ là kế hoạch; cần duyệt [D2 Implementation Detail](D2_SCENIC_SLICE_IMPLEMENTATION_DETAIL.md) trước khi thay đổi lớn tới Three.js.

## 6. Acceptance checks & gaps

- [x] Establish a site-specific photographic reference set with direct source links and provenance.
- [x] Separate observed landscape facts from artistic composition and its unverified geography.
- [x] Specify three evaluable scene/camera targets and model priorities.
- [ ] Determine **real-world camera positions / sightlines** with additional geo-tagged or multi-angle evidence; don't invent them.
- [ ] Confirm whether Lâm Viên silhouette is legible from chosen lakeside position.
- [ ] Produce first custom mature-pine model / shoreline greybox.
- [ ] Compare *real WebGL screenshots* against source photographs and record defects.
- [ ] Complete multiplayer CI/runtime gates before accepting scene implementation as integrated.

**Deliverable status:** research complete for reference **selection**, not geographic surveying, game art or rendering QA.
