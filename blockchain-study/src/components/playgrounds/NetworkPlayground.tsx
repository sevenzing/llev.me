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

            {/* Description */}
            <div className="space-y-6 max-w-4xl mx-auto text-center">
                <p className="text-lg text-slate-600 leading-relaxed">
                    <Highlight>{t.network.description}</Highlight>
                </p>
                <InteractionGuide text="Click on any Node to see its blockchain. Try to change data in one node and try to sync the network! Try to add new Blocks, mine and sync the network. Try to cheat and see what will happen!" />
            </div>

            <div className="grid lg:grid-cols-[350px_1fr] gap-8 items-start relative">
                {/* Network Graph */}

                <NetworkGraph network={network} />


                {/* Selected Node's Blockchain */}

                <SelectedNetworkBlockchain
                    selectedNode={network.selectedNode}
                    blockchain={network.selectedBlockchain}
                    onDataChange={handleDataChange}
                    onNonceChange={handleNonceChange}
                    onMineClick={handleMineClick}
                    onAddBlock={network.addBlock}
                    onRemoveBlock={network.removeBlock}
                    miningBlock={currentMiningBlock}
                    miningNonce={network.miningNonce}
                    scrollable={true}
                />
            </div>
        </section>
    );
}
