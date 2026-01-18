"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { hashIsValid, calculateBlockHash } from "@/lib/blockchain";
import { Trash2 } from "lucide-react";
import { BaseBlock } from "./BaseBlock";

interface BlockWithDataProps {
    blockNumber?: number;
    prevHash?: string;
    initialData?: string;
    initialNonce?: number;
    initialHash?: string;
    miningNonce?: number; // Current nonce during mining (for animation)
    onDataChange?: (data: string) => void;
    onNonceChange?: (nonce: number) => void;
    onMineClick?: () => void;
    onClose?: () => void;
    isMining?: boolean;
    size?: 'small' | 'large';
    hashDisplay?: 'full' | 'truncated';
    readOnly?: boolean;
    rows?: number;
    fixedHeight?: boolean;
}

export function BlockWithData({
    blockNumber = 1,
    prevHash = "0000000000000000000000000000000000000000000000000000000000000000",
    initialData = "",
    initialNonce = 0,
    initialHash = "",
    miningNonce,
    onDataChange,
    onNonceChange,
    onMineClick,
    onClose,
    isMining = false,
    size = 'small',
    hashDisplay = 'full',
    readOnly = false,
    rows = 2,
    fixedHeight = false
}: BlockWithDataProps) {
    const [data, setData] = useState(initialData);
    const nonce = isMining && miningNonce !== undefined ? miningNonce : initialNonce;
    const hash = initialHash;
    const [miningHash, setMiningHash] = useState("");

    const debouncedData = useDebounce(data, 300);

    // Sync local data state when initialData prop changes
    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    // Calculate hash when mining nonce changes (for animation)
    useEffect(() => {
        const calculateHashInternal = async () => {
            const currentHash = await calculateBlockHash(blockNumber, miningNonce ?? 0, data, prevHash);
            setMiningHash(currentHash);
        };
        calculateHashInternal();
    }, [isMining, miningNonce, data, blockNumber, prevHash]);

    // Notify parent when data changes (debounced)
    useEffect(() => {
        if (debouncedData !== initialData) {
            onDataChange?.(debouncedData);
        }
    }, [debouncedData, initialData, onDataChange]);

    const displayHash = hashDisplay === 'truncated' && hash.length > 10
        ? `${hash.slice(0, 6)}...${hash.slice(-4)}`
        : hash;

    const dataTitle = "Data"
    const dataContent = (
        <div className="flex-1 flex flex-col">
            {/* <label className="block text-slate-500 font-semibold mb-1.5 ml-1 text-sm">Data</label> */}
            <textarea
                value={data}
                onChange={(e) => setData(e.target.value)}
                rows={rows}
                disabled={readOnly}
                className={`w-full border border-slate-200 rounded-xl px-2 py-1 text-sm ${readOnly ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-700'} focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/30 transition-all shadow-inner placeholder:text-slate-400 resize-none flex-1`}
                placeholder="Enter block data..."
            />

            <div className="flex gap-2 items-stretch mt-3">
                {!readOnly && onMineClick && (
                    <button
                        onClick={onMineClick}
                        disabled={isMining}
                        className={`flex-[3] bg-gradient-to-r from-blue-500/90 to-indigo-600/90 backdrop-blur-md text-white font-bold rounded-xl py-1.5 text-sm hover:from-blue-600 hover:to-indigo-700 transition-all disabled:from-slate-400/50 disabled:to-slate-500/50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-[0.98] border border-white/20`}
                    >
                        {isMining ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Mining...
                            </span>
                        ) : (
                            '⛏ Mine Block'
                        )}
                    </button>
                )}

                {onClose && (
                    <button
                        onClick={onClose}
                        className={`flex-1 px-2 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all py-1.5`}
                        title="Remove Block"
                    >
                        <Trash2 className="w-5 h-5" strokeWidth={2} />
                    </button>
                )}
            </div>
        </div>
    )

    return (
        <BaseBlock
            blockNumber={blockNumber}
            prevHash={prevHash}
            nonce={nonce}
            hash={displayHash}
            size={size}
            fixedHeight={fixedHeight}
            isMining={isMining}
            miningHash={miningHash}
            onNonceChange={onNonceChange}
            readOnly={readOnly}
            dataContent={dataContent}
            dataTitle={dataTitle}
        />
    );
}
