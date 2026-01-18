"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pickaxe, Box, Eye, EyeOff, Cpu, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MinerNodeProps {
    onMine: () => void;
    isMining: boolean;
    blockCount: number;
    txMined: number;
    showChain: boolean;
    onToggleChain: () => void;
    miningProgress: number; // 0 to 100
}

export function MinerNode({ onMine, isMining, blockCount, txMined, showChain, onToggleChain, miningProgress }: MinerNodeProps) {
    const { t } = useLanguage();

    return (
        <div className="w-full lg:w-72 h-[38rem] flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {t.mempool.minerTitle}
                </h4>
            </div>

            <div className="flex-1 bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden flex flex-col border border-white/50 ring-1 ring-white/20">
                {/* Background Animation for Mining */}
                <AnimatePresence>
                    {isMining && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 animate-pulse" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative z-10 flex-1 flex flex-col">
                    {/* Stats Header */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="bg-white/50 backdrop-blur-md rounded-2xl p-3 border border-white/50 shadow-sm">
                            <h5 className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.mempool.blocksProduced}</h5>
                            <div className="flex items-center gap-2">
                                <Box size={14} className="text-blue-500" />
                                <span className="text-lg font-black text-slate-800">{blockCount}</span>
                            </div>
                        </div>
                        <div className="bg-white/50 backdrop-blur-md rounded-2xl p-3 border border-white/50 shadow-sm">
                            <h5 className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.mempool.transactionsSaved}</h5>
                            <div className="flex items-center gap-2">
                                <Zap size={14} className="text-yellow-500" />
                                <span className="text-lg font-black text-slate-800">{txMined}</span>
                            </div>
                        </div>
                    </div>

                    {/* Central Mining Visual */}
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                        <div className="relative flex items-center justify-center">
                            {/* Outer Glow / Pulse Rings */}
                            <AnimatePresence>
                                {isMining && (
                                    <>
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1.2, opacity: 0.15 }}
                                            exit={{ scale: 1.5, opacity: 0 }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                                            className="absolute w-40 h-40 rounded-full bg-blue-500/20 blur-xl"
                                        />
                                        <motion.div
                                            initial={{ scale: 1, opacity: 0 }}
                                            animate={{ scale: 1.4, opacity: 0.1 }}
                                            exit={{ scale: 1.8, opacity: 0 }}
                                            transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeOut" }}
                                            className="absolute w-40 h-40 rounded-full bg-purple-500/20 blur-xl"
                                        />
                                    </>
                                )}
                            </AnimatePresence>

                            <div className={`w-32 h-32 rounded-full border-[6px] transition-all duration-500 flex items-center justify-center relative z-10 ${isMining ? 'border-blue-500/30 bg-white/40 backdrop-blur-md shadow-[0_0_40px_rgba(59,130,246,0.1)]' : 'border-slate-100 bg-white/20'
                                }`}>
                                <Cpu size={44} className={`transition-all duration-700 ${isMining ? 'text-blue-500' : 'text-slate-200'}`}
                                    style={{ transform: isMining ? 'rotate(360deg)' : 'none', transition: isMining ? 'transform 3s linear infinite' : 'transform 0.7s ease' }}
                                />

                                {/* Mining Progress Ring */}
                                {isMining && (
                                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="59"
                                            stroke="currentColor"
                                            strokeWidth="6"
                                            fill="transparent"
                                            className="text-blue-500 transition-[stroke-dashoffset] duration-300 ease-out"
                                            strokeDasharray={370}
                                            strokeDashoffset={370 - (370 * Math.min(100, Math.max(0, miningProgress))) / 100}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                )}
                            </div>

                            <AnimatePresence>
                                {isMining && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-2 shadow-lg z-20"
                                    >
                                        <Pickaxe size={16} className="animate-bounce" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="text-center space-y-1">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">
                                {isMining ? t.block.mining : 'Node Idle'}
                            </h3>
                            {isMining && (
                                <p className="text-[10px] font-bold text-blue-500 font-mono">Searching valid nonce...</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 space-y-3">
                        <button
                            onClick={onMine}
                            disabled={isMining}
                            className={`w-full py-4 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 ${isMining
                                ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-wait'
                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'
                                }`}
                        >
                            <Pickaxe size={18} />
                            {t.mempool.mineButton}
                        </button>

                        <button
                            onClick={onToggleChain}
                            className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                        >
                            {showChain ? <EyeOff size={14} /> : <Eye size={14} />}
                            {showChain ? t.mempool.hideChain : t.mempool.showChain}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
