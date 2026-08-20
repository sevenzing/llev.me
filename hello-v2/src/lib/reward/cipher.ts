/**
 * Tiny, dependency-free, deterministic cipher used to keep the "all blocks
 * mined" reward message out of the repo as plaintext. It is NOT
 * cryptographically secure — it's just enough obfuscation that the message
 * can't be read by grepping the source, only by actually deriving the right
 * key (the sum of every mined block's nonce) at runtime.
 *
 * Works in both the browser (btoa/atob) and Node (Buffer), so the same
 * module can be shared by the app and the `encode-reward` CLI script.
 */

/** Mulberry32 PRNG — small, seedable, good enough for a keystream. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function keystream(key: number, length: number): Uint8Array {
  const rand = mulberry32(key);
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(rand() * 256);
  }
  return bytes;
}

function xor(data: Uint8Array, key: number): Uint8Array {
  const stream = keystream(key, data.length);
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) out[i] = data[i] ^ stream[i];
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof btoa === "function") {
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  }
  return Buffer.from(bytes).toString("base64");
}

function base64ToBytes(b64: string): Uint8Array {
  if (typeof atob === "function") {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  return new Uint8Array(Buffer.from(b64, "base64"));
}

/** Encode plaintext into an obfuscated, base64 blob keyed by `key`. */
export function encodeReward(key: number, content: string): string {
  const data = new TextEncoder().encode(content);
  return bytesToBase64(xor(data, key));
}

/** Decode a blob produced by `encodeReward`, given the matching `key`. */
export function decodeReward(key: number, encoded: string): string {
  const data = base64ToBytes(encoded);
  return new TextDecoder().decode(xor(data, key));
}
