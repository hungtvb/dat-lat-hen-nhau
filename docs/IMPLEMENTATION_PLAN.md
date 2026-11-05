# Implementation Plan — Đà Lạt Hẹn Nhau

**Stage:** design package completed; implementation NOT STARTED.  
**Process:** Superpowers-inspired design-first → work plan → small vertical slices → test-driven changes → visual QA → independent review.

## 1. Execution strategy

Không bắt đầu bằng việc dựng full Đà Lạt. Rủi ro cốt lõi không phải số lượng model mà là: **có cảm giác ở bên bạn bè hay không**, ảnh hưởng trực tiếp bởi game networking, avatar motion, camera, scene composition và ánh sáng. Xác nhận các yếu tố đó bằng một vertical slice trước khi thêm địa danh.

Gói này **không sửa nguồn prototype cũ**. Nếu chọn mở repository mới hoặc nâng cấp repo có sẵn, đọc `AGENTS.md` đúng nhánh trước từng task độc lập. Mọi code change phải có đề xuất phạm vi/ảnh hưởng/check trước khi sửa; thay đổi lớn phải qua thiết kế được duyệt.

## 2. Các phase theo dependency, không theo ngày

### D0 — Approve design (review checkpoint)
**Input:** GDD, Experience & Art, Architecture, World JSON, Test Plan.  
**Decision:** duyệt không gamification, khung 2–6 người, world lakeside và công nghệ web+Colyseus.  
**Exit:** tài liệu được xác nhận; nếu cần sửa art direction thì sửa ở design trước khi dựng scene.

### D1 — Network foundation (functional spike)
**Build:** mono repo, typed shared contracts; `create private room → join by invite → two avatars visible → move sync → reconnect`; scene ở đây chỉ dùng neutral placeholder ground/avatar để test sync, không tự nhận đã đẹp.  
**Exit gate:** hai trình duyệt thật trên hai máy cùng thấy vị trí và tên, reconnect không tạo avatar trùng; CI có tests room + validation; lỗi join đầy đủ.

### D2 — The scenic vertical slice (art proof)
**Build:** một đoạn bờ hồ (cỡ 60–100m), water/mist/pines, one bench, one cafe silhouette, one polished avatar, real morning light; camera free-look, 2–3 viewpoints, performance presets.  
**Exit gate:** screenshot thật overview+close-up+sunrise/dusk, không cắt chân avatar, không nhòe hồ, cây không che camera; có hình ảnh tham chiếu; FPS được đo thay vì đoán.

### D3 — Togetherness features
**Build:** walk/idle/sit, one seat reservation, emotes synchronized, invite UX, compact chat/mute, room authority, host handoff, reconnect/graceful fail.  
**Exit gate:** ba người chạy đủ 15 phút và test tất cả edge case room/seat/emote/disconnect; chat focus không gây player movement.

### D4 — Photo & scenic refinement
**Build:** camera/photo UI, PNG export local, 3 shared light presets, soundscape quyền rõ ràng, path ven hồ hoàn chỉnh, viewpoints, low/high graphics.  
**Exit gate:** chụp ảnh có đủ avatar+world, weather nhất quán giữa clients, rendering 1080p đạt target đo trên cấu hình tiêu biểu, review ánh sáng và chất liệu.

### D5 — Friends online playtest & handover
**Build:** public preview HTTPS/WSS, invitation links, basic rate-limit, support/troubleshooting; run playtest 3–6 người qua mạng thật.  
**Exit gate:** một buổi chơi tự nguyện 15–20 phút, không có crash/blocker, no ghost avatar, ảnh lưu được, người chơi hiểu cách về điểm hẹn và có chỗ dừng ngắm cảnh; feedback chưa đạt được đưa vào backlog, không tự nhận thành công.

## 3. Proposed work items / PR boundaries

