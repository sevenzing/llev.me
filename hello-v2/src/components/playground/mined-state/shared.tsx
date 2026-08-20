"use client";

import type { ReactNode } from "react";

export const TOGGLE_BUTTON_CLASS =
  "mt-4 w-full appearance-none rounded-full border border-cream/15 bg-cream/[0.03] px-5 py-2 text-xs lowercase tracking-[0.16em] text-cream/70 transition-colors duration-200 hover:border-grape hover:bg-grape/15 hover:text-cream active:scale-[0.97]";

export function FakeBlockRows({ mined, hashNode }: { mined: boolean; hashNode?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="m-0 text-sm font-medium tracking-[0.03em] text-cream">achievement</h3>
        <span className="text-[10px] tracking-[0.14em] text-cream/40">block#07</span>
      </div>
      <div className="flex items-center gap-2 text-[11px] leading-relaxed">
        <span className="w-10 shrink-0 text-cream/40">hash:</span>
        {hashNode ?? (
          <span className={`truncate transition-colors duration-300 ${mined ? "text-cream/90" : "text-cream/40"}`}>
            0x0000a4f…c19b
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-[11px] leading-relaxed">
        <span className="w-10 shrink-0 text-cream/40">nonce:</span>
        <span className="text-cream/70">129 044</span>
      </div>
    </div>
  );
}

export function DemoFrame({
  index,
  title,
  description,
  children,
}: {
  index: number;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3">
      <div>
        <h2 className="text-xs font-medium tracking-[0.1em] text-cream/80">
          {index}. {title}
        </h2>
        <p className="mt-1 max-w-[280px] text-[11px] leading-relaxed text-cream/45">{description}</p>
      </div>
      {children}
    </div>
  );
}
