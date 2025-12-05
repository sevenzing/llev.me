"use client";

import { BlockchainRenderer } from "./BlockchainRenderer";
import { useSingleBlockchain } from "@/hooks/useSingleBlockchain";

interface BlockchainProps {
    orientation?: 'horizontal' | 'vertical';
    numberOfBlocks?: number;
}

export function SingleBlockchainPlayground({ orientation, numberOfBlocks = 3 }: BlockchainProps) {
    const { blocks, miningBlock, miningNonce, mineBlockAtIndex, recalculateBlockHash, updateNonce } = useSingleBlockchain(numberOfBlocks);

    return (
        <div className="w-full">
            <BlockchainRenderer
                blocks={blocks}
                orientation={orientation}
                onDataChange={recalculateBlockHash}
                onNonceChange={updateNonce}
                onMineClick={mineBlockAtIndex}
                miningBlock={miningBlock}
                miningNonce={miningNonce}
                uniqueKey="single-blockchain"
            />
        </div>
    );
}
