"use client";

import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { useAnimatedGradient, type UseAnimatedGradientOptions } from "./useAnimatedGradient";

interface GradientStripeProps extends UseAnimatedGradientOptions {
  className?: string;
  style?: CSSProperties;
}

/**
 * Same moving-gradient technique as GradientText, but rendered as a plain
 * animated fill (e.g. a status stripe/bar) instead of being clipped to text.
 */
export default function GradientStripe({ className = "", style, ...gradientOptions }: GradientStripeProps) {
  const { style: gradientStyle } = useAnimatedGradient(gradientOptions);
  return <motion.div className={className} style={{ ...gradientStyle, ...style }} />;
}
