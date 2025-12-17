"use client";

import { CardBackground } from "../ui/CardBackground";
import { BlockchainRenderer } from "./BlockchainRenderer";

interface SelectedNetworkBlockchainProps {
    selectedNode: string | null;
    blockchain: any[];
    onDataChange: (blockIndex: number, data: any) => void;
    onNonceChange: (blockIndex: number, nonce: number) => void;
    onMineClick: (blockIndex: number) => void;
    onAddBlock: () => void;
    onRemoveBlock: (nodeId: string) => void;
    miningBlock: number | null;
    miningNonce: number;
    scrollable?: boolean;
}

export function SelectedNetworkBlockchain({
    selectedNode,
    blockchain,
    onDataChange,
    onNonceChange,
    onMineClick,
    onAddBlock,
    onRemoveBlock,
    miningBlock,
    miningNonce,
    scrollable
}: SelectedNetworkBlockchainProps) {
    if (!selectedNode) {
        return (
            <div className="text-center text-slate-500 py-8">
                Select a node to view its blockchain
            </div>
        );
    }

    return (
        <CardBackground className="space-y-4 min-w-0 h-full">
            <h3 className="text-lg font-bold pt-4 px-4">Node {selectedNode}'s Blockchain</h3>
            <div className="pl-4">
                <BlockchainRenderer
                    blocks={blockchain}
                    onDataChange={onDataChange}
                    onNonceChange={onNonceChange}
                    onMineClick={onMineClick}
                    onAddBlock={onAddBlock}
                    onRemoveBlock={() => onRemoveBlock(selectedNode)}
                    miningBlock={miningBlock}
                    miningNonce={miningNonce}
                    uniqueKey={`network-${selectedNode}`}
                    scrollable={scrollable}
                    size="small"
                />
            </div>
        </CardBackground>
    );
}
