import {defineServer, defineRoom, matchMaker} from "colyseus";
import type {Request, Response, NextFunction} from "express";
import {LakesideRoom} from "./rooms/LakesideRoom.js";
import {newInviteToken} from "./security.js";

const port = Number(process.env.PORT || 2567);
const createHits = new Map<string, number[]>();
const rateLimit = Number(process.env.MAX_ROOM_CREATES_PER_5_MIN ?? 8);
const MAX_ROOM_CREATES_PER_5_MIN = Number.isSafeInteger(rateLimit) && rateLimit >= 1 && rateLimit <= 100 ? rateLimit : 8;
// The explicit frontend allowlist is required for browser requests from Vercel.
// In development, two Vite origins are allowed; deployment sets ALLOWED_ORIGINS.
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173,http://127.0.0.1:5173")
    .split(",").map(origin => origin.trim()).filter(Boolean)
);
// Expire stale per-IP entries even when that IP never sends another request.
const purge = setInterval(() => {
  const now = Date.now();
  for (const [ip, hits] of createHits) {
    const recent = hits.filter(time => now - time < 300_000);
    if (recent.length) createHits.set(ip, recent);
    else createHits.delete(ip);
  }
}, 60_000);
purge.unref();

const server = defineServer({
  rooms: {dalat_lakeside: defineRoom(LakesideRoom)},
  express: (app) => {
    // Only trust a proxy hop when the deployment explicitly configures it.
    app.set("trust proxy", process.env.TRUST_PROXY === "1" ? 1 : false);
    app.use("/api/rooms", (req: Request, res: Response, next: NextFunction) => {
      const origin = req.header("origin");
      if (origin && !allowedOrigins.has(origin)) {
        res.status(403).json({error: "Origin không được phép"}); return;
      }
      if (origin) {
        res.set("Access-Control-Allow-Origin", origin);
        res.set("Vary", "Origin");
      }
      if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Accept, Content-Type");
        res.status(204).end(); return;
      }
      next();
    });
    app.get("/health", (_req: Request, res: Response) => res.json({ok: true, service: "dalat-hen-nhau"}));
    // Creator obtains roomId + high-entropy secret; player sends secret through join options.
    app.post("/api/rooms", async (req: Request, res: Response) => {
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
// Colyseus intercepts OPTIONS before Express. Override its matchmaking CORS
// response as well as our explicit /api/rooms POST origin guard.
// Disallowed origins receive no usable Access-Control-Allow-Origin value.
matchMaker.controller.getCorsHeaders = (req) => {
  const origin = req.headers.origin;
  return {
    "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin) ? origin : "",
    "Vary": "Origin"
  };
};
// For invite-only rooms clients must not create arbitrary public rooms via matchmaking.
matchMaker.controller.exposedMethods = ["joinById", "reconnect"];
await server.listen(port);
console.log(`Đà Lạt Hẹn Nhau server ready at http://localhost:${port}`);
