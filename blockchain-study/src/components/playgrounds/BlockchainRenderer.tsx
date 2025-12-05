"use client";

import { Block } from "@/lib/types";
import { BlockWithData } from "./BlockWithData";
import { ArrowRight } from "lucide-react";

interface BlockchainRendererProps {
    blocks: Block[];
    orientation?: 'horizontal' | 'vertical';
    onDataChange?: (index: number, data: any) => void;
    onNonceChange?: (index: number, nonce: number) => void;
    onMineClick?: (index: number) => void;
    miningBlock?: number | null;
    miningNonce?: number;
    uniqueKey: string;
}

export function BlockchainRenderer({
    blocks,
    orientation = 'horizontal',
    onDataChange,
    onNonceChange,
    onMineClick,
    miningBlock,
    miningNonce,
    uniqueKey
}: BlockchainRendererProps) {
    return (
        <div className={`flex ${orientation === 'horizontal' ? 'flex-row flex-wrap gap-8 justify-center' : 'flex-col gap-4 items-center'}`}>
            {blocks.map((block, index) => {
                const prevHash = index === 0
                    ? block.prevHash
                    : blocks[index - 1].hash;
                const key = uniqueKey + ':' + block.index;
                const dataString = typeof block.data === 'string' ? block.data : JSON.stringify(block.data);

                return (
                    <div key={key} data-test-key={key} className="relative">
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
                            isMining={miningBlock === index}
                        />
                        {orientation === 'horizontal' && index < blocks.length - 1 && (
                            <div className="absolute -right-6 top-1/2 -translate-y-1/2">
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
        </div>
    );
}
