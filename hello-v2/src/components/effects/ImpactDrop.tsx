"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

const DEFAULT_CONFETTI_COLORS = ["#8c70fa", "#c084fc", "#38bdf8", "#f0a070", "#f4f0ea"];

export interface ImpactDropProps {
  children: ReactNode;
  /** Change this value (e.g. increment a counter) to replay the animation. */
  trigger: number | string;
  className?: string;
  /** Skip the animation entirely, e.g. while content is still mining. */
  disabled?: boolean;

  /** How far (px) the content launches up before falling back down. */
  liftHeight?: number;
  /** Peak scale while airborne — how much bigger it grows. */
  liftScale?: number;
  /** Degrees of forward tilt while airborne, for a bit of depth. */
  liftTilt?: number;
  /** Seconds spent launching up. */
  launchDuration?: number;
  /** Seconds spent falling back down. */
  fallDuration?: number;
  /** Scale at the instant of impact (squash). */
  impactSquash?: number;
  /** Scale of the small rebound right after impact. */
  reboundScale?: number;
  /** Seconds spent on the rebound. */
  reboundDuration?: number;
  /** Seconds spent settling back to rest. */
  settleDuration?: number;

  /** Whether to fire a confetti burst on impact. */
  confetti?: boolean;
  /** Number of confetti particles. */
  confettiCount?: number;
  confettiColors?: string[];
  /** [min, max] travel distance in px for confetti particles. */
  confettiSpread?: [number, number];
  /** [min, max] seconds each confetti particle takes to fade out. */
  confettiDuration?: [number, number];
  /** Seconds of stagger delay between consecutive particles. */
  confettiStagger?: number;

  /** Whether to render a soft contact shadow under the content. */
  shadow?: boolean;

  /** Fires at the exact moment of impact (useful for sound effects, haptics, etc). */
  onImpact?: () => void;
}

/**
 * Wraps arbitrary content and, whenever `trigger` changes, plays a
 * "launch up, drop back down, land with impact + confetti" reward animation.
 * Does not render any chrome of its own — it only animates its children.
 */
export function ImpactDrop({
  children,
  trigger,
  className,
  disabled = false,
  liftHeight = 24,
  liftScale = 1.09,
  liftTilt = 7,
  launchDuration = 0.26,
  fallDuration = 0.2,
  impactSquash = 0.96,
  reboundScale = 1.02,
  reboundDuration = 0.14,
  settleDuration = 0.24,
  confetti = true,
  confettiCount = 12,
  confettiColors = DEFAULT_CONFETTI_COLORS,
  confettiSpread = [46, 96],
  confettiDuration = [1.5, 2.0],
  confettiStagger = 0.015,
  shadow = true,
  onImpact,
}: ImpactDropProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  // Remember the value `trigger` had at mount so we can tell a genuine change
  // apart from React 18 Strict Mode's double-invoked mount effect (which would
  // otherwise be misread as "trigger changed" on the second invocation).
  const initialTriggerRef = useRef(trigger);

  useEffect(() => {
    // Still the value from mount — nothing actually changed yet, don't animate.
    if (trigger === initialTriggerRef.current) return;
    if (disabled) return;

    const content = contentRef.current;
    if (!content) return;
    const shadowEl = shadowRef.current;

    const burstConfetti = () => {
      if (!confetti) return;
      const dots = dotsRef.current?.querySelectorAll<HTMLSpanElement>(".impact-drop-dot");
      const [minDist, maxDist] = confettiSpread;
      const [minDur, maxDur] = confettiDuration;
      dots?.forEach((dot, i) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = minDist + Math.random() * (maxDist - minDist);
        gsap.fromTo(
          dot,
          { x: 0, y: 0, opacity: 1, scale: 1 },
          {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist - 12,
            opacity: 0,
            scale: 0.3,
            duration: minDur + Math.random() * (maxDur - minDur),
            ease: "power2.out",
            delay: i * confettiStagger,
          }
        );
      });
    };

    const tl = gsap.timeline();
    tl.set(content, { y: 0, scale: 1, rotateX: 0 });
    if (shadowEl) tl.set(shadowEl, { scaleX: 1, opacity: 0.35 });

    // launch up
    tl.to(content, { y: -liftHeight, scale: liftScale, rotateX: liftTilt, duration: launchDuration, ease: "power2.out" });
    if (shadowEl) {
      tl.to(shadowEl, { scaleX: 0.68, opacity: 0.12, duration: launchDuration, ease: "power2.out" }, "<");
    }

    // fall + impact squash
    tl.to(content, { y: 0, scale: impactSquash, rotateX: -2, duration: fallDuration, ease: "power2.in" });
    if (shadowEl) {
      tl.to(shadowEl, { scaleX: 1.2, opacity: 0.42, duration: fallDuration * 0.5, ease: "power1.out" }, "<");
    }

    tl.call(() => {
      burstConfetti();
      onImpact?.();
    });

    // small rebound
    tl.to(content, { scale: reboundScale, rotateX: 1.5, duration: reboundDuration, ease: "power1.out" });
    if (shadowEl) {
      tl.to(shadowEl, { scaleX: 0.96, opacity: 0.28, duration: reboundDuration }, "<");
    }

    // settle
    tl.to(content, { scale: 1, rotateX: 0, duration: settleDuration, ease: "power2.out" });
    if (shadowEl) {
      tl.to(shadowEl, { scaleX: 1, opacity: 0.35, duration: settleDuration }, "<");
    }

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return (
    <div className={`relative w-full ${className ?? ""}`} style={{ perspective: "700px" }}>
      {confetti && (
        <div ref={dotsRef} className="pointer-events-none absolute inset-0 z-20 overflow-visible">
          {Array.from({ length: confettiCount }, (_, i) => (
            <span
              key={i}
              className="impact-drop-dot absolute left-1/2 top-1/2 h-1.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-[2px] opacity-0"
              style={{ background: confettiColors[i % confettiColors.length] }}
            />
          ))}
        </div>
      )}
      {shadow && (
        <div
          ref={shadowRef}
          className="pointer-events-none absolute -bottom-2 left-1/2 h-3 w-[72%] -translate-x-1/2 rounded-full bg-black/70 blur-md"
        />
      )}
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
