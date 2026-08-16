"use client";

import { useEffect, useRef, useState } from "react";
import { ImpactDrop } from "@/components/effects/ImpactDrop";
import { BlockCard, type BlockCardProps } from "./BlockCard";

/**
 * Drop-in replacement for BlockCard that plays the "impact drop + confetti"
 * reward animation whenever the block transitions from unmined to mined.
 */
export function MinedBlockCard(props: BlockCardProps) {
  const { block } = props;
  const [mineKey, setMineKey] = useState(0);
  const wasMined = useRef(block.mined);

  useEffect(() => {
    if (block.mined && !wasMined.current) {
      setMineKey((k) => k + 1);
    }
    wasMined.current = block.mined;
  }, [block.mined]);

  return (
    <ImpactDrop trigger={mineKey}>
      <BlockCard {...props} />
    </ImpactDrop>
  );
}
