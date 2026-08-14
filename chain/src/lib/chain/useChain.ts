import { useCallback, useEffect, useRef, useState } from "react";
import { ACHIEVEMENTS } from "./data";
import { sha256Hex } from "./sha256";
import { Block, UseChainOptions } from "./types";

const STORAGE_KEY = "llev_chain_v1";
const BATCH_SIZE = 1200;

function buildInitialBlocks(): Block[] {
  return ACHIEVEMENTS.map((a) => ({
    ...a,
    hash: null,
    nonce: null,
    mined: false,
    mining: false,
    currentTry: "",
    prevHashUsed: null,
    decrypted: false,
  }));
}

export function isBlockValid(blocks: Block[], i: number): boolean {
  const b = blocks[i];
  if (!b.mined) return false;
  if (i === 0) return true;
  return b.prevHashUsed === blocks[i - 1].hash;
}

export function useChain(options: UseChainOptions = {}) {
  const { persist = false, decryptGated = true, scalingDifficulty = false } = options;
  const [blocks, setBlocks] = useState<Block[]>(buildInitialBlocks);
  const [healing, setHealing] = useState(false);
  const [justMinedIndex, setJustMinedIndex] = useState<number | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const miningRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!persist) return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (Array.isArray(saved) && saved.length === ACHIEVEMENTS.length) {
        setBlocks((cur) => cur.map((b, i) => ({ ...b, ...saved[i] })));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // genesis auto-mines once on mount (it's pre-mined conceptually, but we still
    // run it through the real hash function so the displayed hash is genuine)
    setBlocks((cur) => {
      if (cur[0].mined) return cur;
      return cur;
    });
    if (!blocks[0].mined && !miningRef.current.has(0)) {
      mineBlock(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistState = useCallback(
    (next: Block[]) => {
      if (!persist) return;
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(next.map((b) => ({ hash: b.hash, nonce: b.nonce, mined: b.mined, prevHashUsed: b.prevHashUsed, decrypted: b.decrypted })))
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

      setBlocks((snapshotSetter) => snapshotSetter); // no-op to keep hook shape stable
      const current = await new Promise<Block[]>((resolve) => setBlocks((s) => (resolve(s), s)));
      const block = current[index];
      const prevHash = index === 0 ? "GENESIS" : current[index - 1].hash;
      const difficulty = scalingDifficulty ? "0".repeat(4 + Math.floor(index / 3)) : "0000";
      const payloadBase = `${block.number}|${block.date}|${block.title}|${block.content || ""}|${prevHash}|`;

      let nonce = 0;
      let lastHex = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        let found: { hex: string; nonce: number } | null = null;
        for (let b = 0; b < BATCH_SIZE; b++) {
          const hex = await sha256Hex(payloadBase + nonce);
          lastHex = hex;
          if (hex.startsWith(difficulty)) {
            found = { hex, nonce };
            break;
          }
          nonce++;
        }
        if (found) {
          setBlocks((cur) => {
            const next = cur.map((b, i) =>
              i === index ? { ...b, mining: false, mined: true, hash: found!.hex, nonce: found!.nonce, prevHashUsed: prevHash, currentTry: found!.hex } : b
            );
            persistState(next);
            return next;
          });
          miningRef.current.delete(index);
          onMineSuccess(index);
          return;
        }
        setBlocks((cur) => cur.map((b, i) => (i === index ? { ...b, currentTry: lastHex } : b)));
        await new Promise((r) => requestAnimationFrame(r));
      }
    },
    [scalingDifficulty, persistState]
  );

  const onMineSuccess = useCallback((index: number) => {
    setJustMinedIndex(index);
    setTimeout(() => setJustMinedIndex((cur) => (cur === index ? null : cur)), 1800);
    setTimeout(() => {
      setBlocks((cur) => {
        if (cur.every((_, i) => isBlockValid(cur, i))) {
          setCelebrating(true);
          setTimeout(() => setCelebrating(false), 3000);
        }
        return cur;
      });
    }, 400);
  }, []);

  const healNetwork = useCallback(async () => {
    setHealing(true);
    for (let i = 1; i < ACHIEVEMENTS.length; i++) {
      const stillInvalid = await new Promise<boolean>((resolve) => setBlocks((s) => (resolve(!isBlockValid(s, i)), s)));
      if (stillInvalid) {
        await mineBlock(i);
        await new Promise((r) => setTimeout(r, 260));
      }
    }
    setHealing(false);
  }, [mineBlock]);

  const decryptBlock = useCallback(
    (index: number) => {
      setBlocks((cur) => {
        const b = cur[index];
        if (index === 0 || b.decrypted || !b.content) return cur;
        if (decryptGated && !isBlockValid(cur, index)) return cur;
        const next = cur.map((blk, i) => (i === index ? { ...blk, decrypted: true } : blk));
        persistState(next);
        return next;
      });
    },
    [decryptGated, persistState]
  );

  const validCount = blocks.reduce((n, _, i) => n + (isBlockValid(blocks, i) ? 1 : 0), 0);

  return {
    blocks,
    validCount,
    total: blocks.length,
    healing,
    celebrating,
    justMinedIndex,
    mineBlock,
    healNetwork,
    decryptBlock,
    isValid: (i: number) => isBlockValid(blocks, i),
  };
}
