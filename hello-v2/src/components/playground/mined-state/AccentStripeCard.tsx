"use client";

import { useState } from "react";
import { FakeBlockRows, TOGGLE_BUTTON_CLASS } from "./shared";

export function AccentStripeCard() {
  const [mined, setMined] = useState(false);

  return (
    <div className="flex w-full max-w-[280px] overflow-hidden rounded-2xl border border-cream/10 bg-[#120F17]">
      <div
        className={`w-1 shrink-0 transition-colors duration-500 ${mined ? "bg-gradient-to-b from-grape to-sky-400" : ""}`}
        style={
          !mined
            ? {
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(244,240,234,0.15) 0px, rgba(244,240,234,0.15) 4px, transparent 4px, transparent 8px)",
              }
            : undefined
        }
      />
      <div className="flex-1 px-5 py-5">
        <div className="mb-1 flex justify-end">
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] ${
              mined ? "bg-grape/20 text-grape" : "text-cream/30"
            }`}
          >
            {mined ? "verified" : "pending"}
          </span>
        </div>
        <FakeBlockRows mined={mined} />
        <button type="button" className={TOGGLE_BUTTON_CLASS} onClick={() => setMined((m) => !m)}>
          {mined ? "reset" : "mine"}
        </button>
      </div>
    </div>
  );
}
