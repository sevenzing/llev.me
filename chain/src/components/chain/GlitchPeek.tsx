"use client";

import { CSSProperties, PointerEvent, useRef, useState } from "react";
import LetterGlitch from "@/components/react-bits/LetterGlitch.jsx";

const LENS_RADIUS = 54;
const MAGNIFY = 1.22;

const textStyle: CSSProperties = {
  margin: 0,
  padding: "28px 12px 12px",
  fontSize: 13,
  lineHeight: 1.55,
  color: "#2b2b2b",
  whiteSpace: "pre-wrap",
};

export function GlitchPeek({ text, locked }: { text: string; locked: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);

  const moveLens = (e: PointerEvent<HTMLDivElement>) => {
    if (locked) return;
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    setLens({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={boxRef}
      onPointerMove={moveLens}
      onPointerEnter={moveLens}
      onPointerLeave={() => setLens(null)}
      style={{
        position: "relative",
        minHeight: 104,
        overflow: "hidden",
        cursor: locked ? "default" : "none",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <LetterGlitch
          glitchSpeed={70}
          smooth
          outerVignette={false}
          centerVignette={false}
          characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_/[]{}=+*^?#@$%01"
        />
      </div>

      <p style={{ ...textStyle, visibility: "hidden" }}>{text}</p>

      {!locked && lens && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#f7f7f5",
              clipPath: `circle(${LENS_RADIUS}px at ${lens.x}px ${lens.y}px)`,
              pointerEvents: "none",
            }}
          >
            <p
              style={{
                ...textStyle,
                transform: `scale(${MAGNIFY})`,
                transformOrigin: `${lens.x}px ${lens.y}px`,
              }}
            >
              {text}
            </p>
          </div>
          <div
            style={{
              position: "absolute",
              left: lens.x - LENS_RADIUS,
              top: lens.y - LENS_RADIUS,
              width: LENS_RADIUS * 2,
              height: LENS_RADIUS * 2,
              borderRadius: "50%",
              pointerEvents: "none",
              border: "1.5px solid rgba(255,255,255,0.55)",
              boxShadow:
                "0 0 0 1px rgba(0,0,0,0.4), 0 10px 24px rgba(0,0,0,0.28), inset 0 0 16px rgba(255,255,255,0.12)",
              background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.14), transparent 55%)",
            }}
          />
        </>
      )}
    </div>
  );
}
