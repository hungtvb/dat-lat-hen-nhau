# Đà Lạt Hẹn Nhau — Game Studio Redesign v2

**Ngày:** 2026-11-06  
**Trạng thái:** PROPOSED / design-only / chưa được nghiệm thu  
**Nguyên tắc:** visual-first, multiplayer-preserving. Đây là thiết kế lại trò chơi, **không** khẳng định đã khôi phục scene 3Dviz gốc hoặc hoàn tất game.

## 1. Tầm nhìn sản phẩm

**“Chưa đi Đà Lạt được thì mình hẹn nhau ở đây.”**

Một địa điểm gặp gỡ 3D ấm áp, đẹp đến mức nhóm bạn muốn dừng lại ngắm thay vì chạy qua cho xong. Dành cho **2–6 người bạn**, vào phòng riêng bằng link, cùng xuất hiện trong cùng một khung cảnh Đà Lạt cách điệu, đi bộ, nhìn nhau, ngồi lại và chụp ảnh kỷ niệm khi các tính năng xã hội được triển khai.

**Không có:** quest, chiến đấu, điểm, XP, nhiệm vụ sưu tầm, bộ đếm giờ, NPC AI, xe máy, full city, public matchmaking, voice chat tích hợp hoặc mobile touch trong phase đầu.

**Gameplay fantasy:** “Bạn đang đứng ở bờ hồ vào sáng sớm; một người bạn vừa đến, cả hai đi dưới hàng thông, dừng nhìn mặt nước và trò chuyện.”

## 2. Design pillars / thứ tự ưu tiên

1. **Scenery worth staying for.** Screenshot của **canvas game thật khi ẩn HUD** phải đẹp, bố cục có chiều sâu. Build xanh hoặc 3D chạy được không đủ.
2. **Togetherness, not parallel solo views.** Phòng riêng, đồng bộ avatar và hướng đi; cùng đứng ở một nơi, không avatar ma hay teleport khó chịu.
3. **No pressure.** Có thể đứng yên 15 phút; UI không thúc giục làm nhiệm vụ, không “start game” đồng hồ.
4. **Fast invitation, gentle interactions.** Link mời, tên hiển thị, màu áo, click vào phòng. Người ít chơi game vẫn hiểu cách đi.
5. **Actual web runtime truth.** Game phải trông tốt **trên Vercel/Three.js**, không chỉ ở ảnh concept, video Blender hoặc bản prototype độc lập.

## 3. Hành trình chơi 15–20 phút, không có mục tiêu bắt buộc

| Mốc | Việc người chơi làm | Kết quả cảm xúc & tương tác |
|---|---|---|
| 0. Vào | Mở link → tên + màu áo → vào phòng | Nhìn thấy một khung cảnh đẹp, không bị dashboard chắn |
| 1. Gặp | Spawn ở Điểm hẹn ven hồ, nhận ra bạn bè | Biết mình đang ở cùng một không gian |
| 2. Ngắm | Xoay camera, nhìn mặt hồ, các đồi và nắng xuyên thông | Có lý do để dừng lại |
| 3. Dạo | Đi một tuyến ven hồ ngắn, có view mở và view dưới tán | Camera không vướng cây/nền |
| 4. Tương tác (D3) | Vẫy tay, ngồi cạnh, chỉ cảnh, chat ngắn | Cảm giác “đi với nhau” |
| 5. Kỷ niệm (D4) | Tạo dáng, chụp PNG từ scene thực | Lưu một tấm ảnh tự nguyện |
| 6. Rời | Rời phòng / reconnect / quay lại bằng link | Không phá phòng của người khác |

**Kỹ thuật ưu tiên v2:** 0–3 trước. 4–5 là backlog đã xác định, không triển khai để bù cho hình ảnh chưa đạt.

## 4. Cấu trúc không gian theo trải nghiệm

Không dựng ngay bản đồ Đà Lạt đầy đủ. Một **scenic slice** có ba tầng:

- **Foreground — điểm hẹn:** 2–6 người đứng gần nhau, chân chạm mặt đất, mép lối đi và bờ nước rõ, một cây thông có tán vươn ngang tạo khung.
- **Midground — tuyến đi dạo:** đường uốn tự nhiên có scale người thật, nhóm thông không đồng dạng, khoảng trống hướng ra mặt nước; đủ khoảng trống để camera nhìn người.
- **Background — chất Đà Lạt:** mặt hồ rộng, bờ xa, đồi phủ thông, chút dấu vết đô thị/villa xa qua sương; không vẽ “làng cổ fantasy”.

### Phạm vi thật và giới hạn authority

