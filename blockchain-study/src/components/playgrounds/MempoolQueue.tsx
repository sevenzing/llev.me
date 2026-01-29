"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, TrendingUp, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface MempoolQueueProps {
    transactions: Transaction[];
    onRemove: (id: string) => void;
}

export function MempoolQueue({ transactions, onRemove }: MempoolQueueProps) {
    const { t } = useLanguage();

    return (
        <div className="w-full lg:w-72 h-[38rem] flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {t.mempool.queueTitle}
                    <span className="ml-2 bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 text-[10px]">
                        {transactions.length}
                    </span>
                </h4>
            </div>

            {/* The "Cup" container -- Updated to match MinerNode glass style */}
            <div className="flex-1 bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden flex flex-col border border-white/50 ring-1 ring-white/20">
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-8">
                    <AnimatePresence mode="popLayout">
                        {transactions.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 opacity-50"
                            >
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center">
                                    <TrendingUp size={24} />
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest">{t.mempool.emptyQueue}</p>
                            </motion.div>
                        ) : (
                            transactions.map((tx) => (
                                <motion.div
                                    key={tx.id}
                                    layout
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8, x: 20 }}
                                    className="bg-white rounded-2xl p-3 border-2 shadow-sm transition-all group relative overflow-visible"
                                    style={{
                                        borderColor: tx.isValid ? '#f1f5f9' : '#fee2e2', // slate-100 vs red-100
                                    }}
                                >
                                    {/* Hover Tooltip for Invalid */}
                                    {!tx.isValid && (
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                            {t.mempool.unsignedTx}
                                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-slate-400">
                                                <span className="truncate w-12">{tx.from.slice(0, 8)}...</span>
                                                <span className="text-blue-500">→</span>
                                                <span className="truncate w-12">{tx.to.slice(0, 8)}...</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                {tx.isValid ? (
                                                    <CheckCircle size={8} className="text-emerald-500" />
                                                ) : (
                                                    <AlertCircle size={8} className="text-red-500" />
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onRemove(tx.id)}
                                            className="p-1.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="text-sm font-black text-slate-800">{tx.amount}</span>
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">COINS</span>
                                        </div>
                                        <div className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg flex items-center gap-1">
                                            <span className="text-[9px] font-black">+{tx.fee}</span>
                                            <TrendingUp size={8} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Info Tip */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-md rounded-2xl p-2.5 border border-slate-100 shadow-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-500 flex items-center justify-center flex-shrink-0">
                        <Info size={12} />
                    </div>
                    <p className="text-[9px] font-medium text-slate-500 leading-tight">
                        {t.mempool.feeTip}
                    </p>
                </div>
            </div>
        </div>
    );
}
