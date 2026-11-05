import {defineServer, defineRoom, matchMaker} from "colyseus";
import {LakesideRoom} from "./rooms/LakesideRoom.js";
import {newInviteToken} from "./security.js";

const port = Number(process.env.PORT || 2567);
const createHits = new Map<string, number[]>();
const MAX_ROOM_CREATES_PER_5_MIN = 8;

const server = defineServer({
  rooms: {dalat_lakeside: defineRoom(LakesideRoom)},
  express: (app) => {
    app.get("/health", (_req, res) => res.json({ok: true, service: "dalat-hen-nhau"}));
    // Creator obtains roomId + high-entropy secret; player sends secret through join options.
    app.post("/api/rooms", async (req, res) => {
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const now = Date.now();
      const attempts = (createHits.get(ip) ?? []).filter(x => now - x < 300000);
      if (attempts.length >= MAX_ROOM_CREATES_PER_5_MIN) {
        res.status(429).json({error: "Tạo phòng quá nhanh. Thử lại sau."});return;
      }
      attempts.push(now);createHits.set(ip, attempts);
      const invite = newInviteToken();
      try {
        const room = await matchMaker.createRoom("dalat_lakeside", {invite});
        res.set("Cache-Control", "no-store");
        res.status(201).json({roomId: room.roomId, invite});
      } catch (err) {
        console.error("Room create failed", err instanceof Error ? err.name : "unknown");
        res.status(500).json({error: "Không tạo được phòng"});
      }
    });
  }
});
// For invite-only rooms clients must not create arbitrary public rooms via matchmaking.
matchMaker.controller.exposedMethods = ["joinById", "reconnect"];
await server.listen(port);
console.log(`Đà Lạt Hẹn Nhau server ready at http://localhost:${port}`);
