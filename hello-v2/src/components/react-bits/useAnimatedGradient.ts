"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useMotionValue, useAnimationFrame, useTransform, type MotionValue } from "motion/react";

export interface UseAnimatedGradientOptions {
  colors?: string[];
  animationSpeed?: number;
  direction?: "horizontal" | "vertical" | "diagonal";
  pauseOnHover?: boolean;
  yoyo?: boolean;
}

/**
 * Core technique behind reactbits' GradientText (reactbits.dev/text-animations/gradient-text):
 * a large repeating linear-gradient whose backgroundPosition is driven by a Motion value on
 * every animation frame, instead of a CSS @keyframes loop. Extracted here so it can drive either
 * clipped text (GradientText) or a plain animated fill (GradientStripe).
 */
export function useAnimatedGradient({
  colors = ["#5227FF", "#FF9FFC", "#B497CF"],
  animationSpeed = 8,
  direction = "horizontal",
  pauseOnHover = false,
  yoyo = true,
}: UseAnimatedGradientOptions = {}) {
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  const animationDuration = animationSpeed * 1000;

  useAnimationFrame((time) => {
    if (isPaused) {
      lastTimeRef.current = null;
      return;
    }
    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    elapsedRef.current += deltaTime;

    if (yoyo) {
      const fullCycle = animationDuration * 2;
      const cycleTime = elapsedRef.current % fullCycle;
      if (cycleTime < animationDuration) {
        progress.set((cycleTime / animationDuration) * 100);
      } else {
        progress.set(100 - ((cycleTime - animationDuration) / animationDuration) * 100);
      }
    } else {
      progress.set((elapsedRef.current / animationDuration) * 100);
    }
  });

  useEffect(() => {
    elapsedRef.current = 0;
    progress.set(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationSpeed, yoyo]);

  const backgroundPosition: MotionValue<string> = useTransform(progress, (p) =>
    direction === "vertical" ? `50% ${p}%` : `${p}% 50%`
  );

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) setIsPaused(true);
  }, [pauseOnHover]);
  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) setIsPaused(false);
  }, [pauseOnHover]);

  const gradientAngle =
    direction === "horizontal" ? "to right" : direction === "vertical" ? "to bottom" : "to bottom right";
  const gradientColors = [...colors, colors[0]].join(", ");

  const style = {
    backgroundImage: `linear-gradient(${gradientAngle}, ${gradientColors})`,
    backgroundSize: direction === "horizontal" ? "300% 100%" : direction === "vertical" ? "100% 300%" : "300% 300%",
    backgroundRepeat: "repeat",
    backgroundPosition,
  };

  return { style, handleMouseEnter, handleMouseLeave };
}
