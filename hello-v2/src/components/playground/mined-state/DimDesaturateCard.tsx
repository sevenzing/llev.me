"use client";

import { useState } from "react";
import { FakeBlockRows, TOGGLE_BUTTON_CLASS } from "./shared";

export function DimDesaturateCard() {
  const [mined, setMined] = useState(false);

  return (
    <div
      className={`w-full max-w-[280px] rounded-2xl border px-5 py-5 transition-all duration-500 ${
        mined
          ? "border-grape/40 bg-[#150f1f] opacity-100 saturate-100"
          : "border-dashed border-cream/10 bg-[#0d0b12] opacity-60 saturate-[0.35]"
      }`}
    >
      <div className="mb-1 flex justify-end">
        <span className={`text-[9px] uppercase tracking-[0.22em] ${mined ? "text-grape" : "text-cream/30"}`}>
          {mined ? "verified" : "pending"}
        </span>
      </div>
      <FakeBlockRows mined={mined} />
      <button type="button" className={TOGGLE_BUTTON_CLASS} onClick={() => setMined((m) => !m)}>
        {mined ? "reset" : "mine"}
      </button>
    </div>
  );
}
