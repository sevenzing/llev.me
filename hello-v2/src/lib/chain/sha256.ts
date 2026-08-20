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

export interface MineNonceOptions {
  /** How many hashes to try before yielding via `onBatch`. Defaults to unlimited (no batching). */
  batchSize?: number;
  /** Checked before each batch; return true to abort and resolve with `null`. */
  isCancelled?: () => boolean;
  /** Called after each batch with progress so far. Awaited, so it can also yield control (e.g. rAF). */
  onBatch?: (nonce: number, lastHash: string) => void | Promise<void>;
}

/**
 * The single source of truth for proof-of-work: finds the smallest nonce
 * >= 0 such that `sha256Hex(payloadBase + nonce)` meets `difficulty`.
 * Used both for live mining in the UI (batched, cancellable, progress via
 * `onBatch`) and for headless/CLI mining (called with no options, runs to
 * completion in one go).
 */
export async function mineNonce(
  payloadBase: string,
  difficulty: string = DIFFICULTY,
  options: MineNonceOptions = {}
): Promise<{ nonce: number; hash: string } | null> {
  const { batchSize = Infinity, isCancelled, onBatch } = options;
  let nonce = 0;
  let lastHash = "";
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (isCancelled?.()) return null;
    for (let n = 0; n < batchSize; n++) {
      const hash = await sha256Hex(payloadBase + nonce);
      lastHash = hash;
      if (meetsDifficulty(hash, difficulty)) return { nonce, hash };
      nonce++;
    }
    if (onBatch) await onBatch(nonce, lastHash);
  }
}
