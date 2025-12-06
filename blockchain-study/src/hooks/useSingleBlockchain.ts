import { useState, useCallback } from "react";
import { Block } from "@/lib/types";
import { mockedBlockList } from "@/lib/mockData";
import { calculateBlockHash, mineBlock } from "@/lib/blockchain";

export function useSingleBlockchainMocked(numberOfBlocks: number) {
    return useSingleBlockchain(mockedBlockList(numberOfBlocks));
}

export function useSingleBlockchain(initialBlocks: Block[]) {
    const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
    const [miningBlock, setMiningBlock] = useState<number | null>(null);
    const [miningNonce, setMiningNonce] = useState<number>(0);

    // Helper to propagate changes to subsequent blocks
    const propagateChanges = useCallback(async (currentBlocks: Block[], startIndex: number, newHash: string) => {
        const newBlocks = [...currentBlocks];

        // Update the start block's hash
        // Find the block in the array (it might not be at startIndex if filtered, but here we assume array index matches or we find by index)
        const startBlockIdx = newBlocks.findIndex(b => b.index === startIndex);
        if (startBlockIdx === -1) return newBlocks;

        newBlocks[startBlockIdx] = { ...newBlocks[startBlockIdx], hash: newHash };

        // Propagate to subsequent blocks
        for (let i = startBlockIdx + 1; i < newBlocks.length; i++) {
            const prevBlock = newBlocks[i - 1];
            const currentBlock = newBlocks[i];

            // Update prevHash
            const updatedBlock = { ...currentBlock, prevHash: prevBlock.hash };

            // Recalculate hash for this block because its prevHash changed
            const newBlockHash = await calculateBlockHash(
                updatedBlock.index,
                updatedBlock.nonce,
                updatedBlock.data,
                updatedBlock.prevHash
            );

            updatedBlock.hash = newBlockHash;
            newBlocks[i] = updatedBlock;
        }

        return newBlocks;
    }, []);

    // Mine a block at a specific index
    const mineBlockAtIndex = useCallback(async (blockIndex: number) => {
        const block = getBlockByNumber(blocks, blockIndex);
        if (!block) return;

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

            // We need to propagate changes. Since setBlocks is async, we should do it carefully.
            // Better approach: Calculate everything then setBlocks once.
            const currentBlocks = [...blocks];
            const idx = currentBlocks.findIndex(b => b.index === blockIndex);
            if (idx !== -1) {
                currentBlocks[idx] = { ...currentBlocks[idx], nonce };
                const updatedBlocks = await propagateChanges(currentBlocks, blockIndex, hash);
                setBlocks(updatedBlocks);
            }

        } finally {
            setMiningBlock(null);
        }
    }, [blocks, propagateChanges]);

    // Recalculate hash when block data changes
    const recalculateBlockHash = useCallback(async (blockIndex: number, newData: any) => {
        const block = getBlockByNumber(blocks, blockIndex);
        if (!block) return;

        const hash = await calculateBlockHash(block.index, block.nonce, newData, block.prevHash);

        const currentBlocks = [...blocks];
        const idx = currentBlocks.findIndex(b => b.index === blockIndex);
        if (idx !== -1) {
            currentBlocks[idx] = { ...currentBlocks[idx], data: newData };
            const updatedBlocks = await propagateChanges(currentBlocks, blockIndex, hash);
            setBlocks(updatedBlocks);
        }
    }, [blocks, propagateChanges]);

    // Update nonce manually
    const updateNonce = useCallback(async (blockIndex: number, newNonce: number) => {
        const block = getBlockByNumber(blocks, blockIndex);
        if (!block) return;

        const hash = await calculateBlockHash(block.index, newNonce, block.data, block.prevHash);

        const currentBlocks = [...blocks];
        const idx = currentBlocks.findIndex(b => b.index === blockIndex);
        if (idx !== -1) {
            currentBlocks[idx] = { ...currentBlocks[idx], nonce: newNonce };
            const updatedBlocks = await propagateChanges(currentBlocks, blockIndex, hash);
            setBlocks(updatedBlocks);
        }
    }, [blocks, propagateChanges]);

    return {
        blocks,
        miningBlock,
        miningNonce,
        mineBlockAtIndex,
        recalculateBlockHash,
        updateNonce,
    };
}



function getBlockByNumber(blockchain: Block[], blockNumber: number) {
    if (blockNumber < blockchain.length) return blockchain[blockNumber];
    return blockchain.find(b => b.index === blockNumber);
}
