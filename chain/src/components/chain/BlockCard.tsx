"use client";

import { Block } from "@/lib/chain/types";
import { seedHashLike, truncHash } from "@/lib/chain/sha256";
import ClickSpark from "@/components/react-bits/ClickSpark";
import ElectricBorder from "@/components/react-bits/ElectricBorder";
import StarBorder from "@/components/react-bits/StarBorder";
import { GlitchPeek } from "./GlitchPeek";
import BorderGlow from "@/components/react-bits/BorderGlow";

interface Props {
  block: Block;
  prevHash: string | null;
  isGenesis: boolean;
  valid: boolean;
  justMined: boolean;
  broken: boolean; // rippling / just invalidated by an upstream re-mine
  decryptGated: boolean;
  onMine: () => void;
  onDecrypt: () => void;
}

export function BlockCard({ block, prevHash, isGenesis, valid, justMined, broken, decryptGated, onMine }: Props) {
  const placeholderHash = truncHash(seedHashLike(block.number + block.title));
  const displayHash = block.mining ? truncHash(block.currentTry) || placeholderHash : block.mined ? truncHash(block.hash) : placeholderHash;
  const prevPlaceholder = prevHash ? truncHash(seedHashLike(prevHash)) : null;
  const prevDisplay = block.mined ? truncHash(block.prevHashUsed) : prevPlaceholder;
  const prevMismatch = !isGenesis && block.mined && block.prevHashUsed !== prevHash;

  const card = (
    <div
      style={{
        border: `1px solid ${prevMismatch ? "#d97757" : valid ? "#d8d8d4" : "#ececea"}`,
        borderRadius: 20,
        padding: "24px 22px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 4,
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        animation: broken ? "breakFlash 0.5s ease" : justMined ? "rainbowGlow 1.4s linear" : undefined,
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontFamily: "'Major Mono Display', monospace", fontSize: 15, color: "#333", letterSpacing: 1 }}>#{block.number}</span>
          <span style={{ fontSize: 11, color: "#999" }}>{block.date}</span>
        </div>
        <div style={{ fontSize: 16, color: "#111", marginBottom: 14 }}>{block.title}</div>
        <div style={{ display: "flex", gap: 8, fontSize: 12, marginBottom: 6 }}>
          <span style={{ color: "#a3a3a3", minWidth: 38 }}>hash</span>
          <span style={{ color: "#3d3d3d", wordBreak: "break-all" }}>{displayHash}</span>
        </div>
        {!isGenesis && (
          <>
            <div style={{ display: "flex", gap: 8, fontSize: 12, marginBottom: 14 }}>
              <span style={{ color: "#a3a3a3", minWidth: 38 }}>prev</span>
              <span style={{ color: prevMismatch ? "#d97757" : "#5f5f5f", wordBreak: "break-all" }}>{prevDisplay}</span>
            </div>
            <div
              style={{
                position: "relative",
                marginBottom: 14,
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #ececea",
                opacity: decryptGated && !block.mined ? 0.5 : 1,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: 12,
                  zIndex: 2,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.45)",
                  pointerEvents: "none",
                  letterSpacing: 0.4,
                }}
              >
                {decryptGated && !block.mined ? "[ mine this block to inspect ]" : "[ hover to inspect ]"}
              </div>
              <GlitchPeek text={block.content || ""} locked={decryptGated && !block.mined} />
            </div>
          </>
        )}
      </div>

      {!isGenesis && (!block.mined || !valid) && (
        <ClickSpark sparkColor="#4a8cff" sparkSize={10} sparkRadius={18} sparkCount={8} duration={400}>
          <button
            onClick={onMine}
            disabled={block.mining}
            style={{
              marginTop: 4,
              padding: "10px 18px",
              fontSize: 11,
              letterSpacing: 1,
              borderRadius: 10,
              border: "1px solid transparent",
              cursor: block.mining ? "default" : "pointer",
              minHeight: 40,
              background: block.mining ? "#f5f5f3" : "#111",
              color: block.mining ? "#a3a3a3" : "#fff",
              boxShadow: block.mining ? "none" : "0 0 0 1px rgba(64,140,255,0.4), 0 0 12px rgba(64,140,255,0.35), 0 0 26px rgba(160,100,255,0.22)",
            }}
          >
            {block.mining ? "MINING…" : !block.mined ? "MINE BLOCK" : "RE-MINE BLOCK"}
          </button>
        </ClickSpark>
      )}
      {!isGenesis && block.mined && valid && (
        <div style={{ marginTop: 4, display: "inline-block", padding: "8px 16px", borderRadius: 10, fontSize: 11, letterSpacing: 1, border: "1px solid #d8d8d4", background: "#fafafa", color: "#3d3d3d" }}>
          ✓ VALID
        </div>
      )}
      {isGenesis && (
        <div style={{ marginTop: 4, display: "inline-block", padding: "8px 16px", borderRadius: 10, fontSize: 11, letterSpacing: 1, border: "1px solid #d8d8d4", background: "#fafafa", color: "#3d3d3d" }}>
          ⛓ GENESIS
        </div>
      )}
    </div>
  );

  // wrap valid blocks in the animated ElectricBorder; everything else stays a plain card
  return valid ? (
    // <ElectricBorder color="#111111" speed={0.3} chaos={0.1} borderRadius={20}>

    // </ElectricBorder> 

    // <BorderGlow>
      card
    // </BorderGlow>
  ) : (
    card
  );
}
