"use client";

import { useChain } from "@/lib/chain/useChain";
import { BlockCard } from "./BlockCard";

export function ChainOfAchievements() {
  const { blocks, validCount, total, healing, celebrating, justMinedIndex, mineBlock, healNetwork, decryptBlock, isValid } = useChain({
    persist: false,
    decryptGated: true,
    scalingDifficulty: false,
  });

  const healthPct = Math.round((validCount / total) * 100);

  return (
    <section style={{ maxWidth: 640, margin: "0 auto", padding: "64px 20px 100px", fontFamily: "'IBM Plex Mono', monospace", color: "#1c1c1e" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: "'Major Mono Display', monospace", fontSize: "clamp(18px, 3.6vw, 26px)", color: "#111" }}>chain_of_achievements</div>
        <div style={{ color: "#7a7a7a", fontSize: 13, marginTop: 10, lineHeight: 1.7, maxWidth: 480 }}>
          the chain is broken. mine each block to repair it — or heal the whole network at once.
        </div>
      </div>

      <div style={{ border: "1px solid #e3e3e0", borderRadius: 14, padding: "16px 18px", marginBottom: 36, background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 12, letterSpacing: 1, color: "#6b6b6b" }}>
            INTEGRITY {validCount}/{total}
          </div>
          <button
            onClick={healNetwork}
            disabled={healing}
            style={{
              padding: "8px 16px",
              fontSize: 11,
              letterSpacing: 1,
              borderRadius: 10,
              border: "1px solid transparent",
              background: healing ? "#f5f5f3" : "#111",
              color: healing ? "#a3a3a3" : "#fff",
              cursor: healing ? "default" : "pointer",
            }}
          >
            {healing ? "HEALING…" : "HEAL NETWORK"}
          </button>
        </div>
        <div style={{ height: 4, background: "#eeeeec", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${healthPct}%`, background: "linear-gradient(90deg,#3d3d3d,#111)", transition: "width .4s ease" }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {blocks.map((block, i) => (
          <div key={block.number}>
            {i > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: 20 }}>
                <div
                  style={{
                    width: 0,
                    height: 22,
                    borderLeft: !isValid(i) && block.mined ? "2px dashed #d97757" : block.mined ? "2px solid #b8b8b4" : "2px dashed #e3e3e0",
                  }}
                />
              </div>
            )}
            <BlockCard
              block={block}
              prevHash={i > 0 ? blocks[i - 1].hash : null}
              isGenesis={i === 0}
              valid={isValid(i)}
              justMined={justMinedIndex === i}
              broken={block.mined && !isValid(i)}
              decryptGated={false}
              onMine={() => mineBlock(i)}
              onDecrypt={() => decryptBlock(i)}
            />
          </div>
        ))}
      </div>

      {celebrating && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 50 }}>
          <div
            style={{
              fontFamily: "'Major Mono Display', monospace",
              fontSize: "clamp(16px, 3.6vw, 26px)",
              letterSpacing: 2,
              color: "#111",
              padding: "18px 30px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "rgba(255,255,255,0.92)",
            }}
          >
            ⛓ NETWORK HEALED
          </div>
        </div>
      )}
    </section>
  );
}
