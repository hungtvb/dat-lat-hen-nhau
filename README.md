# Đà Lạt Hẹn Nhau

Một thế giới 3D nhẹ nhàng dành cho nhóm bạn muốn đi dạo Đà Lạt cùng nhau qua trình duyệt. **Không quest, không điểm số, không thắng thua.**

## Trạng thái

**Foundation / network spike (2026-11-05).** GitHub CI đã chạy ứng dụng Colyseus + Three.js trong Chromium và đạt **8/8 bài E2E**: đồng bộ hai người, token mời hợp lệ, room đủ sáu người, reconnect, timeout 45 giây, host handoff và chống spawn trùng. [Bằng chứng CI](https://github.com/hungtvb/dat-lat-hen-nhau/actions/runs/42023515834). Đây chưa phải kiểm thử hai thiết bị qua Internet hay visual QA. Cảnh hiện tại vẫn là geometry placeholder, không phải art proof Đà Lạt. Chi tiết: [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md).

## Chạy trên máy có internet

Yêu cầu: Node.js **22+**, npm, Chrome/Edge có WebGL2.

```sh
npm ci
npm run dev
```

- Client: `http://localhost:5173`
- Room server: `http://localhost:2567`
- Health: `http://localhost:2567/health`

Mở client ở **hai cửa sổ trình duyệt độc lập**. A nhập tên, chọn áo và **Tạo chỗ hẹn**; lấy URL có fragment `#room=…&invite=…`, gửi B. B mở link, chọn tên và vào phòng. A/B thấy tên và avatar của nhau. Dùng `WASD`/mũi tên để đi; kéo chuột để xoay camera. Có thể kiểm tra code phòng và chuyển động bằng Playwright trong môi trường có browser/GPU phù hợp.

Lưu ý: server trong `npm run dev` phục vụ kết nối localhost. Muốn bạn bè thật sự chơi từ Internet cần triển khai server Node có HTTPS/WSS, proxy, giới hạn request và các bài kiểm thử multiplayer qua WAN; **không đưa app lên Vercel serverless function thông thường** để host room kết nối dài.

## Kiểm thử

```sh
npm test                   # shared contracts (Node)
npm run typecheck          # server + web (requires installed dependencies)
npm run build              # shared + server + web (requires installed dependencies)
npx playwright install chromium
npm run test:e2e           # starts local server + web; requires dependencies & WebGL
```

GitHub Actions chạy thành công `npm ci`, contract tests, typecheck, build và **8/8 Playwright E2E** với hai browser context trên cùng runner. Máy đóng gói cục bộ vẫn không truy cập npm registry, nên chưa chạy full app ở môi trường đó. Chưa có kiểm thử hai thiết bị vật lý qua Internet, độ trễ WAN hoặc review hình ảnh WebGL thực.

## Cấu trúc

```text
apps/server/             Colyseus authoritative room + invite gate + basic movement
apps/web/                Vite/Three.js game + lobby/invite interface
packages/shared/         Runtime contracts và validation functions
world/                   Scene specification nghệ thuật đã duyệt
tests/integration/       Pure domain-contract tests
tests/e2e/               Playwright multiplayer/room regression (8/8 passed in CI)
docs/                    GDD, art direction, architecture, QA, implementation evidence
```

## Giới hạn hiện tại

- Colyseus room và đồng bộ di chuyển đã được kiểm thử E2E trên CI; chưa kiểm thử hai máy thực tế, mạng WAN, GPU performance hay lỗi abuse ở mức production.
- Avatar, địa hình, hồ, thông vẫn là placeholder; chưa có ghế ngồi, emote, chat, photo mode, thời tiết hay audio.
- Auth chỉ dùng invite token ngẫu nhiên; phiên bản public vẫn cần threat model, load/abuse testing và cơ chế observability.
- Phần phục vụ trải nghiệm nhóm bạn được tiếp tục theo các mục T02–T07 trong [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md); không tự đánh dấu mục nào PASS khi chưa có hai client thật.

## Quyền & nguồn

Cảnh được tạo bằng primitive/procedural geometry của dự án, không tái phân phối ảnh du lịch hay models chưa rõ giấy phép. Thiết kế 3D tham chiếu quy trình từ 3Dviz Pro Max (MIT) và UX từ UI UX Pro Max (MIT); việc dùng phương pháp không hàm ý sử dụng đầy đủ kit bên ngoài ở runtime.
