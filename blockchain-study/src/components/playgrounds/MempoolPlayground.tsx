"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, Block } from '@/lib/types';
import { AccountPhone } from './AccountPhone';
import { MempoolQueue } from './MempoolQueue';
import { MinerNode } from './MinerNode';
import { BlockWithTransactions } from './BlockWithTransactions';
import { useLanguage } from '@/contexts/LanguageContext';
import { calculateBlockHash, mineBlock } from '@/lib/blockchain';
import { BlockchainRenderer } from './BlockchainRenderer';

const MAX_TX_PER_BLOCK = 3;

export function MempoolPlayground() {
    const { t } = useLanguage();

    // Global Playground State
    const [mempool, setMempool] = useState<Transaction[]>([]);
    const [blockchain, setBlockchain] = useState<Block[]>([
        {
            index: 0,
            data: "Alice: 500 coins. Bob: 100 coins. Charlie: 10 coins",
            hash: "0000a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0",
            prevHash: "0",
            nonce: 742,
            timestamp: Date.now()
        }
    ]);
    const [isMining, setIsMining] = useState(false);
    const [miningProgress, setMiningProgress] = useState(0);
    const [showChain, setShowChain] = useState(true);
    const [totalTxMined, setTotalTxMined] = useState(0);

    // Add transaction to mempool (NO SORTING HERE)
    const handleAddTransaction = (tx: Transaction) => {
        setMempool(prev => [...prev, tx]);
    };

    // Remove from mempool
    const handleRemoveTransaction = (id: string) => {
        setMempool(prev => prev.filter(tx => tx.id !== id));
    };



    // Mining Process
    const startMining = async () => {
        if (mempool.length === 0 || isMining) return;

        setIsMining(true);
        setMiningProgress(0);

        // Asymptotic progress simulator
        const progressInterval = setInterval(() => {
            setMiningProgress(prev => {
                if (prev >= 95) return prev;
                // Move 10% of the remaining distance to 100% every 200ms
                const increment = (98 - prev) * 0.05;
                return prev + increment;
            });
        }, 200);

        // SORTING ANIMATION / DELAY
        await new Promise(r => setTimeout(r, 800));
        const sortedMempool = [...mempool].sort((a, b) => b.fee - a.fee);
        setMempool(sortedMempool);
        await new Promise(r => setTimeout(r, 400));

        const validTx = sortedMempool.filter(tx => tx.isValid);
        const txToMine = validTx.slice(0, MAX_TX_PER_BLOCK);
        const txIdsToMine = new Set(txToMine.map(tx => tx.id));
        const remainingMempool = mempool.filter(tx => !txIdsToMine.has(tx.id));

        // Create New Block Context
        const lastBlock = blockchain[blockchain.length - 1];
        const newIndex = blockchain.length;
        const prevHash = lastBlock.hash;

        // Use library mineBlock for robust mining
        const { hash, nonce } = await mineBlock(
            newIndex,
            txToMine,
            prevHash
        );

        clearInterval(progressInterval);
        setMiningProgress(100);

        // Give it a moment to show completion
        await new Promise(r => setTimeout(r, 600));

        const newBlock: Block = {
            index: newIndex,
            data: txToMine,
            hash,
            prevHash,
            nonce,
            timestamp: Date.now()
        };

        setBlockchain(prev => [...prev, newBlock]);
        setMempool(remainingMempool);
        setTotalTxMined(prev => prev + txToMine.length);
        setIsMining(false);
        setMiningProgress(0);
    };

    return (
        <div className="w-full space-y-12">
            {/* ROW 2: Playground Components */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 xl:gap-12">
                <AccountPhone
                    onSendTransaction={handleAddTransaction}
                />

                <div className="hidden lg:flex flex-col justify-center items-center h-[38rem] pt-8">
                    <div className="w-px h-full bg-slate-200 dashed-border relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                            →
                        </div>
                    </div>
                </div>

                <MempoolQueue
                    transactions={mempool}
                    onRemove={handleRemoveTransaction}
                />

                <div className="hidden lg:flex flex-col justify-center items-center h-[38rem] pt-8">
                    <div className="w-px h-full bg-slate-200 dashed-border relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                            →
                        </div>
                    </div>
                </div>

                <MinerNode
                    onMine={startMining}
                    isMining={isMining}
                    blockCount={blockchain.length - 1}
                    txMined={totalTxMined}
                    showChain={showChain}
                    onToggleChain={() => setShowChain(!showChain)}
                    miningProgress={miningProgress}
                />
            </div>

            {/* ROW 3: Miner's Blockchain */}
            <AnimatePresence>
                {showChain && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="pt-8 space-y-6"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Miner's Blockchain Ledger</h4>
                            <div className="w-12 h-1 bg-blue-500 rounded-full" />
                        </div>

                        <div className="w-full">
                            <BlockchainRenderer
                                blocks={blockchain}
                                orientation="horizontal"
                                scrollable={true}
                                uniqueKey="mempool-blockchain"
                                size="small"
                                onRemoveBlock={() => setBlockchain(prev => prev.slice(0, -1))}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
