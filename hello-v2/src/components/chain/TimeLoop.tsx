"use client";

import TextLoop from "@/components/react-bits/TextLoop";

export function TimeLoop() {
  return (
    <aside className="time-loop" aria-hidden>
      <TextLoop
        text="time"
        separator="✦"
        shape="wave"
        orientation="vertical"
        direction="forward"
        speed={56}
        curviness={40}
        fontSize={22}
        fontWeight={500}
        letterSpacing={3}
        uppercase
        color="#f4f0ea"
        ribbon
        ribbonColor="#ac86d2"
        ribbonWidth={48}
        pauseOnHover={false}
      />
    </aside>
  );
}
