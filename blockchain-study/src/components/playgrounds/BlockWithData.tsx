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
            <textarea
                value={data}
                onChange={(e) => setData(e.target.value)}
                rows={rows}
                disabled={readOnly}
                className={`w-full border border-slate-200 rounded-xl px-2 py-1 text-sm ${readOnly ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-700'} focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/30 transition-all shadow-inner placeholder:text-slate-400 resize-none flex-1`}
                placeholder="Enter block data..."
            />
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
            onMineClick={onMineClick}
            onClose={onClose}
        />
    );
}
