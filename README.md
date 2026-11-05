# Đà Lạt Hẹn Nhau

Một thế giới 3D nhẹ nhàng dành cho nhóm bạn muốn đi dạo Đà Lạt cùng nhau qua trình duyệt. **Không quest, không điểm số, không thắng thua.**

## Trạng thái

**Foundation / network spike (2026-11-05).** Đã tạo TypeScript monorepo, hợp đồng dữ liệu, Colyseus room code, client Three.js và lobby UI. **Chưa xác nhận chạy multiplayer thực tế** do môi trường hiện tại không thể tải package npm. Cảnh hiện tại chỉ là geometry placeholder cho kiểm thử đồng bộ, không phải bản art proof Đà Lạt. Chi tiết: [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md).

## Chạy trên máy có internet

Yêu cầu: Node.js **22+**, npm, Chrome/Edge có WebGL2.

```sh
npm install
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

`npm install` chưa thực hiện được trong môi trường đóng gói ở đây do DNS của npm registry không khả dụng; do đó `build`, `typecheck` toàn ứng dụng, server startup và E2E hai trình duyệt **NOT RUN**. Đừng xem syntax parse hoặc lobby screenshot là bằng chứng multiplayer đã chạy.

## Cấu trúc

```text
apps/server/             Colyseus authoritative room + invite gate + basic movement
apps/web/                Vite/Three.js game + lobby/invite interface
packages/shared/         Runtime contracts và validation functions
world/                   Scene specification nghệ thuật đã duyệt
tests/integration/       Pure domain-contract tests
tests/e2e/               Two-browser Playwright scenarios (not yet run)
docs/                    GDD, art direction, architecture, QA, implementation evidence
```

## Giới hạn hiện tại

- Có phòng, di chuyển và render trong **source**; chưa xác minh vận hành với dependencies Colyseus / Three.js trên npm.
- Avatar, địa hình, hồ, thông vẫn là placeholder; chưa có ghế ngồi, emote, chat, photo mode, thời tiết hay audio.
- Auth chỉ dùng invite token ngẫu nhiên; phiên bản public vẫn cần threat model, load/abuse testing và cơ chế observability.
- Phần phục vụ trải nghiệm nhóm bạn được tiếp tục theo các mục T02–T07 trong [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md); không tự đánh dấu mục nào PASS khi chưa có hai client thật.

## Quyền & nguồn

Cảnh được tạo bằng primitive/procedural geometry của dự án, không tái phân phối ảnh du lịch hay models chưa rõ giấy phép. Thiết kế 3D tham chiếu quy trình từ 3Dviz Pro Max (MIT) và UX từ UI UX Pro Max (MIT); việc dùng phương pháp không hàm ý sử dụng đầy đủ kit bên ngoài ở runtime.
