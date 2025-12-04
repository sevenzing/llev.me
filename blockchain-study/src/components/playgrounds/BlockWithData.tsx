"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface BlockWithDataProps {
    blockNumber?: number;
    prevHash?: string;
    initialData?: string;
    onBlockChange?: (hash: string) => void;
    size?: 'small' | 'large';
}

export function BlockWithData({
    blockNumber = 1,
    prevHash = "0000000000000000000000000000000000000000000000000000000000000000",
    initialData = "",
    onBlockChange,
    size = 'small'
}: BlockWithDataProps) {
    const [nonce, setNonce] = useState(0);
    const [data, setData] = useState(initialData);
    const [hash, setHash] = useState("");
    const [isMining, setIsMining] = useState(false);

    const debouncedData = useDebounce(data, 300);

    const calculateHash = useCallback(async (bNum: number, pNonce: number, pData: string, pPrevHash: string) => {
        const str = bNum + pNonce + pData + pPrevHash;
        const msgBuffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }, []);

    useEffect(() => {
        const updateHash = async () => {
            const newHash = await calculateHash(blockNumber, nonce, debouncedData, prevHash);
            setHash(newHash);
        };
        if (!isMining) {
            updateHash();
        }
    }, [blockNumber, nonce, debouncedData, prevHash, calculateHash, isMining]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            onBlockChange?.(hash);
        }, 500);

        return () => clearTimeout(timeout);
    }, [hash, onBlockChange]);

    const mine = async () => {
        setIsMining(true);
        let currentNonce = nonce;
        let currentHash = hash;

        const target = "0000";
        const batchSize = 500;

        while (!currentHash.startsWith(target)) {
            for (let i = 0; i < batchSize; i++) {
                currentNonce++;
                currentHash = await calculateHash(blockNumber, currentNonce, debouncedData, prevHash);
                if (currentHash.startsWith(target)) break;
            }

            setNonce(currentNonce);
            setHash(currentHash);

            await new Promise(resolve => setTimeout(resolve, 0));
        }

        setNonce(currentNonce);
        setHash(currentHash);
        setIsMining(false);
        onBlockChange?.(currentHash);
    };

    const isValid = hash.startsWith("0000");

    if (size === 'large') {
        return (
            <div className={`p-6 rounded-xl shadow-lg border-2 ${isValid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} max-w-md w-full`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-heading font-bold text-slate-800">Block #{blockNumber}</h3>
                    {isValid && <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">SIGNED</span>}
                    {!isValid && <span className="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">INVALID</span>}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nonce</label>
                        <input
                            type="number"
                            value={nonce}
                            onChange={(e) => setNonce(parseInt(e.target.value) || 0)}
                            className="w-full p-3 rounded-lg border-2 border-slate-300 font-mono text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data</label>
                        <input
                            type="text"
                            value={data}
                            onChange={(e) => setData(e.target.value)}
                            className="w-full p-3 rounded-lg border-2 border-slate-300 font-mono text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prev Hash</label>
                        <div className="w-full p-3 rounded-lg bg-slate-100 border-2 border-slate-200 font-mono text-sm text-slate-600 break-all">
                            {prevHash}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hash</label>
                        <div className={`w-full p-3 rounded-lg border-2 font-mono text-sm break-all ${isValid ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                            {hash || 'Calculating...'}
                        </div>
                    </div>

                    <button
                        onClick={mine}
                        disabled={isMining}
                        className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm font-bold"
                    >
                        {isMining ? 'Mining...' : 'Mine'}
                    </button>
                </div>
            </div>
        );
    }

    // Small size (default)
    return (
        <div className={`p-3 rounded-lg shadow border-2 ${isValid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} w-52`}>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-heading font-bold text-slate-800">Block #{blockNumber}</h3>
                {isValid && <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">✓</span>}
                {!isValid && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">✗</span>}
            </div>

            <div className="space-y-1.5">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Nonce</label>
                    <input
                        type="number"
                        value={nonce}
                        onChange={(e) => setNonce(parseInt(e.target.value) || 0)}
                        className="w-full p-1.5 rounded border border-slate-300 font-mono text-xs"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Data</label>
                    <input
                        type="text"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        className="w-full p-1.5 rounded border border-slate-300 font-mono text-xs"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Prev Hash</label>
                    <div className="w-full p-1.5 rounded bg-slate-100 border border-slate-200 font-mono text-xs text-slate-600 break-all">
                        {prevHash.slice(0, 16)}...
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Hash</label>
                    <div className={`w-full p-1.5 rounded border font-mono text-xs break-all ${isValid ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                        {hash || 'Calculating...'}
                    </div>
                </div>

                <button
                    onClick={mine}
                    disabled={isMining}
                    className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-xs font-bold"
                >
                    {isMining ? 'Mining...' : 'Mine'}
                </button>
            </div>
        </div>
    );
}
