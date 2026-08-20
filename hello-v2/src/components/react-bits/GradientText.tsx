"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useAnimatedGradient, type UseAnimatedGradientOptions } from "./useAnimatedGradient";

interface GradientTextProps extends UseAnimatedGradientOptions {
  children: ReactNode;
  className?: string;
  showBorder?: boolean;
}

/**
 * Ported from https://reactbits.dev/text-animations/gradient-text (ts-tailwind variant).
 * Clips an animated moving gradient to text via background-clip.
 */
export default function GradientText({
  children,
  className = "",
  showBorder = false,
  ...gradientOptions
}: GradientTextProps) {
  const { style, handleMouseEnter, handleMouseLeave } = useAnimatedGradient(gradientOptions);

  return (
    <motion.div
      className={`relative inline-flex max-w-fit flex-row items-center justify-center rounded-[1.25rem] font-medium transition-shadow duration-500 ${
        showBorder ? "px-2 py-1" : ""
      } ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showBorder && (
        <motion.div className="pointer-events-none absolute inset-0 z-0 rounded-[1.25rem]" style={style} />
      )}
      <motion.div
        className="relative z-[2] inline-block bg-clip-text text-transparent"
        style={{ ...style, WebkitBackgroundClip: "text" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
