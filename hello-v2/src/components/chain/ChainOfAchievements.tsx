"use client";

import { useChain } from "@/lib/chain/useChain";
import { MinedBlockCard } from "./MinedBlockCard";
import TextType from "@/components/react-bits/TextType";
import { CHAIN_HERO_TEXTS } from "@/lib/chain/data";
import { AllBlocksMinedModal } from "@/components/reward/AllBlocksMinedModal";

export function ChainOfAchievements() {
  const { blocks, mineBlock, resetBlock, isValid, rewardOpen, nonceSum, closeReward } = useChain();

  return (
    <section className="pointer-events-none relative z-[1] flex w-[min(420px,calc(100%-40px))] flex-[0_0_min(420px,calc(100%-40px))] flex-col items-center pb-20 pt-[108px]">
      <div className="relative z-[1] mb-6 w-full text-center">
        <TextType
          as="h1"
          className="m-0 !block min-h-[2.8em] w-full text-[1.4rem] font-normal leading-[1.4] tracking-[0.02em] text-cream"
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

      <div className="relative z-[1] flex w-full flex-col items-center">
        {blocks.map((block, i) => (
          <div key={block.number} className="flex w-full flex-col items-center">
            <MinedBlockCard
              block={block}
              valid={isValid(i)}
              prevIsValid={i > 0 ? isValid(i - 1) : true}
              onMine={() => mineBlock(i)}
              onReset={() => resetBlock(i)}
            />
            {i < blocks.length - 1 && (
              <div className="flex h-14 justify-center" aria-hidden>
                <span
                  className={`block h-full w-px ${
                    !isValid(i + 1) && blocks[i + 1].mined
                      ? "bg-warn"
                      : isValid(i)
                        ? "bg-grape"
                        : "bg-cream/20"
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <AllBlocksMinedModal open={rewardOpen} nonceSum={nonceSum} onClose={closeReward} />
    </section>
  );
}
