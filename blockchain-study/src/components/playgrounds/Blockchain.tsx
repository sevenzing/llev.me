"use client";

import { useState, useCallback } from "react";
import { BlockWithData } from "./BlockWithData";

interface BlockchainProps {
    orientation?: 'horizontal' | 'vertical';
}

export function Blockchain({ orientation = 'vertical' }: BlockchainProps) {
    const [blocks, setBlocks] = useState([
        { id: 1, hash: "0000000000000000000000000000000000000000000000000000000000000000" },
        { id: 2, hash: "" },
        { id: 3, hash: "" },
    ]);

    const handleBlockChange = useCallback((index: number, hash: string) => {
        setBlocks(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], hash };
            return updated;
        });
    }, []);

    if (orientation === 'horizontal') {
        return (
            <div className="w-full">
                <div className="flex flex-wrap gap-8 justify-center">
                    {blocks.map((block, index) => (
                        <div key={block.id} className="relative">
                            <BlockWithData
                                blockNumber={block.id}
                                prevHash={index === 0 ? "0000000000000000000000000000000000000000000000000000000000000000" : blocks[index - 1].hash}
                                initialData={index === 0 ? "Genesis Block" : `Transaction ${String.fromCharCode(65 + index - 1)} -> ${String.fromCharCode(66 + index - 1)}`}
                                onBlockChange={(hash) => handleBlockChange(index, hash)}
                            />
                            {index < blocks.length - 1 && (
                                <div className="absolute top-1/2 -right-5 transform -translate-y-1/2 z-10 hidden lg:block">
                                    <div className="text-3xl text-emerald-400">→</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="flex flex-col gap-6">
                {blocks.map((block, index) => (
                    <div key={block.id} className="relative">
                        <BlockWithData
                            blockNumber={block.id}
                            prevHash={index === 0 ? "0000000000000000000000000000000000000000000000000000000000000000" : blocks[index - 1].hash}
                            initialData={index === 0 ? "Genesis Block" : `Transaction ${String.fromCharCode(65 + index - 1)} -> ${String.fromCharCode(66 + index - 1)}`}
                            onBlockChange={(hash) => handleBlockChange(index, hash)}
                        />
                        {index < blocks.length - 1 && (
                            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10">
                                <div className="text-3xl text-emerald-400">↓</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
