"use client";

import { BlockchainRenderer } from "./BlockchainRenderer";

interface SelectedNetworkBlockchainProps {
    selectedNode: string | null;
    blockchain: any[];
    onDataChange: (blockIndex: number, data: any) => void;
    onNonceChange: (blockIndex: number, nonce: number) => void;
    onMineClick: (blockIndex: number) => void;
    miningBlock: number | null;
    miningNonce: number;
}

export function SelectedNetworkBlockchain({
    selectedNode,
    blockchain,
    onDataChange,
    onNonceChange,
    onMineClick,
    miningBlock,
    miningNonce
}: SelectedNetworkBlockchainProps) {
    if (!selectedNode) {
        return (
            <div className="text-center text-slate-500 py-8">
                Select a node to view its blockchain
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-bold mb-4">Node {selectedNode}'s Blockchain</h3>
            <BlockchainRenderer
                blocks={blockchain}
                onDataChange={onDataChange}
                onNonceChange={onNonceChange}
                onMineClick={onMineClick}
                miningBlock={miningBlock}
                miningNonce={miningNonce}
                uniqueKey={`network-${selectedNode}`}
            />
        </div>
    );
}
