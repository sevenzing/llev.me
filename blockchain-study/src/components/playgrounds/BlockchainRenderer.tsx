"use client";

import { Block } from "@/lib/types";
import { BlockWithData } from "./BlockWithData";
import { AddBlockGhost } from "./AddBlockGhost";
import { ArrowRight, Plus } from "lucide-react";

interface BlockchainRendererProps {
    blocks: Block[];
    orientation?: 'horizontal' | 'vertical';
    scrollable?: boolean;
    onDataChange?: (index: number, data: any) => void;
    onNonceChange?: (index: number, nonce: number) => void;
    onMineClick?: (index: number) => void;
    onRemoveBlock?: (nodeId?: string) => void;
    onAddBlock?: () => void;
    miningBlock?: number | null;
    miningNonce?: number;
    uniqueKey: string;
    size: 'small' | 'large';
}

export function BlockchainRenderer({
    blocks,
    orientation = 'horizontal',
    scrollable = false,
    onDataChange,
    onNonceChange,
    onMineClick,
    onRemoveBlock,
    onAddBlock,
    miningBlock,
    miningNonce,
    uniqueKey,
    size,
}: BlockchainRendererProps) {
    const layoutClasses = orientation === 'horizontal'
        ? scrollable
            ? 'flex-row overflow-x-auto overflow-y-hidden pt-2 pb-4 px-4 justify-start items-start w-full'
            : 'flex-row flex-wrap gap-8 justify-center items-start'
        : 'flex-col gap-4 items-center';

    return (
        <div className={`flex gap-8 ${layoutClasses}`}>
            {blocks.map((block, index) => {
                const prevHash = index === 0
                    ? block.prevHash
                    : blocks[index - 1].hash;
                const key = uniqueKey + ':' + block.index;
                const dataString = typeof block.data === 'string' ? block.data : JSON.stringify(block.data);
                const isLastBlock = index === blocks.length - 1;

                return (
                    <div key={key} data-test-key={key} className="relative flex items-center flex-shrink-0">
                        <BlockWithData
                            blockNumber={block.index}
                            prevHash={prevHash}
                            initialData={dataString}
                            initialNonce={block.nonce}
                            initialHash={block.hash}
                            miningNonce={miningBlock === index ? miningNonce : undefined}
                            hashDisplay="full"
                            size={size}
                            onDataChange={(data) => onDataChange?.(index, data)}
                            onNonceChange={(nonce) => onNonceChange?.(index, nonce)}
                            onMineClick={onMineClick ? () => onMineClick(index) : undefined}
                            onClose={isLastBlock && index > 0 && onRemoveBlock ? () => onRemoveBlock() : undefined}
                            isMining={miningBlock === index}
                        />
                        {orientation === 'horizontal' && index < blocks.length - 1 && (
                            <div className="absolute -right-6 top-1/2 -translate-y-1/2 z-0">
                                <ArrowRight className="w-4 h-4 text-slate-400" />
                            </div>
                        )}
                        {/* Arrow to Ghost Block */}
                        {orientation === 'horizontal' && isLastBlock && onAddBlock && (
                            <div className="absolute -right-6 top-1/2 -translate-y-1/2 z-0">
                                <ArrowRight className="w-4 h-4 text-slate-400" />
                            </div>
                        )}
                        {orientation === 'vertical' && index < blocks.length - 1 && (
                            <div className="flex justify-center my-2">
                                <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Ghost Block for Adding */}
            {orientation === 'horizontal' && onAddBlock && (
                <AddBlockGhost onClick={onAddBlock} size={size} />
            )}
        </div>
    );
}
