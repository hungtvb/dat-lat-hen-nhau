import {Room, ServerError, type Client} from "colyseus";
import {
  MAX_PLAYERS, RECONNECT_SECONDS, SIM_TICK_MS, INPUT_TIMEOUT_MS,
  advancePlayer, normalizeGuestName, parseVariant, parseMoveInput,
  type MoveInput
} from "@dalat/shared";
import {LakesideState, PlayerState} from "./State.js";
import {tokenDigest, verifyInvite} from "../security.js";

/** Room is server-owned. Invite grants access but is not exposed as metadata. */
export class LakesideRoom extends Room<{state: LakesideState}> {
  // Before the first valid guest joins, preserve the empty invite room until the
  // existing 120-second creation timeout. An unauthorized reservation must not
  // dispose the room before its legitimate creator can enter.
  autoDispose = false;
  maxClients = MAX_PLAYERS;
  patchRate = SIM_TICK_MS;
  state = new LakesideState();
  private inviteHash!: Buffer;
  private inputs = new Map<string, {input: MoveInput; lastAt: number}>();
  private joinOrder: string[] = [];

  onCreate(options: {invite: string}) {
    if (typeof options.invite !== "string" || !options.invite) throw new Error("Invite token required to create room");
    this.inviteHash = tokenDigest(options.invite);
    this.setPrivate(true);
    // Prevent invite-only rooms from living forever if their creator never joins.
    this.clock.setTimeout(() => {if (this.joinOrder.length === 0) void this.disconnect();}, 120_000);
    this.setSimulationInterval(() => this.simulateMovement(), SIM_TICK_MS);
    this.onMessage("moveInput", (client, value) => {
      const next = parseMoveInput(value);
      if (!next || !this.state.players.has(client.sessionId)) return;
      const prior = this.inputs.get(client.sessionId);
      if (prior && next.seq <= prior.input.seq) return;
      const now = Date.now();
      if (prior && now - prior.lastAt < 20) return; // cap accepted input messages to 50/s
      // Enforce one authoritative input state per player, no client-supplied delta/position.
      this.inputs.set(client.sessionId, {input: next, lastAt: now});
    });
  }

  // A guest does not use client.auth.token/JWT; the instance auth always validates invite.
  onAuth(_client: Client, options: {invite?: unknown; name?: unknown; variant?: unknown}) {
    if (!verifyInvite(options.invite, this.inviteHash)) throw new ServerError(403, "Lời mời không hợp lệ");
    if (!normalizeGuestName(options.name) || !parseVariant(options.variant)) throw new ServerError(400, "Tên hoặc avatar không hợp lệ");
    return true;
  }

  onJoin(client: Client, options: {name: string;variant: string}) {
    // Colyseus enforces maxClients; defense in depth for manual joins.
    if (this.state.players.size >= MAX_PLAYERS) throw new ServerError(429, "Phòng đã đủ 6 người");
    const player = new PlayerState();
    player.name = normalizeGuestName(options.name)!;
    player.variant = parseVariant(options.variant)!;
    const ordinal = this.joinOrder.length;
    player.x = -2.4 + (ordinal % 3) * 2.4;
    player.z = 1 + Math.floor(ordinal / 3) * 2.4;
    this.state.players.set(client.sessionId, player);
    this.joinOrder.push(client.sessionId);
    // Once occupied, the normal Colyseus empty-room disposal policy resumes.
    this.autoDispose = true;
    if (!this.state.hostPlayerId) this.state.hostPlayerId = client.sessionId;
  }

  async onDrop(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (player) {player.connected = false; player.locomotion = "idle";}
    this.inputs.delete(client.sessionId);
    // Colyseus 0.17: reserved player identity during temporary transport loss.
    await this.allowReconnection(client, RECONNECT_SECONDS);
  }

  onReconnect(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (player) player.connected = true;
  }

  onLeave(client: Client) {
    this.inputs.delete(client.sessionId);
    this.state.players.delete(client.sessionId);
    this.joinOrder = this.joinOrder.filter(id => id !== client.sessionId);
    if (this.state.hostPlayerId === client.sessionId) {
      this.state.hostPlayerId = this.joinOrder[0] ?? "";
    }
  }

  private simulateMovement() {
    const now = Date.now();
    this.state.players.forEach((player, sessionId) => {
      const next = this.inputs.get(sessionId);
      if (!player.connected || !next || now - next.lastAt > INPUT_TIMEOUT_MS) {
        player.locomotion = "idle";
        return;
      }
      const previousX = player.x, previousZ = player.z;
      const {x, z} = advancePlayer(player, next.input, SIM_TICK_MS / 1000);
      player.x = x; player.z = z;
      player.heading = next.input.heading;
      player.locomotion = Math.hypot(previousX - x, previousZ - z) > 1e-5 ? "walk" : "idle";
    });
  }
}
