"use client";

import { useChain } from "@/lib/chain/useChain";
import { BlockCard } from "./BlockCard";
import TextType from "@/components/react-bits/TextType";

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
          text={["This is a blockchain", "This is chain of events in my life", "This is my history in blocks", "Yeah I like blockchain"]}
          typingSpeed={48}
          deletingSpeed={28}
          pauseDuration={2200}
          loop
          showCursor
          cursorCharacter="_"
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
