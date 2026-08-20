"use client";

import { useCallback, useState } from "react";
import BorderGlow from "@/components/react-bits/BorderGlow";
import FallingText from "@/components/react-bits/FallingText";
import { STACK_ITEMS, stackIconUrl, type StackItem } from "@/lib/stack/items";

function Badge({ item }: { item: StackItem }) {
  return (
    <span
      className="word relative z-[2] !inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-sm font-medium tracking-wide"
      style={{ background: item.bg, color: item.fg }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={stackIconUrl(item)}
        alt=""
        width={16}
        height={16}
        className="pointer-events-none h-4 w-4 shrink-0"
      />
      {item.label}
    </span>
  );
}

export function FallingStack() {
  const [started, setStarted] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const onStart = useCallback(() => setStarted(true), []);

  const refresh = useCallback(() => {
    setStarted(false);
    setResetKey((key) => key + 1);
  }, []);

  return (
    <div className="w-full max-w-[420px] drop-shadow-[0_28px_70px_rgba(0,0,0,0.72)]">
      <BorderGlow
        className="w-full pointer-events-auto [&_.border-glow-inner]:overflow-hidden"
        backgroundColor="#120F17"
        borderRadius={20}
        glowColor="268 90 76"
        colors={["#8c70fa", "#c084fc", "#38bdf8"]}
        glowRadius={28}
        fillOpacity={0.5}
      >
        <div className="relative h-[min(70dvh,520px)] w-full">
          <button
            type="button"
            aria-label="Refresh"
            onClick={refresh}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-cream/15 bg-cream/[0.06] text-cream/70 transition hover:border-grape hover:bg-grape/15 hover:text-cream active:scale-95"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 1 12.7-5.4M19.5 12a7.5 7.5 0 0 1-12.7 5.4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.2 4.8v3.2h-3.2M7.8 19.2v-3.2h3.2" />
            </svg>
          </button>

          <p
            className={`pointer-events-none absolute inset-x-0 bottom-8 z-0 flex justify-center font-display text-[clamp(18px,5vw,28px)] tracking-[0.28em] text-cream/25 transition-opacity duration-500 ${
              started ? "opacity-0" : "opacity-100"
            }`}
          >
            click me
          </p>

          <FallingText
            key={resetKey}
            trigger="click"
            gravity={0.5}
            backgroundColor="transparent"
            onStart={onStart}
            className="h-full !p-0 [&_.falling-text-target]:!flex [&_.falling-text-target]:h-full [&_.falling-text-target]:w-full [&_.falling-text-target]:flex-wrap [&_.falling-text-target]:content-start [&_.falling-text-target]:items-start [&_.falling-text-target]:justify-center [&_.falling-text-target]:gap-3 [&_.falling-text-target]:p-8 [&_.falling-text-target]:pt-16"
          >
            {STACK_ITEMS.map((item) => (
              <Badge key={item.id} item={item} />
            ))}
          </FallingText>
        </div>
      </BorderGlow>
    </div>
  );
}
