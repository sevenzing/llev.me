"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { hashIsValid } from "@/lib/blockchain";

interface BaseBlockProps {
    blockNumber: number;
    prevHash: string;
    nonce: number;
    hash: string;
    dataTitle: string;
    dataContent: React.ReactNode;
    onNonceChange?: (nonce: number) => void;
    isValid?: boolean;
    size?: 'small' | 'large';
    fixedHeight?: boolean;
    isMining?: boolean;
    miningHash?: string;
    readOnly?: boolean;
    onMineClick?: () => void;
    onClose?: () => void;
}

export function BaseBlock({
    blockNumber,
    prevHash,
    nonce,
    hash,
    dataTitle,
    dataContent,
    onNonceChange,
    isValid: propIsValid,
    size = 'small',
    fixedHeight = false,
    isMining = false,
    miningHash,
    readOnly = false,
    onMineClick,
    onClose
}: BaseBlockProps) {
    const isValid = propIsValid !== undefined ? propIsValid : hashIsValid(hash);

    const sizeClasses = {
        small: {
            container: "w-64",
            text: "text-sm",
            title: "text-sm",
            spacing: "p-5 space-y-3",
        },
        large: {
            container: "w-80",
            text: "text-md",
            title: "text-md",
            spacing: "p-6 space-y-4",
        }
    };

    const classes = sizeClasses[size];

    return (
        <motion.div
            className={`${classes.container} ${fixedHeight ? 'h-[420px]' : 'min-h-[420px]'} bg-white rounded-3xl shadow-lg border border-slate-200 p-5 font-mono relative overflow-hidden flex flex-col justify-between`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex flex-col flex-1 justify-between">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <span className={`${classes.title} font-bold text-slate-700 tracking-wide`}>Block #{blockNumber}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-sm ${isValid
                        ? 'bg-emerald-400/20 text-emerald-700 border-emerald-400/30'
                        : 'bg-red-400/20 text-red-700 border-red-400/30'
                        }`}>
                        {isValid ? '✓ Valid' : '✗ Invalid'}
                    </span>
                </div>

                {/* Main Content Area (Data or Transactions) */}
                <div className="flex-1 flex flex-col min-h-0 min-w-0">
                    <label className={`${classes.text} block text-slate-500 font-semibold mb-1 ml-1`}>{dataTitle}</label>
                    <div className="flex-1 flex flex-col min-h-0">
                        {dataContent}
                    </div>
                    <div className="flex gap-2 items-stretch mt-2">
                        {onMineClick && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMineClick();
                                }}
                                disabled={isMining}
                                className={`flex-[3] backdrop-blur-md text-white font-bold rounded-xl py-1.5 text-xs transition-all disabled:from-slate-400/50 disabled:to-slate-500/50 disabled:cursor-not-allowed shadow-lg active:scale-[0.98] border border-white/20 flex items-center justify-center gap-2 ${isMining
                                    ? 'bg-slate-400/50 from-slate-400/50 to-slate-500/50'
                                    : isValid
                                        ? 'bg-emerald-500/80 hover:bg-emerald-600 shadow-emerald-500/20'
                                        : 'bg-gradient-to-r from-blue-500/90 to-indigo-600/90 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/20 hover:shadow-blue-500/40'
                                    }`}
                            >
                                {isMining ? (
                                    <>
                                        <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Mining...
                                    </>
                                ) : (
                                    <>{isValid ? '✓ Mined' : '⛏ Mine Block'}</>
                                )}
                            </button>
                        )}

                        {onClose && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClose();
                                }}
                                className={`flex-1 px-2 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all py-1.5`}
                                title="Remove Block"
                            >
                                <Trash2 className="w-5 h-5" strokeWidth={2} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-2 mt-4">
                    <div>
                        <label className={`${classes.text} block text-slate-500 font-semibold mb-1 ml-1`}>Nonce</label>
                        {onNonceChange ? (
                            <input
                                type="number"
                                value={nonce}
                                onChange={(e) => onNonceChange(parseInt(e.target.value) || 0)}
                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                disabled={isMining || readOnly}
                                className={`w-full border border-slate-200 rounded-xl px-2 py-1 ${classes.text} ${isMining || readOnly ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-700'} focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/30 transition-all shadow-inner font-mono`}
                            />
                        ) : (
                            <div className={`w-full border border-slate-200 rounded-xl px-2 py-1 ${classes.text} bg-slate-50 text-slate-500 font-mono shadow-inner`}>
                                {nonce}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className={`${classes.text} block text-slate-500 font-semibold mb-1 ml-1`}>Prev Hash</label>
                        <div className={`w-full border border-slate-200 rounded-xl px-2 py-1 ${classes.text} bg-slate-50 text-slate-500 font-mono truncate shadow-inner`}>
                            {prevHash || '0'}
                        </div>
                    </div>

                    <div>
                        <label className={`${classes.text} block text-slate-500 font-semibold mb-1 ml-1`}>Hash</label>
                        <div
                            className={`w-full border border-slate-200 rounded-xl px-2 py-1 ${classes.text} font-mono break-all shadow-inner ${isMining ? 'bg-yellow-100/40 text-yellow-700 animate-pulse' :
                                isValid ? 'bg-emerald-50/40 text-emerald-700' : 'bg-red-50/40 text-red-700'
                                } font-bold`}
                            style={{ minHeight: '3em' }}
                        >
                            {(isMining ? miningHash : hash) || '\u00A0'}
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
