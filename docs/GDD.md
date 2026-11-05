# Game Design Document — Đà Lạt Hẹn Nhau

**Version:** 0.1 — concept / design proposal  
**Last reviewed:** 2026-11-05  
**Product:** browser-first cozy social sightseeing game; desktop-first; tiếng Việt mặc định.

## 1. Vision

Một nhóm bạn yêu Đà Lạt nhưng chưa có dịp đi cùng nhau có thể hẹn gặp tại một Đà Lạt 3D đẹp, đi dạo sát bên nhau, ngồi cà phê, ngắm sương và chụp một tấm ảnh chung. Trò chơi tạo ra cảm giác *cùng hiện diện* thay vì thúc đẩy hoàn thành nhiệm vụ.

**One-line pitch:** *Chưa đi Đà Lạt được thì mình hẹn nhau ở đây.*

**Emotional target:** êm, gần gũi, hơi hoài niệm, có chút mong đợi chuyến đi thật. Không biến Đà Lạt thành công viên giải trí hoặc tập hợp landmark thu nhỏ.

## 2. Người chơi và nhu cầu

- Nhóm bạn 2–6 người, thường có sẵn một kênh liên lạc ngoài game.
- Chỉ cần trình duyệt desktop, một đường link mời, tên hiển thị; không bắt tạo tài khoản.
- Người thích ngắm phong cảnh hơn thử thách; người ít chơi game vẫn có thể đi bộ và ngồi xem.
- Có thể vào muộn, rời đi và quay lại mà không phá cuộc vui của cả nhóm.

**Jobs-to-be-done**
1. “Mình muốn nhìn thấy mọi người ở cùng một chỗ, không phải sáu màn hình game độc lập.”
2. “Mình muốn cùng đi đến một góc đẹp, dừng lại, ngồi và nói chuyện.”
3. “Mình muốn có một tấm ảnh nhóm làm kỷ niệm.”

## 3. Non-negotiable design pillars

| Pillar | Diễn giải | Bằng chứng phải có |
|---|---|---|
| Cùng hiện diện | Vị trí, hướng nhìn, trạng thái đi/ngồi và emote của bạn được thấy bởi những người khác | Hai trình duyệt thật nhìn thấy nhau và đồng bộ được |
| Cảnh đáng để dừng lại | Ảnh chụp không cần overlay hay sticker mới đẹp | Một góc hồ và một góc quán cà phê vượt QA hình ảnh thật |
| Không áp lực | Không nhiệm vụ, không time limit, không XP, không điểm danh | Có thể ở yên 15 phút mà UI không thúc giục |
| Vào nhanh và trở lại dễ | Mở link, đặt tên, vào phòng và thấy bạn | Kịch bản fresh join + reconnect thực tế |

## 4. Phạm vi v1 — một thế giới nhỏ nhưng hoàn chỉnh

**Một vùng khám phá liên tục:** *Lối hẹn ven hồ Xuân Hương* — dài khoảng 220–280 m đi bộ theo lối uốn cong trong một khu thế giới khoảng 300×220 m (kích thước scene đề xuất, không phải bản đồ thực).

Ba điểm nghỉ có vai trò trải nghiệm khác nhau:

1. **Bậc thềm bên hồ — Điểm hẹn:** spawn an toàn, thấy mặt nước, bạn bè và lối đi; chỗ đứng cho cả nhóm; bảng tên khu vực nhẹ.
2. **Đường thông — Đi dạo:** hàng cây thông tạo phối cảnh, gió/âm thanh lá, đoạn lan can và ghế đôi; camera không bị cây che liên tục.
3. **Cà phê Góc Sương — Ngồi cùng nhau:** quán hư cấu trên triền dốc gần hồ, đủ chỗ cho sáu người, ánh đèn ấm; điểm chụp cả nhóm và nhìn ra quảng trường Lâm Viên phía xa.

