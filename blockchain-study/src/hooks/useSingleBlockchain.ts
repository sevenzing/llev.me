import { useState, useCallback } from "react";
import { Block } from "@/lib/types";
import { mockedBlockList } from "@/lib/mockData";
import { calculateBlockHash, mineBlock } from "@/lib/blockchain";

export function useSingleBlockchain(initialBlockCount: number = 3) {
    const [blocks, setBlocks] = useState<Block[]>(mockedBlockList(initialBlockCount));
    const [miningBlock, setMiningBlock] = useState<number | null>(null);
    const [miningNonce, setMiningNonce] = useState<number>(0);

    // Mine a block at a specific index
    const mineBlockAtIndex = useCallback(async (blockIndex: number) => {
        if (blockIndex >= blocks.length) return;

        const block = blocks[blockIndex];
        setMiningBlock(blockIndex);
        setMiningNonce(0);

        try {
            const { hash, nonce } = await mineBlock(
                block.index,
                block.data,
                block.prevHash,
                (currentNonce, currentHash) => {
                    setMiningNonce(currentNonce);
                }
            );

            setBlocks(prev => prev.map((b, idx) =>
                idx === blockIndex ? { ...b, hash, nonce } : b
            ));
        } finally {
            setMiningBlock(null);
        }
    }, [blocks]);

    // Recalculate hash when block data changes
    const recalculateBlockHash = useCallback(async (blockIndex: number, newData: any) => {
        if (blockIndex >= blocks.length) return;

        const block = blocks[blockIndex];
        const hash = await calculateBlockHash(block.index, block.nonce, newData, block.prevHash);

        setBlocks(prev => prev.map((b, idx) =>
            idx === blockIndex ? { ...b, data: newData, hash } : b
        ));
    }, [blocks]);

    // Update nonce manually
    const updateNonce = useCallback(async (blockIndex: number, newNonce: number) => {
        if (blockIndex >= blocks.length) return;

        const block = blocks[blockIndex];
        const hash = await calculateBlockHash(block.index, newNonce, block.data, block.prevHash);

        setBlocks(prev => prev.map((b, idx) =>
            idx === blockIndex ? { ...b, nonce: newNonce, hash } : b
        ));
    }, [blocks]);

    return {
        blocks,
        miningBlock,
        miningNonce,
        mineBlockAtIndex,
        recalculateBlockHash,
        updateNonce,
    };
}
