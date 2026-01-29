"use client";

import { useNetwork } from "@/hooks/useNetwork";
import { NetworkGraph } from "./NetworkGraph";
import { SelectedNetworkBlockchain } from "./SelectedNetworkBlockchain";
import { Highlight } from "../ui/Highlight";
import { InteractionGuide } from "../ui/InteractionGuide";
import { Link as LinkIcon } from "lucide-react";

interface NetworkPlaygroundProps {
    t: any;
    onAnchorClick?: (e: React.MouseEvent, href: string) => void;
}

export function NetworkPlayground({ t, onAnchorClick }: NetworkPlaygroundProps) {
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
            <div className="text-center space-y-4 flex flex-col items-center">
                <div className="group flex items-center gap-3 relative">
                    <h2 className="text-4xl font-heading font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        <Highlight>{t.network.title}</Highlight>
                    </h2>
                    <a
                        href="#network"
                        onClick={(e) => onAnchorClick?.(e, "#network")}
                        className="opacity-0 group-hover:opacity-100 p-2 text-blue-500 hover:text-blue-700 transition-all transform translate-x-[-10px] group-hover:translate-x-0"
                        aria-label="Link to Network section"
                    >
                        <LinkIcon size={24} />
                    </a>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-6 max-w-4xl mx-auto text-center">
                <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
                    <Highlight>{t.network.description}</Highlight>
                </p>
                <InteractionGuide text={t.network.instruction} />
            </div>

            <div className="grid lg:grid-cols-[350px_1fr] gap-8 items-start relative">
                {/* Network Graph */}

                <NetworkGraph network={network} showExtraControls={false} />


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
