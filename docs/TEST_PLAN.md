# QA / Acceptance Test Plan — Đà Lạt Hẹn Nhau

**Status:** Mixed test plan and actual CI evidence as of 2026-11-05. Three Playwright E2E scenarios passed on GitHub Actions ([run 41998367589](https://github.com/hungtvb/dat-lat-hen-nhau/actions/runs/41998367589)). Unlisted scenarios remain **NOT RUN**. The prior offline prototype `Đà Lạt Trong Mơ` does not count as multiplayer evidence.

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

| Scenario | Actual test evidence | Boundary |
|---|---|---|
| M01 partial | A creates room, B joins using invite, both rosters show 2/6, B sees A's server-controlled movement | Same CI runner with **two separate browser contexts**, not two physical devices |
| M03 partial | B's real WebSocket closes with Colyseus `MAY_TRY_RECONNECT` (4010) after SDK `minUptime=5000ms`; A sees disconnected/connected and same session ID after recovery | Not a physical 10–20s outage; no seats implemented |
| M06 partial | Invalid invite token is rejected and host roster remains 1/6 | Expired token and direct room-ID attempts not yet covered |

Other network and social test rows are **NOT RUN** or not yet implemented. Full visual QA V01–V08 is **NOT RUN**. Passing headless Chromium browser integration is not equivalent to GPU screenshot review or a WAN group playtest.

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