- **D2-S1 (nghiệm thu hình ảnh đầu):** một khu vực **trong bounds server hiện tại x,z = ±22 m**. Chi tiết ngoài vùng đi được có thể thấy nhưng không thể bước lên; không mở rộng movement chỉ ở client.
- **D2-S2 (mở đường):** mục tiêu tuyến ven hồ **60–100m** chỉ thực hiện khi **server movement bounds/collision/camera/2-client E2E** được thiết kế và duyệt riêng.
- **D4+ (mở rộng nội dung):** ghế đẹp/chỗ chụp ảnh/cà phê Góc Sương là những điểm khám phá về sau. Quán là **hư cấu**, và không tự đặt biểu tượng Lâm Viên ở một viewpoint chưa xác minh như thể chính xác địa lý.

## 5. Luật điều khiển và UX

- Desktop-first: WASD/mũi tên đi bộ; drag-to-look, third-person camera quan sát cảnh. Có lựa chọn giảm motion/sương.
- **HUD nhẹ:** chỉ tên khu/room nhỏ ở cạnh, trạng thái mạng tức thời, nút menu; danh sách người/invite/settings ở panel thu gọn. Không dùng sidebar 2 thẻ to che 1/4 cảnh.
- Trọng tâm màn hình không overlay dài; prompt ngữ cảnh chỉ hiện khi gần chỗ tương tác. H key / photo mode ẩn HUD hoàn toàn (chỉ khi có implement).
- Các panel khóa input quay camera/di chuyển phù hợp; khi focus chat/input không gửi movement.
- Không tích hợp chat voice ở v1. Chat chữ/emote/sit chỉ bắt đầu sau art proof.
- Mobile: chưa hỗ trợ gameplay, báo minh bạch; responsive lobby thôi.

## 6. Các trạng thái cần thiết

Joining; assets loading (tiến độ thực); room full; invite invalid/expired; WebGL unavailable; critical asset load failure; temporary reconnect; terminal disconnect; leave/rejoin; room host handoff. Không dùng lỗi “offline” giả hoặc cảnh placeholder lặng lẽ khi GLB tải lỗi.

## 7. Stack và trách nhiệm rõ ràng

- **Game Studio:** player verbs, flow, interaction, UX state, testability, multiplayer gameplay rules.
- **3Dviz Pro Max:** 3D composition, geometry/material/lighting/camera, look development và so sánh ảnh render thực.
- **Client:** TypeScript + Vite + Three.js, renderer/asset loader/animation/camera và DOM HUD.
- **Server:** Node.js + Colyseus; room/private invite, movement authority, player presence/reconnect. Không viết lại.
- **Shipped assets:** GLB/glTF 2.0 có license/provenance; authored source giữ riêng; material/pivot/scale phù hợp mét; có LOD/collision proxy khi cần.

## 8. Release gates do Game Studio quyết định

**D2 art proof (trước social features):**
- 3 real-canvas frames: lake meeting / pine walk / group readability. Mỗi frame nêu camera, viewport, SHA, renderer, preset, source provenance.
- Silhouette cây, mép hồ, water reflection, far depth và lighting đạt **đánh giá thủ công**; không “PASS” chỉ vì Playwright lưu ảnh.
- 2 client/browser trong cùng phòng nhìn thấy nhau, avatar không chìm/nổi, camera không xuyên mesh.
- Typecheck/build/contract/browser integration xanh, không thay đổi movement authority.
- FPS có số đo **trên GPU thực** với báo cấu hình; mục tiêu desktop Low ≥30 FPS với 6 avatar, 60 FPS nếu phần cứng cho phép (**target, không phải kết quả**).

**D3 social proof:** đi bộ/ngồi/vẫy tay đồng bộ, seat exclusivity server-authoritative, chat escape/rate limit, reconnect state.

**D4 photo proof:** PNG thực có avatar hiện tại và scene; không ảnh giả, không upload cloud tự động.

**Player acceptance:** 3–6 người trên máy/mạng thật chơi 15–20 phút, tự chọn một góc muốn dừng và chụp, không có blocker.

## 9. Quyết định phạm vi v2

**Giữ lại:** concept, private room 2–6, Colyseus, TypeScript/Vite/Three.js, chuẩn visual “Sương đầu mùa”, desktop-first và test evidence.  
**Thay đổi:** art là acceptance gate trước khi tăng tính năng; tách HUD khỏi playfield; audit và phục hồi original 3Dviz trước khi viết thêm procedural scenery.  
**Không hợp thức hóa:** PR #5 hoặc nhánh `feat/d2a2-pine-and-framing` thành “bản đẹp hơn” chỉ vì có cây thông; cả hai không được dùng làm visual baseline đã duyệt.

**Status:** Design proposal. Chưa sửa runtime, chưa deploy, chưa xác nhận scene 3Dviz gốc có thể tái sử dụng.
