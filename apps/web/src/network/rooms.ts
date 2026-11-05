import { Client, Callbacks, type Room } from "@colyseus/sdk";
import {isInviteToken, isRoomCode, type AvatarVariant} from "@dalat/shared";

const DEFAULT_ORIGIN = `${location.protocol}//${location.hostname}:${location.port === '5173' ? '2567' : location.port}`;
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || DEFAULT_ORIGIN;
export type Guest = {name: string; variant: AvatarVariant};
export type Invite = {roomId: string; invite: string};
export type SyncedPlayer = {name: string;variant: string;x: number;z: number;heading: number;connected: boolean;locomotion: string};

export function inviteFromHash(): Invite | null {
  const q = new URLSearchParams(location.hash.replace(/^#/, ""));
  const roomId = q.get("room"), invite = q.get("invite");
  return isRoomCode(roomId) && isInviteToken(invite) ? {roomId, invite} : null;
}

export function inviteUrl(input: Invite): string {
  const u = new URL(location.href); u.hash = new URLSearchParams({room: input.roomId, invite: input.invite}).toString();
  return u.toString();
}

export async function createRoom(): Promise<Invite> {
  const result = await fetch(new URL("/api/rooms", API_ORIGIN), {method:"POST",headers:{Accept:"application/json"}});
  const value: unknown = await result.json();
  const data = value as Record<string, unknown>;
  if (!result.ok) throw new Error(typeof data.error === 'string' ? data.error : `HTTP ${result.status}`);
  if (!isRoomCode(data.roomId) || !isInviteToken(data.invite)) throw new Error("Máy chủ trả về mã phòng không hợp lệ");
  return {roomId:data.roomId, invite:data.invite};
}

export async function joinRoom(invite: Invite, guest: Guest): Promise<Room> {
  const client = new Client(API_ORIGIN);
  return client.joinById(invite.roomId, {invite: invite.invite, name:guest.name, variant: guest.variant});
}

export function listenPlayers(room: Room, onAdd: (id:string, player:SyncedPlayer)=>void, onChange: (id:string, player:SyncedPlayer)=>void, onRemove:(id:string)=>void): () => void {
  const cb = Callbacks.get(room);
  const detach: Array<() => void> = [];
  // Without a typed room schema, the Colyseus SDK exposes map values as unknown.
  // Narrow the session key and cast only the server-owned player schema at the boundary.
  detach.push(cb.onAdd("players", (value, key) => {
    if (typeof key !== "string") return;
    const player = value as SyncedPlayer;
    onAdd(key, player);
    for (const field of ["x", "z", "heading", "name", "variant", "connected", "locomotion"]) {
      detach.push(cb.listen(player, field as keyof SyncedPlayer, () => onChange(key, player)));
    }
  }));
  detach.push(cb.onRemove("players", (_value, key) => {
    if (typeof key === "string") onRemove(key);
  }));
  return () => detach.forEach(fn => fn());
}
