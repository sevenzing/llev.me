"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

interface BlockMinerProps {
  blockNumber?: number;
  prevHash?: string;
  initialData?: string;
  onBlockChange?: (hash: string) => void;
}

export function BlockMiner({
  blockNumber = 1,
  prevHash = "0000000000000000000000000000000000000000000000000000000000000000",
  initialData = "",
  onBlockChange
}: BlockMinerProps) {
  const [nonce, setNonce] = useState(0);
  const [data, setData] = useState(initialData);
  const [hash, setHash] = useState("");
  const [isMining, setIsMining] = useState(false);

  // Debounce data to prevent freezing on rapid typing
  const debouncedData = useDebounce(data, 300);

  const calculateHash = useCallback(async (bNum: number, pNonce: number, pData: string, pPrevHash: string) => {
    const str = bNum + pNonce + pData + pPrevHash;
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }, []);

  // Update hash when inputs change (using debounced data)
  useEffect(() => {
    const updateHash = async () => {
      const newHash = await calculateHash(blockNumber, nonce, debouncedData, prevHash);
      setHash(newHash);
    };
    if (!isMining) {
      updateHash();
    }
  }, [blockNumber, nonce, debouncedData, prevHash, calculateHash, isMining]);

  // Debounce the onBlockChange callback to prevent cascade
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
    const batchSize = 500; // Increase batch size to reduce UI updates

    while (!currentHash.startsWith(target)) {
      // Run a batch of calculations without updating UI
      for (let i = 0; i < batchSize; i++) {
        currentNonce++;
        currentHash = await calculateHash(blockNumber, currentNonce, debouncedData, prevHash);
        if (currentHash.startsWith(target)) break;
      }

      // Update UI occasionally
      setNonce(currentNonce);
      setHash(currentHash);

      // Yield to main thread
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    setNonce(currentNonce);
    setHash(currentHash);
    setIsMining(false);
    onBlockChange?.(currentHash);
  };

  const isValid = hash.startsWith("0000");

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
