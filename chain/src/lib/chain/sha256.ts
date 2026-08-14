import { AchievementSeed } from "./types";

/** Genesis previous hash — a zero hash. */
export const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const DIFFICULTY = "0000";

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function blockPayloadBase(block: AchievementSeed, prevHash: string): string {
  return `${block.number}|${block.date}|${block.title}|${block.content ?? ""}|${prevHash}|`;
}

export function blockPayload(block: AchievementSeed & { nonce: number }, prevHash: string): string {
  return `${blockPayloadBase(block, prevHash)}${block.nonce}`;
}

export async function hashBlock(block: AchievementSeed & { nonce: number }, prevHash: string): Promise<string> {
  return sha256Hex(blockPayload(block, prevHash));
}

export function formatHash(hash: string): string {
  const prefixed = hash.startsWith("0x") ? hash : `0x${hash}`;
  if (prefixed.length <= 18) return prefixed;
  return `${prefixed.slice(0, 16)}…${prefixed.slice(-8)}`;
}

export function meetsDifficulty(hash: string, difficulty = DIFFICULTY): boolean {
  const body = hash.startsWith("0x") ? hash.slice(2) : hash;
  return body.startsWith(difficulty);
}
