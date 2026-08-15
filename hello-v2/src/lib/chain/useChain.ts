import { useCallback, useEffect, useRef, useState } from "react";
import { ACHIEVEMENTS, initialNonceFor } from "./data";
import { DIFFICULTY, ZERO_HASH, blockPayloadBase, hashBlock, meetsDifficulty, sha256Hex } from "./sha256";
import { Block, UseChainOptions } from "./types";

const STORAGE_KEY = "llev_chain_v1";
const BATCH_SIZE = 1200;

export async function buildInitialBlocks(): Promise<Block[]> {
  const blocks: Block[] = [];
  for (const seed of ACHIEVEMENTS) {
    const prevHash = blocks.length === 0 ? ZERO_HASH : blocks[blocks.length - 1].hash;
    const nonce = initialNonceFor(seed);
    const hash = await hashBlock({ ...seed, nonce }, prevHash);
    blocks.push({
      ...seed,
      hash,
      nonce,
      prevHash,
      mined: meetsDifficulty(hash),
      mining: false,
    });
  }
  return blocks;
}

export function prevHashOf(blocks: Block[], index: number): string {
  return index === 0 ? ZERO_HASH : blocks[index - 1].hash;
}

async function recomputeFrom(blocks: Block[], fromIndex: number): Promise<Block[]> {
  const next = blocks.map((b) => ({ ...b }));
  for (let i = fromIndex; i < next.length; i++) {
    const prevHash = prevHashOf(next, i);
    const hash = await hashBlock(next[i], prevHash);
    next[i] = {
      ...next[i],
      prevHash,
      hash,
      mined: meetsDifficulty(hash),
    };
  }
  return next;
}

export function isBlockValid(blocks: Block[], i: number): boolean {
  const b = blocks[i];
  if (!b.mined || b.mining) return false;
  return b.prevHash === prevHashOf(blocks, i) && meetsDifficulty(b.hash);
}

export function useChain(options: UseChainOptions = {}) {
  const { persist = false, scalingDifficulty = false } = options;
  const [blocks, setBlocks] = useState<Block[]>([]);
  const blocksRef = useRef(blocks);
  const miningRef = useRef<Set<number>>(new Set());
  blocksRef.current = blocks;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let initial = await buildInitialBlocks();
      if (persist) {
        try {
          const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
          if (Array.isArray(saved) && saved.length === initial.length) {
            initial = initial.map((b, i) => ({ ...b, ...saved[i] }));
          }
        } catch {}
      }
      if (!cancelled) {
        setBlocks(initial);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (blocks.length > 0 && !blocks[0].mined && !miningRef.current.has(0)) {
      mineBlock(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks.length]);

  const persistState = useCallback(
    (next: Block[]) => {
      if (!persist) return;
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(next.map((b) => ({ hash: b.hash, nonce: b.nonce, mined: b.mined, prevHash: b.prevHash })))
        );
      } catch {}
    },
    [persist]
  );

  const mineBlock = useCallback(
    async (index: number) => {
      if (miningRef.current.has(index)) return;
      miningRef.current.add(index);
      setBlocks((cur) => cur.map((b, i) => (i === index ? { ...b, mining: true } : b)));

      const current = blocksRef.current;
      const block = current[index];
      if (!block) {
        miningRef.current.delete(index);
        return;
      }
      const prevHash = prevHashOf(current, index);
      const difficulty = scalingDifficulty ? "0".repeat(4 + Math.floor(index / 3)) : DIFFICULTY;
      const payloadBase = blockPayloadBase(block, prevHash);

      let nonce = 0;
      let lastHex = block.hash;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (!miningRef.current.has(index)) {
          setBlocks((cur) => cur.map((b, i) => (i === index ? { ...b, mining: false } : b)));
          return;
        }
        let found: { hex: string; nonce: number } | null = null;
        for (let n = 0; n < BATCH_SIZE; n++) {
          const hex = await sha256Hex(payloadBase + nonce);
          lastHex = hex;
          if (meetsDifficulty(hex, difficulty)) {
            found = { hex, nonce };
            break;
          }
          nonce++;
        }
        if (found) {
          const patched = blocksRef.current.map((b, i) =>
            i === index
              ? { ...b, mining: false, mined: true, hash: found!.hex, nonce: found!.nonce, prevHash }
              : b
          );
          const next = await recomputeFrom(patched, index + 1);
          persistState(next);
          setBlocks(next);
          miningRef.current.delete(index);
          return;
        }
        setBlocks((cur) => cur.map((b, i) => (i === index ? { ...b, hash: lastHex, nonce, prevHash } : b)));
        await new Promise((r) => requestAnimationFrame(r));
      }
    },
    [scalingDifficulty, persistState]
  );

  const resetBlock = useCallback(
    async (index: number) => {
      miningRef.current.delete(index);
      const current = blocksRef.current;
      const block = current[index];
      if (!block) return;
      const prevHash = prevHashOf(current, index);
      const nonce = 0;
      const hash = await hashBlock({ ...block, nonce }, prevHash);
      const patched = current.map((b, i) =>
        i === index ? { ...b, mining: false, mined: false, hash, nonce, prevHash } : b
      );
      const next = await recomputeFrom(patched, index + 1);
      persistState(next);
      setBlocks(next);
    },
    [persistState]
  );

  return {
    blocks,
    mineBlock,
    resetBlock,
    isValid: (i: number) => isBlockValid(blocks, i),
  };
}
