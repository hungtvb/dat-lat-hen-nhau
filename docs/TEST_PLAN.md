# QA / Acceptance Test Plan — Đà Lạt Hẹn Nhau

**Status:** Eight genuine Colyseus/Playwright E2E scenarios passed on GitHub Actions ([run 42023515834](https://github.com/hungtvb/dat-lat-hen-nhau/actions/runs/42023515834), 8/8). These scenarios run on one CI runner, not multiple physical devices. Uncovered acceptance cases remain NOT RUN, and the prior offline prototype does not count as multiplayer evidence.

## 1. Test matrix — highest priority

| ID | Test real-world scenario | Expected | Mode |
|---|---|---|---|
| M01 | User A creates invite-only room, B joins from different browser/device | Two distinct characters visible; accurate nickname; world same state | E2E 2-client |
| M02 | User C joins 3 minutes late while A/B are seated | C gets real state: occupied seats, positions, ambience, avatars | E2E 3-client |
| M03 | Disconnect B for 10–20s, then reconnect within 45s | One avatar identity retained; no duplicate; seat still valid | E2E + network |
| M04 | B disconnects >reservation timeout | Old avatar removed and seat freed, C can sit | E2E timeout |
| M05 | 7th user tries join capped room | Clear “Phòng đã đủ người” with action back/retry | E2E room limit |
| M06 | Invalid/expired invite token or direct room ID without token | Reject before seat, no leaked room details | API + E2E security |
| M07 | Host leaves voluntarily while B/C remain | New host chosen, room persists, light preset unchanged | E2E 3-client |
| M08 | A tries remote teleport payload/speed hack | Server rejects/clamps; world coordinates remain walkable | Integration security |
| S01 | A sits bench seat #1, B tries same seat | B sees occupied message; no overlapping avatars | E2E 2-client |
| S02 | B waves, hearts, laughs while A watches | animation/emote observed in A within network budget; no infinite loop | E2E 2-client |
| S03 | Rapid emote spam or chat flood | cooldown/rate limits enforced; room stays responsive | Integration security |
| S04 | Text chat with HTML/script/url and Unicode Vietnamese | text rendered safe, readable; not executed; no motion while input focused | Integration + E2E |
| S05 | Host sets twilight while A/B near different spots | same world ambience preset arrives on all clients | E2E 2-client |
| S06 | A opens photo mode while B moves/emotes | A can save PNG representing A's frame; B is not frozen | E2E image |
| S07 | Player with duplicate display name joins | players remain separately identifiable; no state overwrite | E2E 2-client |
| S08 | User clicks Help/Photo/Settings during walking | no stuck input, escape route works; focus returns correctly | E2E UX |

## Verified network subset (2026-11-05)

| Scenario | Evidence | Boundary |
|---|---|---|
| M01 partial | A/B join a real private room; two browser contexts observe same roster and server-controlled movement | Not two physical devices/WAN |
| M03 partial | Socket close with 4010 after SDK minUptime, automatic reconnect preserves exact session ID | Not physical 10–20s outage; no seats |
| M04 partial | Dropped Node SDK client remains disconnected and is removed after actual 45s reconnect timeout | No bench seat reservation implemented |
| M05 | Six SDK clients join; seventh rejected; departed client's seat becomes joinable | Single CI host, no load test |
| M06 partial | Invalid invite and direct no-token `joinById` rejected; failed initial access does not destroy room | Token expiration policy not implemented |
| M07 partial | Host A leaves while B is disconnected and C online; host becomes C, not B | No ambience-changing host UI yet |
| Spawn regression | A/B/C join; B leaves; D enters with different spawn position from active A/C | No collision/navmesh test |

**Full visual QA V01–V08: NOT RUN.** Passing headless Chromium does not establish real-GPU visuals or 3–6-person WAN experience. M02, M08, most M03/04/07 criteria, S01–S08 and public abuse/performance gates remain NOT RUN / not implemented.

## 2. Visual test matrix, actual render evidence required

| ID | Requirement | Evidence |
|---|---|---|
| V01 | Hồ Xuân Hương visually reads as lake, not flat blue plane | morning screenshot, foreground and surface close-up |
| V02 | Thông có silhouette + layered crowns, not uniform cones | neutral light oblique shot + mid-distance panorama |
| V03 | Cafe terrace has coherent structure, lit seats and readable entrance | oblique 3D close-up, twilight shot |
| V04 | Avatar grounded in idle/walk/sit; no floating feet, detached joints | video/frames at rest, walk, seat, emote extremes |
| V05 | Camera doesn't clip through trees, buildings, terrain or water | camera sweep at three rest spots |
| V06 | Mist/lighting transitions don't blind silhouettes or clip exposure | same-camera morning/afternoon/twilight screenshots |
| V07 | Low graphics preset preserves landmark identity and social avatar visibility | paired low/high screenshots, FPS measurements |
| V08 | Photo export visually matches scene and contains intended players | PNG inspected with dimensions & nonblank pixel check |

## 3. Performance targets — not claims

- Target test platforms: current Chrome/Edge desktop WebGL2, 1366×768 and 1920×1080; at least one mid-range laptop and one lower-end test device.
- Proposed **minimum 30 FPS** while walking with six avatars on tested target mid-range machine; **60 FPS desirable**. Capture test hardware/GPU, viewport, scale, number of avatars, lowest/median/p95 FPS and memory over >=2 minutes.
- Under simulated **100ms RTT + 25ms jitter** test avatar stays readable without visually frequent teleport; record true p95 packet/state delay, not fabricated pass threshold.
- Record source/client bundle size and initial load time on throttled connection; optimize until link-to-presence target in GDD can be judged with first-load versus cached-load separated.
- Crash, unhandled rejection, WebGL context lost, reconnect loops, leaked listeners/RAF and excessive message send rate are blockers.

## 4. Accessibility and comfort

- `Tab` reaches UI, focus visible; text labels associated with invite/nickname; `Esc` dismisses dialogs safely.
- When chat focused, movement stops immediately; IME Vietnamese supported.
- Low-quality, reduce-fog, reduce-motion and mute toggles survive UI mode changes during one session.
- Contrast on in-game HUD measured against stable overlay, text readable over both morning/dusk.
- No primary action hover-only; each icon has label/tooltip/aria; screenshot preview and save has non-ambiguous feedback.
- No intense flashing light, forced camera spin or automatic loud audio.

## 5. Evidence classification

| Status | Meaning |
|---|---|
| PROPOSED | Chỉ có requirement/plan |
| CODED | Có code nhưng chưa chạy |
| AUTOMATED TEST PASS | Có command, environment, log pass |
| E2E OBSERVED | Real client/server interactions verified in independent browser contexts; report device/network constraints separately |
| GPU VISUALLY INSPECTED | Screenshot/video thực từ renderer WebGL trên thiết bị được xác định |
| PLAYER VALIDATED | Nhóm người chơi đã xác nhận cảm giác đi cùng nhau |

**Không được nâng CODED hoặc screenshot CPU renderer của demo offline thành multiplayer E2E hoặc GPU visual PASS.**

## 6. Playtest protocol

Chạy với 3–6 người, 15–20 phút. Gửi một link mời và không giao nhiệm vụ. Quan sát: họ có nhìn thấy nhau không; tự tìm được chỗ ngồi không; có dừng ngắm cảnh không; ảnh chung có dễ chụp không; có thấy muốn quay lại không. Cuối buổi hỏi 3 câu mở: “Cảnh nào em thích nhất?”, “Lúc nào thấy thực sự đi cùng nhóm?”, “Điều gì làm em mất cảm giác Đà Lạt?”. Không dùng XP/quest để ép họ đi qua khu vực.

## Desktop stability regression (scoped CI verified; WebGL failure scenario added)

- **Voluntary leave:** return to lobby, remove renderer canvas, clear invite URL fragment, allow a brand-new private room in the same tab.
- **Terminal WebSocket leave:** same cleanup and visible error; no stuck world or old session callback mutation. Do **not** treat SDK's temporary onDrop as terminal (existing reconnect test must remain green).
- **WebGL startup failure after room join:** leave backend session and return lobby with actionable fallback, rather than continuing to send input with no renderer.
- **Memory:** dispose per-avatar owned materials when avatars leave; avoid leaking materials across repeated sessions.
- **Evidence:** [GitHub Actions 42068283706](https://github.com/hungtvb/dat-lat-hen-nhau/actions/runs/42068283706) passes locked install, contract tests, typecheck, build and **12/12 real Colyseus/Chromium E2E** (51.5s), including two new browser lifecycle scenarios and existing temporary-reconnection regression. This uses isolated contexts on one runner; no independent WAN device testing. Device-specific GPU and WAN tests remain outstanding.

- **WebGL unavailable test added:** deliberately reject canvas WebGL context in an isolated Chromium context **after** actual room creation/join. Require clear error, release of client renderer, return to lobby and clean invite URL. Status is **NOT YET VERIFIED** until the PR's updated CI completes.

- **Live deployment regression:** [run 42070614219](https://github.com/hungtvb/dat-lat-hen-nhau/actions/runs/42070614219), 5/5 PASS (13.2 seconds), verifies real public backend health/CORS, two browsers join+move, session exit/rejoin and terminal close→lobby on PR4 preview. This runs on one CI runner, not two physical WAN clients. [Local run 42069923384](https://github.com/hungtvb/dat-lat-hen-nhau/actions/runs/42069923384) 13/13 PASS including WebGL initialization rejection.

## D2-A1 first scenic frame — proposed QA

- New `tests/e2e/scenic-shot01.spec.ts` starts a real Colyseus guest in Chromium, verifies the real Three.js canvas, and attaches 1440×900 and 1280×720 **canvas screenshots** with WebGL renderer metadata. The screenshot file must be opened and reviewed by a person; its existence is not visual-quality PASS.
- Existing multiplayer, reconnect and CORS E2E must remain green. No server movement bounds were changed; shoreline water geometry is outside x=-22m walkable boundary.
- Visual review checklist: bank has no seam / floating grass, water does not resemble a small circle, path is continuous, 2–6 avatar positions remain visible. The hero pine, real GPU FPS, collision/camera sweep, and two physical machines are still NOT VERIFIED.
