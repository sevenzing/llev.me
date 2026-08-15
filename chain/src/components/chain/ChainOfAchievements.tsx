"use client";

import { useChain } from "@/lib/chain/useChain";
import { BlockCard } from "./BlockCard";
import TextType from "@/components/react-bits/TextType";
import { CHAIN_HERO_TEXTS } from "@/lib/chain/data";

export function ChainOfAchievements() {
  const { blocks, mineBlock, resetBlock, isValid } = useChain({
    persist: false,
    scalingDifficulty: false,
  });

  return (
    <section className="chain">
      <div className="chain-hero">
        <TextType
          as="h1"
          className="chain-hero-type"
          text={CHAIN_HERO_TEXTS}
          typingSpeed={50}
          deletingSpeed={30}
          pauseDuration={2200}
          loop
          showCursor
          cursorCharacter="_"
          cursorBlinkDuration={0.5}
        />
      </div>

      <div className="chain-list">
        {blocks.map((block, i) => (
          <div key={block.number} className="chain-item">
            <BlockCard
              block={block}
              valid={isValid(i)}
              prevIsValid={i > 0 ? isValid(i - 1) : true}
              onMine={() => mineBlock(i)}
              onReset={() => resetBlock(i)}
            />
            {i < blocks.length - 1 && (
              <div className="chain-connector" aria-hidden>
                <span className={!isValid(i + 1) && blocks[i + 1].mined ? "is-broken" : isValid(i) ? "is-linked" : undefined} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
