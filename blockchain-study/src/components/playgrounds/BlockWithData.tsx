"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { hashIsValid } from "@/lib/blockchain";
import { Trash2 } from "lucide-react";

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

    const isValid = hashIsValid(hash);
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
            className={`${classes.container} ${classes.spacing} bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-5 font-mono ring-1 ring-white/50 relative group`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className={`flex justify-between items-center ${classes.text}`}>
                <span className="font-bold text-slate-700/80 tracking-wide">Block #{blockNumber}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${isValid
                    ? 'bg-emerald-400/20 text-emerald-700 border-emerald-400/30'
                    : 'bg-red-400/20 text-red-700 border-red-400/30'
                    }`}>
                    {isValid ? '✓ Valid' : '✗ Invalid'}
                </span>
            </div>

            <div className={classes.spacing}>
                {/* ... inputs ... */}
                <div>
                    <label className={`block text-slate-500 font-semibold mb-1.5 ml-1 ${classes.text}`}>Nonce</label>
                    <input
                        type="number"
                        value={nonce}
                        onChange={(e) => onNonceChange?.(parseInt(e.target.value) || 0)}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        disabled={isMining}
                        className={`w-full border rounded-xl ${classes.input} ${isMining ? 'bg-slate-100/50 text-slate-400' : 'bg-white/50 text-slate-700'} border-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/30 transition-all shadow-inner`}
                    />
                </div>

                <div>
                    <label className={`block text-slate-500 font-semibold mb-1.5 ml-1 ${classes.text}`}>Data</label>
                    <input
                        type="text"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        className={`w-full border border-white/40 rounded-xl ${classes.input} bg-white/50 backdrop-blur-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/30 transition-all shadow-inner placeholder:text-slate-400`}
                        placeholder="Enter block data..."
                    />
                </div>

                <div>
                    <label className={`block text-slate-500 font-semibold mb-1.5 ml-1 ${classes.text}`}>Prev Hash</label>
                    <div
                        className={`w-full border border-white/30 rounded-xl ${classes.input} bg-slate-50/50 backdrop-blur-sm text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap shadow-inner`}
                    >
                        {prevHash || '\u00A0'}
                    </div>
                </div>

                <div>
                    <label className={`block text-slate-500 font-semibold mb-1.5 ml-1 ${classes.text}`}>Hash</label>
                    <div
                        className={`w-full border border-white/30 rounded-xl ${classes.input} ${isMining ? 'bg-yellow-100/40 text-yellow-700 animate-pulse' :
                            isValid ? 'bg-emerald-50/40 text-emerald-700' : 'bg-red-50/40 text-red-700'
                            } backdrop-blur-sm font-bold overflow-hidden text-ellipsis whitespace-nowrap shadow-inner`}
                    >
                        {(isMining ? miningHash : displayHash) || '\u00A0'}
                    </div>
                </div>

                <div className="flex gap-2 items-stretch">
                    {onMineClick && (
                        <button
                            onClick={onMineClick}
                            disabled={isMining}
                            className={`flex-1 bg-gradient-to-r from-blue-500/90 to-indigo-600/90 backdrop-blur-md text-white font-bold rounded-xl ${classes.button
                                } hover:from-blue-600 hover:to-indigo-700 transition-all disabled:from-slate-400/50 disabled:to-slate-500/50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-[0.98] border border-white/20`}
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
                            className={`px-2 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all ${!onMineClick ? 'w-full py-2' : ''}`}
                            title="Remove Block"
                        >
                            <Trash2 className="w-5 h-5" strokeWidth={2} />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