| Task | Nội dung | Ưu tiên | Verification |
|---|---|---|---|
| T01 | Project bootstrap + contract + CI (no gameplay) | P0 | build/lint/unit pass |
| T02 | Private room, guest join, token validation | P0 | 2-client join and unauthorized join rejection |
| T03 | Server movement, remote avatar interpolation, reconnect | P0 | sync E2E + network drop tests |
| T04 | Art proof lakeside + camera + graphics settings | P0 | observed browser captures + perf baseline |
| T05 | Seats, 5 emotes, chat/mute/host handoff | P0 | cross-client interaction E2E |
| T06 | Photo mode, 3 ambience presets, soundscape | P0 | PNG bytes/image & cross-client state QA |
| T07 | Refine world + accessibility + online release gate | P0 | group playtest / targeted regression |
| T08 | Optional next zones/transport | P2 | after positive user review only |

Một task = thay đổi có thể review, có acceptance test. Không tạo PR ồ ạt cho cả game hoặc 15 thư mục chưa dùng.

## 4. Order to avoid risky overengineering

1. **First milestone is 2 browsers in one actual room.** Fake multiplayer in one canvas không đạt.
2. Then **a beautiful 100m lakeside**. Avoid 5–6 primitive POIs from previous prototype.
3. Then **social actions**. Multiplayer physics/chasing not needed.
4. Then expand the **one world** rather than adding standalone disconnected scenes.
5. Audio/photo/weather after atmosphere and join correctness; photo must not force server image storage.

## 5. Definition of Done — every implementation task

- Design contract/acceptance understood; impacted files identified; no invented features.
- Test for core behavior added/updated; edge conditions covered proportionally.
- Build/lint/automated tests pass with commands/versions recorded.
- For visual tasks, a real browser screenshot compared with direction and reviewed at meaningful viewpoints; not solely compile success.
- For multiplayer tasks, test at least two separate client instances against real server, not mocked state only.
- Privacy (chat, invite link, guest name), accessibility and resource disposal reviewed.
- Task status and known limitations updated in existing docs (not another report for every tiny edit).

## 6. Technical risks and mitigations

| Risk | Impact | First mitigation |
|---|---|---|
| Game đẹp nhưng không có cảm giác “cùng nhau” | mất product value | 2-client networking test trước world content |
| Ghế/pose bị lệch giữa client | ảnh nhóm sai / avatar trùng | authoritative seat state, deterministic animation times |
| Performance kém do sương, phản xạ, 300 cây | player yếu không vào được | early GPU capture, low preset, instancing/LOD |
| Game giống demo low-poly generic | không gợi Đà Lạt | art proof per-hero, kiểm tra silhouette/material/fog |
| Browser/WebGL môi trường QA không hỗ trợ | thiếu bằng chứng QA | device browser thật, ghi rõ GPU path chưa test |
| Invite link lọt ra ngoài | phòng bị quấy rối | opaque token, auth, host kick, rate limit |
| Mất kết nối / host rời | trải nghiệm nhóm đứt quãng | reconnect reservation and host transfer tests |
| Asset âm thanh, 3D, tham khảo có bản quyền | rủi ro phân phối | source ledger và chỉ dùng asset được cấp phép |

## 7. Handover instructions to coding agent

Read `README.md` → `docs/GDD.md` → `docs/EXPERIENCE_AND_ART.md` → `docs/ARCHITECTURE.md` → `docs/TEST_PLAN.md` → `world/scene-spec.json`. Nếu làm trên một repo, **lấy AGENTS.md mới nhất trước mỗi task**. Bắt đầu từ **T01** và mô tả kế hoạch tệp/kiểm thử trước khi sửa code; đừng tạo gameplay feature hay mở rộng map trước khi hoàn tất T02–T04. Không phát biểu CI/GPU/multiplayer PASS nếu không có run evidence.

**Status:** tài liệu đề xuất; chưa được duyệt như code plan, chưa tạo issue/PR hoặc remote repo.
