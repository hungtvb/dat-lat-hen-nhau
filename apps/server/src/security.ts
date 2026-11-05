import {randomBytes, createHash, timingSafeEqual} from "node:crypto";
import {isInviteToken} from "@dalat/shared";

/** Raw invite tokens are never logged or stored on disk. */
export function newInviteToken(): string {return randomBytes(24).toString("base64url");}
export function tokenDigest(token: string): Buffer {return createHash("sha256").update(token).digest();}
export function verifyInvite(candidate: unknown, expectedDigest: Buffer): boolean {
  if (!isInviteToken(candidate)) return false;
  const digest = tokenDigest(candidate);
  return digest.length === expectedDigest.length && timingSafeEqual(digest, expectedDigest);
}
