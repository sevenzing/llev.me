"use client";

import React, { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEcosystem } from '@/hooks/useEcosystem';
import { AccountPhone } from './AccountPhone';
import { NetworkGraph } from './NetworkGraph';
import { CardBackground } from '../ui/CardBackground';
import { BlockchainRenderer } from './BlockchainRenderer';
import { Highlight } from '../ui/Highlight';
import { InteractionGuide } from '../ui/InteractionGuide';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Zap, ZapOff, Info } from 'lucide-react';

export function EcosystemPlayground() {
    const { t } = useLanguage();
    const ecosystem = useEcosystem();

    // Check if network is in sync (all nodes have same highest block hash)
    const isNetworkSynced = useMemo(() => {
        if (ecosystem.nodes.length <= 1) return true;
        const firstNodeHash = ecosystem.nodes[0].blockchain[ecosystem.nodes[0].blockchain.length - 1].hash;
        return ecosystem.nodes.every(node =>
            node.blockchain[node.blockchain.length - 1].hash === firstNodeHash
        );
    }, [ecosystem.nodes]);

    const stats = useMemo(() => {
        let totalBlocks = 0;
        let totalTxs = 0;
        ecosystem.nodes.forEach(node => {
            totalBlocks += node.blockchain.length;
            node.blockchain.forEach(block => {
                if (Array.isArray(block.data)) {
                    totalTxs += block.data.length;
                }
            });
        });
        return { totalBlocks, totalTxs };
    }, [ecosystem.nodes]);

    return (
        <section id="ecosystem" className="max-w-[1400px] mx-auto px-4 py-12 space-y-8">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-heading font-bold text-slate-900">
                    <Highlight>{t.ecosystem.title}</Highlight>
                </h2>
                <div className="max-w-3xl mx-auto">
                    <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
                        <Highlight>{t.ecosystem.description}</Highlight>
                    </p>
                </div>
                <InteractionGuide text={t.ecosystem.instruction} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr_380px] gap-4 h-[680px]">
                {/* Column 1: Wallet */}
                <div className="h-full min-h-0">
                    <AccountPhone
                        onSendTransaction={(tx) => ecosystem.sendTransaction(tx)}
                        balances={ecosystem.balances}
                    />
                </div>

                {/* Column 2: Network */}
                <div className="flex flex-col h-full gap-4 min-h-0" id="network-view">
                    <div className="flex items-center justify-between px-1">
                        <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {t.ecosystem.networkView}
                        </h4>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${isNetworkSynced
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                            }`}>
                            {isNetworkSynced ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                            {isNetworkSynced ? t.ecosystem.statusOk : t.ecosystem.statusWarning}
                        </div>
                    </div>

                    <div className="flex-1 relative min-h-0">
                        <NetworkGraph network={ecosystem as any} />
                    </div>
                </div>

                {/* Column 3: Blockchain Inspector */}
                <div className="flex flex-col h-full gap-4 min-h-0" id="node-inspector">
                    <div className="flex flex-col gap-2 px-1">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                Node {ecosystem.selectedNode} Inspector
                            </h4>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                <span className="flex items-center gap-1"><Info size={10} /> {ecosystem.selectedBlockchain.length} {t.ecosystem.blocks}</span>
                            </div>
                        </div>
                    </div>

                    <CardBackground className="flex-1 overflow-hidden flex flex-col p-4 min-h-0">
                        <div className="flex-1 overflow-y-auto pr-2">
                            <BlockchainRenderer
                                blocks={ecosystem.selectedBlockchain}
                                orientation="vertical"
                                reverse={true}
                                uniqueKey={`ecosystem-${ecosystem.selectedNode}`}
                                size="small"
                                onMineClick={(idx) => ecosystem.mineNodeBlock?.(ecosystem.selectedNode, idx)}
                                onDataChange={(idx, data) => ecosystem.handleBlockDataChange?.(ecosystem.selectedNode, idx, data)}
                                onNonceChange={(idx, nonce) => ecosystem.handleBlockNonceChange?.(ecosystem.selectedNode, idx, nonce)}
                                miningBlock={ecosystem.miningBlock?.nodeId === ecosystem.selectedNode ? ecosystem.miningBlock.blockIndex : null}
                                miningNonce={ecosystem.miningNonce}
                                miningHash={ecosystem.miningHash}
                                validateTransaction={ecosystem.validateTransaction}
                            />
                        </div>
                    </CardBackground>
                </div>
            </div>
        </section>
    );
}