**Địa danh thật làm mốc nhận diện:** hồ Xuân Hương và hình khối kiến trúc đặc trưng của quảng trường Lâm Viên trong khoảng nhìn. Ga Đà Lạt, Crazy House và các khu khác là *zone mở rộng riêng*, không đặt cạnh hồ một cách sai địa lý. Đây là **diễn giải nghệ thuật**, không phải bản đồ dẫn đường hay bản sao công trình chính xác.

## 5. Core experience loop (không gamification)

`Nhận link mời → Vào phòng → Gặp bạn → Đi bộ/ngắm cảnh → Dừng & tương tác → Chụp ảnh nếu thích → Tiếp tục hoặc rời phòng.`

Không có quest, dấu mộc, checklist địa danh, cửa hàng, tiền tệ, level, NPC hướng dẫn, giới hạn thời gian hay màn kết thúc. Người chơi tự chọn lúc nào là đủ.

## 6. Core mechanics

### Avatar và chuyển động
- Avatar stylized-semi-realistic mặc áo khoác; chọn 1 trong 4 phối màu và tên hiển thị. Không giới tính hóa bắt buộc.
- Các trạng thái `idle`, `walk`, `sit`, `emote`; đi bộ tốc độ nhẹ, không sprint, không parkour.
- Điều khiển `WASD` hoặc mũi tên; chuột xoay camera; `Shift` không biến thành chạy nhanh. Có nút trở lại điểm hẹn để chống kẹt, không phải teleport tự do qua mọi khu.
- Tránh avatar xuất hiện trùng chỗ: spawn slot so le; collision avatar mềm, không làm nghẽn lối.

### Emote (5 loại ban đầu)
`wave` (vẫy tay), `heart` (thả tim), `laugh` (cười), `photo_pose` (tạo dáng), `point` (chỉ cảnh). Hiệu ứng hiển thị tối đa ~3–4 giây, không spam; người khác thấy đúng thời điểm. `sit` là tương tác ghế, không phải emote ngồi tự do xuyên mặt đất.

### Tương tác với cảnh
- `E`/nút ngữ cảnh khi đến gần ghế hoặc chỗ đứng chụp ảnh.
- Ghế có số chỗ xác định, người đã ngồi sẽ được đồng bộ tới người khác; một chỗ không thể có hai người.
- Có thể rời ghế bằng `W`/`Escape`/nút Đứng dậy, không khóa điều khiển.
- Khu vực đẹp có thể hiện một nhãn nhỏ khi lại gần, không waypoint khổng lồ hoặc mũi tên nhiệm vụ.

### Giao tiếp
- **Text chat ngắn, tùy chọn** để hẹn bạn khi không có cuộc gọi ngoài game; khung chat thu gọn, không che cảnh. Giới hạn độ dài và tốc độ, lọc/escape nội dung.
- Emote và nhóm đang hiện diện vẫn có ý nghĩa ngay cả khi tắt chat.
- **Không tích hợp voice chat v1**; người chơi có thể tự dùng Discord/Messenger ngoài game.

### Photo mode
- `P` hoặc nút máy ảnh mở mode chụp; camera tự do trong bán kính giới hạn, ẩn HUD; có nút **Chụp ảnh** và **Thoát**.
- Ảnh là frame 3D **thực ở thời điểm người dùng bấm**, có avatar và emote lúc đó; lưu PNG vào máy người chơi, không upload server.
- Chụp ảnh không ép mọi người cùng pose, không làm đóng băng cả phòng; mỗi người có thể chọn tạo dáng tự nguyện.

### Thời tiết / ánh sáng
- Ba preset chia sẻ trong một phòng: `morning-mist`, `clear-afternoon`, `purple-dusk`; **host** đổi preset, tránh trạng thái không đồng nhất khi chụp ảnh nhóm.
- Chuyển cảnh êm, không flash; người chơi có thể tắt hiệu ứng chuyển động/độ hạt và giảm sương cá nhân để dễ nhìn (không thay giờ chung của phòng).
- Chưa cần mưa, ban đêm tối hoàn toàn hoặc chu kỳ 24h thời gian thực.

## 7. Player journey và happy path

