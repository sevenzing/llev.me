"use client";

import { Block } from "@/lib/types";
import { BlockWithData } from "./BlockWithData";
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
    uniqueKey
}: BlockchainRendererProps) {
    const layoutClasses = orientation === 'horizontal'
        ? scrollable
            ? 'flex-row overflow-x-auto overflow-y-hidden pb-8 px-4 justify-start items-start w-full no-scrollbar'
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
                            size="small"
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
                <div
                    onClick={onAddBlock}
                    className="w-64 h-[340px] border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-white/40 hover:shadow-lg transition-all group relative flex-shrink-0"
                >
                    <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                        <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" strokeWidth={3} />
                    </div>
                </div>
            )}
        </div>
    );
}
