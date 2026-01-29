"use client";

import { CardBackground } from "../ui/CardBackground";
import { BlockchainRenderer } from "./BlockchainRenderer";
import { useLanguage } from "@/contexts/LanguageContext";

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
    const { t } = useLanguage();

    if (!selectedNode) {
        return (
            <div className="text-center text-slate-500 py-8">
                {t.network.selectNode}
            </div>
        );
    }

    return (
        <CardBackground className="space-y-4 min-w-0 h-full">
            <h3 className="text-lg font-bold pt-4 px-4">{t.network.nodeChain(selectedNode)}</h3>
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
