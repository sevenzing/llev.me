"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import BorderGlow from "@/components/react-bits/BorderGlow";
import { getRewardContent } from "@/lib/reward/data";
import { PickaxeAnimation } from "./PickaxeAnimation";
import { RewardContent } from "./RewardContent";

interface AllBlocksMinedModalProps {
  open: boolean;
  nonceSum: number;
  onClose: () => void;
}

/** Easter-egg modal shown once every block in the chain has been mined. */
export function AllBlocksMinedModal({ open, nonceSum, onClose }: AllBlocksMinedModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex animate-modal-fade-in items-center justify-center bg-ink/80 p-6 opacity-0 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-[380px] animate-modal-pop-in opacity-0" onClick={(e) => e.stopPropagation()}>
        <BorderGlow
          className="w-full [&_.border-glow-inner]:overflow-visible"
          backgroundColor="#120F17"
          borderRadius={22}
          glowColor="268 90 76"
          colors={["#8c70fa", "#c084fc", "#38bdf8"]}
          glowRadius={32}
          fillOpacity={0.4}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Reward"
            className="relative flex flex-col items-center px-7 pb-8 pt-5"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-cream/15 bg-cream/[0.04] text-cream/60 transition-colors duration-200 hover:border-grape hover:bg-grape/15 hover:text-cream"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <PickaxeAnimation className="mt-3 h-64 w-64" />

            <RewardContent
              text={getRewardContent(nonceSum)}
              className="mt-6 text-center text-sm leading-[1.65] text-cream/85"
            />
          </div>
        </BorderGlow>
      </div>
    </div>,
    document.body
  );
}
