/** Stable game contract — no networking/runtime dependencies. */
export const ROOM_TYPE = "dalat_lakeside";
export const MAX_PLAYERS = 6;
export const WALK_SPEED_MPS = 2.2;
export const SIM_TICK_MS = 50;
export const RECONNECT_SECONDS = 45;
export const INPUT_TIMEOUT_MS = 240;
export const SPAWN_LIMIT_METRES = 22;
export const VARIANTS = ["berry", "forest", "sand", "sky"] as const;
export type AvatarVariant = typeof VARIANTS[number];
export type EnvironmentPreset = "morning-mist" | "clear-afternoon" | "purple-dusk";
export type Locomotion = "idle" | "walk";
export type MoveInput = { seq: number; forward: number; strafe: number; heading: number };
export type PositionXZ = { x: number; z: number };
export type WalkableBounds = { minX: number; maxX: number; minZ: number; maxZ: number };
export const SPIKE_BOUNDS: WalkableBounds = { minX: -SPAWN_LIMIT_METRES, maxX: SPAWN_LIMIT_METRES, minZ: -SPAWN_LIMIT_METRES, maxZ: SPAWN_LIMIT_METRES };

export function normalizeGuestName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.normalize("NFC").trim().replace(/\s+/gu, " ");
  if ([...name].length < 2 || [...name].length > 24) return null;
  if (/[\p{Cc}\p{Cf}<>]/u.test(name)) return null;
  return name;
}

export function parseVariant(value: unknown): AvatarVariant | null {
  return typeof value === "string" && (VARIANTS as readonly string[]).includes(value) ? value as AvatarVariant : null;
}

export function parseMoveInput(value: unknown): MoveInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const obj = value as Record<string, unknown>;
  const {seq, forward, strafe, heading} = obj;
  if (typeof seq !== "number" || !Number.isSafeInteger(seq) || seq < 0) return null;
  for (const number of [forward, strafe, heading]) {
    if (typeof number !== "number" || !Number.isFinite(number)) return null;
  }
  if (Math.abs(forward as number) > 1 || Math.abs(strafe as number) > 1 || Math.abs(heading as number) > Math.PI) return null;
  return {seq, forward: forward as number, strafe: strafe as number, heading: heading as number};
}

export function advancePlayer(position: PositionXZ, input: MoveInput | null, deltaSeconds: number, bounds: WalkableBounds = SPIKE_BOUNDS): PositionXZ {
  if (!input || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return {...position};
  const safeDt = Math.min(deltaSeconds, SIM_TICK_MS / 1000);
  const xAxis = input.strafe;
  const zAxis = input.forward;
  const len = Math.hypot(xAxis, zAxis);
  if (len < 1e-5) return {...position};
  const speed = WALK_SPEED_MPS * safeDt / Math.max(1, len);
  const dx = xAxis * Math.cos(input.heading) + zAxis * Math.sin(input.heading);
  const dz = -zAxis * Math.cos(input.heading) + xAxis * Math.sin(input.heading);
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, position.x + dx * speed)),
    z: Math.max(bounds.minZ, Math.min(bounds.maxZ, position.z + dz * speed))
  };
}

export function isRoomCode(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{6,64}$/.test(value);
}

export function isInviteToken(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{32,64}$/.test(value);
}
