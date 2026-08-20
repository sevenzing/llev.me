"use client";

import { useState } from "react";
import { FakeBlockRows, TOGGLE_BUTTON_CLASS } from "./shared";

export function SealStampCard() {
  const [mined, setMined] = useState(false);

  return (
    <div className="relative w-full max-w-[280px] overflow-visible rounded-2xl border border-cream/10 bg-[#120F17] px-5 py-5">
      <div
        className={`absolute -right-3 -top-3 flex h-11 w-11 -rotate-[12deg] items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
          mined
            ? "scale-100 border-grape bg-grape/20 text-grape opacity-100"
            : "scale-90 border-dashed border-cream/15 text-cream/20 opacity-70"
        }`}
      >
        {mined ? "✓" : "?"}
      </div>
      <FakeBlockRows mined={mined} />
      <button type="button" className={TOGGLE_BUTTON_CLASS} onClick={() => setMined((m) => !m)}>
        {mined ? "reset" : "mine"}
      </button>
    </div>
  );
}
