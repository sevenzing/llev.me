"use client";

import { useId } from "react";
import "./PickaxeAnimation.css";

interface PickaxeAnimationProps {
  className?: string;
}

/**
 * Minimalistic pickaxe striking a rock twice per loop: windup, snap strike,
 * micro-rebound, repeat, with a squash/flash on the rock and a small spark
 * burst on each impact. Keyframe choreography lives in PickaxeAnimation.css.
 */
export function PickaxeAnimation({ className }: PickaxeAnimationProps) {
  const glowId = useId();

  return (
    <svg
      viewBox="0 0 64 64"
      className={`pickaxe-anim${className ? ` ${className}` : ""}`}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Target rock, bottom-right */}
      <g>
        <polygon
          className="pickaxe-anim-rock"
          points="40,56 46,44 56,42 60,52 54,58 42,58"
          stroke="#8c70fa"
          strokeWidth={2}
          fill="rgba(140, 112, 250, 0.06)"
        />
        <polyline
          className="pickaxe-anim-rock"
          points="46,44 50,51 60,52"
          stroke="#8c70fa"
          strokeWidth={1.5}
          opacity={0.6}
        />
        <line
          className="pickaxe-anim-rock"
          x1={50}
          y1={51}
          x2={54}
          y2={58}
          stroke="#8c70fa"
          strokeWidth={1.5}
          opacity={0.6}
        />
        <path
          className="pickaxe-anim-crack"
          d="M46,44 L44,40 L41,39"
          stroke="#ffffff"
          strokeWidth={1.5}
          strokeDasharray={14}
          strokeDashoffset={14}
          opacity={0}
        />
      </g>

      {/* Pickaxe, pivoting at the grip (20, 48) */}
      <g className="pickaxe-anim-arm">
        <line x1={20} y1={48} x2={40} y2={22} stroke="#f4f0ea" strokeWidth={2.2} />
        <line x1={22} y1={45.5} x2={24} y2={43} stroke="#120F17" strokeWidth={1.2} />
        <circle cx={19.5} cy={48.5} r={1.2} fill="#f4f0ea" />
        <polygon points="40,19 43,22 40,25 37,22" stroke="#8c70fa" strokeWidth={1.8} fill="#120F17" />
        <path
          d="M26,14 C33,17 45,21 49,34 C46,31 38,26 26,14 Z"
          stroke="#8c70fa"
          strokeWidth={2}
          strokeLinejoin="round"
          fill="rgba(140, 112, 250, 0.15)"
        />
        <path d="M40,22 C37,17 33,14 26,14" stroke="#8c70fa" strokeWidth={2} />
        <path d="M44,28 L49,34 L46,31" stroke="#c084fc" strokeWidth={1.5} />
      </g>

      {/* Impact spark burst */}
      <g filter={`url(#${glowId})`}>
        <circle className="pickaxe-anim-spark-1" cx={45} cy={42} r={1.2} fill="#8c70fa" opacity={0} />
        <circle className="pickaxe-anim-spark-2" cx={46} cy={41} r={1.4} fill="#c084fc" opacity={0} />
        <circle className="pickaxe-anim-spark-3" cx={47} cy={42} r={1.1} fill="#38bdf8" opacity={0} />
        <circle className="pickaxe-anim-spark-4" cx={44} cy={43} r={1} fill="#f4f0ea" opacity={0} />
        <circle className="pickaxe-anim-spark-5" cx={47} cy={44} r={0.9} fill="#38bdf8" opacity={0} />
      </g>
    </svg>
  );
}
