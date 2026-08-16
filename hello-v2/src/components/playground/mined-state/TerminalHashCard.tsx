"use client";

import { useState } from "react";
import { FakeBlockRows, TOGGLE_BUTTON_CLASS } from "./shared";

export function TerminalHashCard() {
  const [mined, setMined] = useState(false);

  return (
    <div className="w-full max-w-[280px] rounded-2xl border border-cream/10 bg-[#120F17] px-5 py-5">
      <div className="mb-1 flex items-center justify-end gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${mined ? "bg-grape" : "animate-mine-pulse bg-cream/25"}`} />
        <span className={`text-[9px] uppercase tracking-[0.2em] ${mined ? "text-grape" : "text-cream/30"}`}>
          {mined ? "verified" : "mining"}
        </span>
      </div>
      <FakeBlockRows
        mined={mined}
        hashNode={
          mined ? (
            <span className="truncate font-medium text-cream drop-shadow-[0_0_6px_rgba(140,112,250,0.6)]">
              0x0000a4f…c19b
            </span>
          ) : (
            <span className="animate-mine-pulse truncate tracking-widest text-cream/25">░░░░░░░░…░░░░</span>
          )
        }
      />
      <button type="button" className={TOGGLE_BUTTON_CLASS} onClick={() => setMined((m) => !m)}>
        {mined ? "reset" : "mine"}
      </button>
    </div>
  );
}