1. **Link mời:** bạn A tạo phòng “Hẹn chiều thứ bảy”; hệ thống phát link/code không bị liệt kê công khai. A chọn thời tiết ban đầu.
2. **Vào phòng:** B mở link, nhập tên ngắn, chọn màu áo, bấm “Vào gặp mọi người”; chờ tải scene có tiến độ thật và lựa chọn đồ họa thấp.
3. **Gặp mặt:** B spawn cạnh A, thấy nhãn tên dễ đọc, A vẫy tay và B thấy animation.
4. **Cùng dạo:** C vào muộn, cả nhóm đi dọc ven hồ; không có màn chờ bắt đầu hay đếm ngược.
5. **Ngồi & chụp:** A/B ngồi ghế, C mở photo mode, chụp nhóm; những người khác vẫn có thể đi bình thường.
6. **Tạm mất mạng:** B bị ngắt 10–20 giây; hệ thống báo reconnect, không tạo avatar ma khi trở lại.
7. **Kết thúc tự nhiên:** mọi người rời đi; phòng tự đóng khi không còn ai sau thời gian chờ. Không có màn thắng thua.

## 8. Edge cases phải thiết kế từ đầu

- Link không hợp lệ, phòng đã đóng, phòng đủ 6 người.
- Hai người chọn cùng tên; thêm phân biệt ngắn mà không ép đổi tên.
- Mất kết nối khi đang ngồi ghế, khi emote hoặc lúc chụp ảnh.
- Host rời phòng: chuyển vai trò cho người đã ở lâu nhất; thời tiết đang dùng giữ nguyên.
- Người vào muộn nhận snapshot đúng: vị trí, ghế đang có người, thời tiết, tên và emote đang còn hiệu lực.
- Thiết bị yếu/WebGL không khả dụng: báo rõ yêu cầu trình duyệt và hỗ trợ chế độ Low; **không hứa 3D đã được kiểm thử trên mọi máy**.
- Người gây phiền: host kick, người chơi tự mute nội dung của người khác; server rate-limit chat/emote.

## 9. MVP feature boundary

| Must ship for first playable shared world | Later only |
|---|---|
| Private room 2–6 + invite link + guest name | Accounts, friend graph, persistent world |
| Third-person walk, avatar presence, interpolation | Xe máy, ngồi xe đôi, VR, mobile controls |
| Một khu ven hồ chất lượng, hai điểm nghỉ | Ga Đà Lạt/Crazy House zone mới |
| Sit/stand, 5 emotes, compact chat | Voice chat, synchronized hugs, NPCs |
| Photo mode local, shared three light presets | Album cloud, weather simulation, seasons |
| Reconnect, basic abuse controls, accessibility HUD | Public matchmaking / community events |

## 10. Success evaluation (targets, chưa phải kết quả)

- 3 người thật từ **ba trình duyệt/thiết bị** cùng vào private room và nhìn thấy nhau liên tục 15 phút.
- Từ click link mời đến nhìn thấy bạn: **mục tiêu dưới 30 giây** trên đường truyền thử nghiệm và sau khi đã tải asset, báo số đo thực; first load tách riêng.
- Avatar không teleport/jitter dễ nhận thấy trong thử nghiệm 100ms RTT có mô phỏng jitter.
- 3 người tự nhiên dừng ở ít nhất một góc phong cảnh mà không có quest hướng dẫn (chỉ số nghiên cứu trải nghiệm, không telemetry mặc định).
- Kết thúc playtest có ít nhất một tấm ảnh nhóm người chơi tự muốn lưu; feedback được ghi nhận bằng phỏng vấn, không ép điểm số.

## 11. Chủ động không làm

Không biến game thành checklist địa điểm, không thêm AI nhân vật không cần thiết, không làm “full city” ở v1, không đưa chế độ lái xe của demo trước vào v1, không thêm hệ thống tài khoản/database trước khi cần. Mỗi feature phải trả lời: **nó có giúp hai người thấy mình đang ở bên nhau và muốn ngắm Đà Lạt lâu hơn không?**

## 12. Trạng thái

Tất cả phần trên là **PROPOSED**, chưa được xác nhận thành game thật. Lấy ý kiến duyệt trước khi code phần client/server lớn.
