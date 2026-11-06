# 3Dviz Art Bible v2 — “Sương đầu mùa”

**Project:** Đà Lạt Hẹn Nhau • **Ngày:** 2026-11-06  
**Status:** PROPOSED / visual baseline not verified / no generated 3D scene in this document.

## 0. The first image is the product

**Visual promise:** một góc bờ hồ Xuân Hương bình yên, đủ thật để nhận ra Đà Lạt nhưng hơi mềm, painterly và ấm như ký ức. Người xem phải thấy rõ *hồ rộng — thông lớn — đồi xa qua sương — lối dạo — hai người bạn*. Không phải ground plane + cone trees + water strip.

Style: **semi-stylized painterly realism**, hand-tuned organic shape, restrained PBR, readable silhouettes, cool mist against warm angled sunlight. Not generic low-poly, fantasy medieval village, photo skybox or hyperreal RTX-only.

### Ảnh tham chiếu nghiên cứu, không phải asset/texture

- [Vietnam Tourism — Đà Lạt](https://vietnam.travel/vi/places-to-go/central-vietnam/da-lat): bối cảnh thành phố hồ/đồi/kiến trúc.
- [Vietnam Tourism — Walk by the lake](https://vietnam.travel/things-to-do/8-things-to-do-in-dalat/): lối dạo ven Hồ Xuân Hương.
- [Vietnam Tourism — Da Lat in four seasons](https://image.vietnam.travel/things-to-do/da-lat-enjoy-four-seasons-day): sương sớm, thông, nắng chiều.
- Tài liệu R01–R08 trong PR #2: tài liệu nguồn tham khảo; các bức ảnh riêng không được tự động cấp phép cho texture/game asset.

**Không** đưa ảnh chụp báo chí hay ảnh concept vào world làm plane/skybox rồi tự nhận đó là 3D; chỉ dùng để đối chiếu silhouette, atmosphere và bố cục.

## 1. Prototype recovery first — nghiêm cấm đoán là đã tái sử dụng

Đã xác nhận các nguồn hiện có:
- Repo `hungtvb/dat-lat-hen-nhau`: PR #1 multiplayer foundation (có mesh placeholder), PR #5 `feat/d2a-xuan-huong-shot01` có greybox Three.js, PR #4 staging; **đều không chứng minh** là original 3Dviz scene mà người dùng đã thích.
- File Library hiện có GDD/Architecture/PRD/Design Package và `Da_Lat_Hen_Nhau_Lobby_Preview.html`; latter là CSS/lobby, **không** là scene WebGL 3D.
- Các video/ảnh Đà Lạt khác của người dùng có thể thuộc project truyền thông riêng, **không** mặc nhiên là baseline scene.

**MISSING / BLOCKING:** chưa tìm thấy một tệp scene gốc có đường dẫn/commit xác minh được, ví dụ original `.html`, `.js`, `.glb`, `.blend`, authored assets hoặc xuất scene đã được anh duyệt. Không được tuyên bố đã khôi phục scene hay đạt parity.

**Quy trình tìm:** rà lại artifact trò chuyện thiết kế gốc, GitHub branches/references, Library/Drive, source local nếu có. Với mỗi ứng viên lưu: path, SHA/checksum, author, license, runtime, screenshot và người duyệt có xác nhận đây là bản đã thích hay không. Nếu chỉ có screenshot/video, đánh dấu **visual reference only**; chỉ được rebuild có chủ đích, không claim source reuse.

## 2. Visual composition contract — ba camera cố định

| Shot | Camera & focus | Foreground | Midground | Background | Điều phải đọc được |
|---|---|---|---|---|---|
| **S01 Meet by the lake** | Eye-level third-person from spawn, lens feel 45–55° | 2 avatars + stone/grass edge | a mature spreading pine framing one side, visible curved bank | broad water, misty hill/city line | “hai người cùng ở Đà Lạt”, không mất hồ |
| **S02 Under the pine** | eye-level 3/4 along trail | trunk/bark, distinct layered boughs and path | open space to walk + water glimpses | distant treeline | bough silhouette, empty gaps, terrain connection |
| **S03 Look across the lake** | camera toward lake from viewpoint, height ~1.5–2.2m | bank, 1–6 human-scale avatars to judge occlusion | calm water with small highlights | soft far shore and hills, faint built form | atmospheric depth, believable water scale |

Final FOV/camera positions must be locked in source manifest after real runtime preview. Do **not** use a storyboard camera impossible to reach from the actual gameplay camera without labeling it as editorial capture. Fix camera and exposure to compare before/after.

## 3. Hero objects — from form to material

### Hồ + bờ

- Lake should occupy an intentional broad part of S01/S03, not a thin horizontal ribbon. Long, flowing curve of edge; gentle bank elevation transitioning from grass → stones → water; no seams or z-fighting.
- Color target from existing art system: teal-grey `#78A3A4`, controlled roughness, subtle wave/ripple normals. Reflections show sky/surroundings lightly, but do not add SSR until performance evidence.
- Wet stone near edge can have slightly different roughness; no cartoon white thick ripple lines repeated in a grid.
- Water region is outside authorized walkable geometry at S01. Server movement x,z ±22m remains source of truth until corridor redesign.

### Thông già as hero

- Clearly **asymmetric mature pine** with visible textured bole, trunk lean, long outward branches, broad uneven layered crowns and **negative space** between branch clusters.
- 3Dviz `knowledge.blueprint-tree-conifer` is a narrow spruce-like recipe. Borrow **tapered bole, branch whorls/instancing** as construction techniques; do **not** clone spruce shape as the finished Đà Lạt hero.
- A single hand-crafted high-quality near tree before populating forest; background trees use silhouette variations + LOD/instancing. Need close-up proof at 3–8m and S01 framing.
- Needles approximate soft clustered masses with breakup and warm/cool shading, not plastic cubes or uniformly flattened cones. Branch scale proportional to avatars.

### Đồi, rặng thông, dấu vết đô thị xa

- Three depth layers with progressively lower saturation/contrast, varied ridgelines, restrained mist; no uniform repetition of same pine mesh.
- Distant architecture is a subtle lived-in Da Lat cue, not an asserted GIS/survey replica. Do not model Lam Vien landmark in S01 without viewpoint verification.
- Avoid generic wallpaper mountain panorama and heavy fog hiding geometry defects.

### Đường đi, terrain, avatar

- Human-scale path with stone/soil variation, slightly irregular organic edge. No broad tan flat slab dominating the screen.
- Avatar silhouette and feet always legible; 1 unit = 1 metre; walk motion with foot contact. No hair/cape complex rig yet unless source asset already exists.
- Ensure no visible floating branch roots, stones, tree trunks, bench foundations or avatars.

## 4. Color, light and material

| Role | Starting token | Job |
|---|---|---|
| Deep pine | `#24483F` | near silhouette / image framing |
| Hazy pine | `#6F8C79` | mid/far foliage atmospheric depth |
| Lake teal | `#78A3A4` | cool water / reflections |
| Sky mist | `#BFB5CA` | subtle lavender in distance |
| Morning honey | `#E9BC71` | directional warm key, accent only |
| Stone | `#A39D8A` | path and bank, not entire frame |

These are starting tokens; sRGB/PBR/tonemapping result must be judged from WebGL screenshots, not from hex codes alone.

**Morning-mist preset for S01:** angled directional key (sun) + soft sky/environment fill; contact shadow or appropriate ambient occlusion for hero tree/avatar; soft fog in distance only. Give lights clear owner; shadow volume sized to visible scene, not entire 300×220m concept. Prefer muted highlights; no overbloom or fake glow. Only one lighting preset in first art gate. Twilight/clear presets after S01 approved.

## 5. Camera, motion, sound

- Follow camera near enough (~3–5m starting design target) to connect with avatar but far enough to see landscape. Avoid current too-distant 9.6m by default unless screenshot QA proves better.
- Rotate to look across lake, no clipping into tree trunks, ground or water; when obstacle blocks line-of-sight, adjust camera distance or fade occluder locally with explicit policy.
- Motion: slight ripples, mild pine movement, far mist; expensive noise/post-processing not a substitute for authored shapes. Respect reduced motion.
- Soundscape future: low wind, distant birds, water/steps; all sound sources authored/licensed. No autoplay loud music.

## 6. Asset pipeline / 3Dviz → Game Studio → Three.js

`original source (if found) → audited authored scene → GLB/glTF export & manifest → normalize meters/Y-up/pivots → material + LOD + collision proxy → optimized asset (Meshopt/KTX2 only when justified) → GLTFLoader → Three.js scene composition → Colyseus avatar adapters`

- Keep source `.blend`/`.js` files as editable originals where available, not solely compressed `.glb`.
- A scene graph should have named spatial anchors: `spawn-meet`, `shore-view`, `pine-trail`; do not encode server movement physics into decorative meshes.
- Each asset gets provenance/license/unit/origin/bounds/triangle/texture/draw cost/LOD/collision purpose. No borrowed photo textures without rights.
- Avoid switching to a React/Phaser/game engine rewrite. Existing Vite+Three.js+Colyseus already supports this architecture.

## 7. Frame acceptance and rejection examples

- **Reject:** featureless blue lake strip, flat lawn fills most of frame, cone pines, fog hides view, floating avatar/stone, camera inside crown, repeating white ripples, giant HUD cards, frame rendered only in 3Dviz but absent in deployed game.
- **Candidate:** recognisable broad lakeside vista, a convincing spreading pine silhouette, walkable curved path, 3 depth layers, avatar group visible and grounded, calm light and water response.
- **PASS only after:** inspect *actual game* WebGL canvas shots S01/S02/S03 at 1440×900 + 1280×720, plus close-ups, movement camera sweep, Low/High paired frames, 2 browser clients, build/runtime checks, measured FPS on specified hardware, owner visual approval.
- Label sources separately: `source inspected` / `build success` / `canvas seen` / `2-client verified` / `real GPU perf measured` / `human art approved`.

**Status: art direction specified, scene recovery/render parity NOT YET VERIFIED.**
