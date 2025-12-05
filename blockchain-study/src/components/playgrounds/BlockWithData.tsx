"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";

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
    isMining?: boolean;
    size?: 'small' | 'large';
    hashDisplay?: 'full' | 'truncated';
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
    isMining = false,
    size = 'small',
    hashDisplay = 'full'
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
        if (isMining && miningNonce !== undefined) {
            const calculateHash = async () => {
                const dataString = typeof data === 'string' ? data : JSON.stringify(data);
                const str = blockNumber + miningNonce + dataString + prevHash;
                const msgBuffer = new TextEncoder().encode(str);
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const currentHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
                setMiningHash(currentHash);
            };
            calculateHash();
        }
    }, [isMining, miningNonce, data, blockNumber, prevHash]);

    // Notify parent when data changes (debounced)
    useEffect(() => {
        if (debouncedData !== initialData) {
            onDataChange?.(debouncedData);
        }
    }, [debouncedData, initialData, onDataChange]);

    const isValid = hash.startsWith("0000");
    const displayHash = hashDisplay === 'truncated' && hash.length > 10
        ? `${hash.slice(0, 6)}...${hash.slice(-4)}`
        : hash;

    const sizeClasses = {
        small: {
            container: "w-64",
            text: "text-xs",
            input: "text-xs px-2 py-1",
            button: "text-xs px-3 py-1.5",
            spacing: "space-y-2"
        },
        large: {
            container: "w-80",
            text: "text-sm",
            input: "text-sm px-3 py-2",
            button: "text-sm px-4 py-2",
            spacing: "space-y-3"
        }
    };

    const classes = sizeClasses[size];

    return (
        <motion.div
            className={`${classes.container} ${classes.spacing} bg-white rounded-xl shadow-lg border-2 ${isValid ? 'border-emerald-400' : 'border-red-400'
                } p-4 font-mono`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className={`flex justify-between items-center ${classes.text}`}>
                <span className="font-bold text-slate-700">Block #{blockNumber}</span>
                <span className={`px-2 py-0.5 rounded text-white text-xs font-bold ${isValid ? 'bg-emerald-500' : 'bg-red-500'
                    }`}>
                    {isValid ? '✓ Valid' : '✗ Invalid'}
                </span>
            </div>

            <div className={classes.spacing}>
                <div>
                    <label className={`block text-slate-600 font-semibold mb-1 ${classes.text}`}>Nonce</label>
                    <input
                        type="number"
                        value={nonce}
                        onChange={(e) => onNonceChange?.(parseInt(e.target.value) || 0)}
                        disabled={isMining}
                        className={`w-full border border-slate-300 rounded ${classes.input} ${isMining ? 'bg-slate-50' : 'bg-white'} font-mono focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    />
                </div>

                <div>
                    <label className={`block text-slate-600 font-semibold mb-1 ${classes.text}`}>Data</label>
                    <input
                        type="text"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        className={`w-full border border-slate-300 rounded ${classes.input} font-mono focus:outline-none focus:ring-2 focus:ring-blue-400`}
                        placeholder="Enter block data..."
                    />
                </div>

                <div>
                    <label className={`block text-slate-600 font-semibold mb-1 ${classes.text}`}>Prev</label>
                    <input
                        type="text"
                        value={prevHash}
                        readOnly
                        className={`w-full border border-slate-300 rounded ${classes.input} bg-slate-50 font-mono text-slate-500 overflow-hidden text-ellipsis`}
                    />
                </div>

                <div>
                    <label className={`block text-slate-600 font-semibold mb-1 ${classes.text}`}>Hash</label>
                    <input
                        type="text"
                        value={isMining ? miningHash : displayHash}
                        readOnly
                        className={`w-full border border-slate-300 rounded ${classes.input} ${isMining ? 'bg-yellow-50 text-yellow-700 animate-pulse' :
                                isValid ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            } font-mono font-bold overflow-hidden text-ellipsis`}
                    />
                </div>

                {onMineClick && (
                    <button
                        onClick={onMineClick}
                        disabled={isMining}
                        className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg ${classes.button
                            } hover:from-purple-700 hover:to-blue-700 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg`}
                    >
                        {isMining ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Mining...
                            </span>
                        ) : (
                            '⛏ Mine'
                        )}
                    </button>
                )}
            </div>
        </motion.div>
    );
}
