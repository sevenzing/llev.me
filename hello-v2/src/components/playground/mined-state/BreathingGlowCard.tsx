"use client";

import { useState } from "react";
import { FakeBlockRows, TOGGLE_BUTTON_CLASS } from "./shared";

export function BreathingGlowCard() {
  const [mined, setMined] = useState(false);

  return (
    <div className="relative w-full max-w-[280px]">
      <div
        className={`pointer-events-none absolute -inset-3 rounded-[28px] bg-grape/35 blur-xl transition-opacity duration-500 ${
          mined ? "animate-mine-pulse opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`relative rounded-2xl border px-5 py-5 transition-colors duration-500 ${
          mined ? "border-grape/40 bg-[#150f1f]" : "border-cream/10 bg-[#120F17]"
        }`}
      >
        <FakeBlockRows mined={mined} />
        <button type="button" className={TOGGLE_BUTTON_CLASS} onClick={() => setMined((m) => !m)}>
          {mined ? "reset" : "mine"}
        </button>
      </div>
    </div>
  );
}
