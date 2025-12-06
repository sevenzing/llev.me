"use client";

import { useNetwork } from "@/hooks/useNetwork";
import { NetworkGraph } from "./NetworkGraph";
import { SelectedNetworkBlockchain } from "./SelectedNetworkBlockchain";
import { Highlight } from "../ui/Highlight";
import { InteractionGuide } from "../ui/InteractionGuide";

interface NetworkPlaygroundProps {
    t: any;
}

export function NetworkPlayground({ t }: NetworkPlaygroundProps) {
    const network = useNetwork();

    const handleDataChange = (blockIndex: number, data: any) => {
        if (network.selectedNode) {
            network.recalculateBlockHash(network.selectedNode, blockIndex, data);
        }
    };

    const handleNonceChange = (blockIndex: number, nonce: number) => {
        if (network.selectedNode) {
            network.updateNonce(network.selectedNode, blockIndex, nonce);
        }
    };

    const handleMineClick = (blockIndex: number) => {
        if (network.selectedNode) {
            network.mineBlockAtIndex(network.selectedNode, blockIndex);
        }
    };

    const currentMiningBlock = network.miningBlock?.nodeId === network.selectedNode
        ? network.miningBlock.blockIndex
        : null;

    return (
        <section id="network" className="max-w-7xl mx-auto px-6 space-y-8">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-heading font-bold text-slate-900">
                    <Highlight>{t.network.title}</Highlight>
                </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Description */}
                <div className="space-y-6">
                    <p className="text-lg text-slate-600 leading-relaxed">
                        <Highlight>{t.network.description}</Highlight>
                    </p>
                    <InteractionGuide text="Click on any Node to see its blockchain. Try to change data in one node and see how other nodes reject the change!" />
                </div>

                {/* Network Graph */}
                <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-inner">
                    <NetworkGraph network={network} />
                </div>
            </div>

            {/* Selected Node's Blockchain */}
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl ring-1 ring-white/40">
                <SelectedNetworkBlockchain
                    selectedNode={network.selectedNode}
                    blockchain={network.selectedBlockchain}
                    onDataChange={handleDataChange}
                    onNonceChange={handleNonceChange}
                    onMineClick={handleMineClick}
                    miningBlock={currentMiningBlock}
                    miningNonce={network.miningNonce}
                />
            </div>
        </section>
    );
}
