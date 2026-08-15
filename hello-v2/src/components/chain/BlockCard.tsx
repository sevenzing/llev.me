"use client";

import type { ReactNode } from "react";
import { Block } from "@/lib/chain/types";
import { formatHash } from "@/lib/chain/sha256";
import BorderGlow from "@/components/react-bits/BorderGlow";
import Counter from "@/components/react-bits/Counter";

function formatBlockNumber(number: number): string {
  return number.toString().padStart(2, "0");
}

interface Props {
  block: Block;
  valid: boolean;
  prevIsValid: boolean;
  onMine: () => void;
  onReset: () => void;
}

function Row({
  label,
  children,
  warn,
  plain,
}: {
  label: string;
  children: ReactNode;
  warn?: boolean;
  plain?: boolean;
}) {
  return (
    <div className="chain-row">
      <span className="chain-row-label">{label}</span>
      <span className={`chain-row-value${warn ? " is-warn" : ""}${plain ? " is-plain" : ""}`}>{children}</span>
    </div>
  );
}

export function BlockCard({ block, valid, prevIsValid, onMine, onReset }: Props) {
  return (
    <BorderGlow
      className="chain-card"
      backgroundColor="#120F17"
      borderRadius={20}
      glowColor="268 90 76"
      colors={["#8c70fa", "#c084fc", "#38bdf8"]}
      glowRadius={28}
      fillOpacity={0.35}
    >
      <div className="chain-card-body">
        <div className="chain-card-head">
          <h2 className="chain-card-title">{block.title}</h2>
          <span className="chain-card-number">block#{formatBlockNumber(block.number)}</span>
        </div>

        <Row label="date:">{block.date}</Row>
        <Row label="prev:" warn={!prevIsValid}>{formatHash(block.prevHash)}</Row>
        <Row label="hash:" warn={!valid}>{formatHash(block.hash)}</Row>
        <Row label="nonce:" plain>
          <Counter
            value={block.nonce}
            fontSize={12}
            padding={0}
            gap={1}
            places={[100000, 10000, 1000, 100, 10, 1]}
            textColor="#f4f0ea"
            horizontalPadding={0}
            gradientFrom="transparent"
            gradientTo="transparent"
            gradientHeight={0}
            containerStyle={{ display: "inline-block", verticalAlign: "middle" }}
          />
        </Row>

        {block.content && <p className="chain-card-data">{block.content}</p>}

        <div className="chain-card-rule" />

        <div className="chain-card-action">
          {block.mined && valid ? (
            <button type="button" className="chain-btn" onClick={onReset}>
              reset
            </button>
          ) : (
            <button type="button" className="chain-btn" onClick={onMine} disabled={block.mining}>
              {block.mining ? "mining…" : "mine"}
            </button>
          )}
        </div>
      </div>
    </BorderGlow>
  );
}
