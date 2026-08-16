"use client";

import type { ReactNode } from "react";
import { Block } from "@/lib/chain/types";
import { formatHash } from "@/lib/chain/sha256";
import BorderGlow from "@/components/react-bits/BorderGlow";
import Counter from "@/components/react-bits/Counter";
import GradientStripe from "@/components/react-bits/GradientStripe";

function formatBlockNumber(number: number): string {
  return number.toString().padStart(2, "0");
}

export interface BlockCardProps {
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
    <div className="flex min-w-0 items-center gap-2.5 text-xs leading-[1.45]">
      <span className="w-[52px] shrink-0 text-cream/40">{label}</span>
      <span
        className={`min-w-0 text-cream/90 ${
          plain ? "overflow-visible" : "overflow-hidden text-ellipsis whitespace-nowrap"
        } ${warn ? "text-warn" : ""}`}
      >
        {children}
      </span>
    </div>
  );
}

const mineButtonClass =
  "min-w-[128px] appearance-none cursor-pointer rounded-full border border-cream/15 bg-cream/[0.03] px-7 py-2.5 text-xs lowercase tracking-[0.18em] text-cream/70 transition-[color,border-color,background-color,transform] duration-200 hover:enabled:border-grape hover:enabled:bg-grape/15 hover:enabled:text-cream active:enabled:scale-[0.97] disabled:cursor-default disabled:animate-mine-pulse disabled:border-grape/45 disabled:text-grape";

const INVALID_STRIPE_PATTERN =
  "repeating-linear-gradient(0deg, rgba(244,240,234,0.15) 0px, rgba(244,240,234,0.15) 4px, transparent 4px, transparent 8px)";

const stripeClass = "w-1 shrink-0";

function StatusBadge({ valid }: { valid: boolean }) {
  if (!valid) {
    return <span className="text-[9px] uppercase tracking-[0.16em] text-cream/30">invalid</span>;
  }
  return (
    <span className="rounded-full bg-grape/20 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-grape">
      verified
    </span>
  );
}

export function BlockCard({ block, valid, prevIsValid, onMine, onReset }: BlockCardProps) {
  return (
    <BorderGlow
      className="w-full pointer-events-auto [&_.border-glow-inner]:overflow-visible"
      backgroundColor="#120F17"
      borderRadius={20}
      glowColor="268 90 76"
      colors={["#8c70fa", "#c084fc", "#38bdf8"]}
      glowRadius={28}
      fillOpacity={0.35}
    >
      <div className="flex overflow-hidden rounded-[19px]">
        {valid ? (
          <GradientStripe
            className={stripeClass}
            colors={["#8c70fa", "#38bdf8", "#c084fc"]}
            direction="vertical"
            animationSpeed={4}
          />
        ) : (
          <div className={stripeClass} style={{ backgroundImage: INVALID_STRIPE_PATTERN }} />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-2.5 px-[22px] pb-4 pt-[22px]">
          <div className="flex justify-end">
            <StatusBadge valid={valid} />
          </div>

          <div className="flex items-baseline justify-between gap-4">
            <h2 className="m-0 text-base font-medium tracking-[0.04em]">{block.title}</h2>
            <span className="shrink-0 text-xs tracking-[0.14em] text-cream/45">
              block#{formatBlockNumber(block.number)}
            </span>
          </div>

          <Row label="date:">{block.date}</Row>
          <Row label="prev:" warn={!prevIsValid}>
            {formatHash(block.prevHash)}
          </Row>
          <Row label="hash:" warn={!valid}>
            {formatHash(block.hash)}
          </Row>
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

          {block.content && (
            <p className="my-2 mb-0.5 text-[13px] leading-[1.55] text-cream/80">{block.content}</p>
          )}

          <div className="my-2 mb-0.5 h-px bg-cream/15" />

          <div className="flex justify-center">
            {block.mined && valid ? (
              <button type="button" className={mineButtonClass} onClick={onReset}>
                reset
              </button>
            ) : (
              <button type="button" className={mineButtonClass} onClick={onMine} disabled={block.mining}>
                {block.mining ? "mining…" : "mine"}
              </button>
            )}
          </div>
        </div>
      </div>
    </BorderGlow>
  );
}
