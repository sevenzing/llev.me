"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Transaction } from "@/lib/types";
import { hashIsValid } from "@/lib/blockchain";
import { AlertCircle, CheckCircle } from 'lucide-react';

import { BaseBlock } from "./BaseBlock";

interface BlockWithTransactionsProps {
    blockNumber: number;
    prevHash: string;
    transactions: Transaction[];
    nonce: number;
    hash: string;
    size?: 'small' | 'large';
    fixedHeight?: boolean;
    onMineClick?: () => void;
    isMining?: boolean;
    miningHash?: string;
    blockIndex?: number;
    blockchain?: any[];
    onRemoveBlock?: () => void;
    validateTransaction?: (tx: any, blockchain: any[], blockIndex: number) => Promise<{ valid: boolean; reason?: string }>;
}

export function BlockWithTransactions({
    blockNumber,
    prevHash,
    transactions = [],
    nonce,
    hash,
    size = 'small',
    fixedHeight = false,
    onMineClick,
    onRemoveBlock,
    isMining,
    miningHash,
    validateTransaction,
    blockchain,
    blockIndex
}: BlockWithTransactionsProps) {
    const sizeClasses = {
        small: {
            text: "text-sm",
            txList: "max-h-24"
        },
        large: {
            text: "text-md",
            txList: "max-h-36"
        }
    };

    const classes = sizeClasses[size];
    const dataTitle = `Transactions (${transactions.length})`;

    const [txStatuses, setTxStatuses] = React.useState<Record<string, { valid: boolean; reason?: string }>>({});

    React.useEffect(() => {
        if (validateTransaction && blockchain && Array.isArray(transactions)) {
            transactions.forEach(async (tx) => {
                const result = await validateTransaction(tx, blockchain, blockIndex || 0);
                setTxStatuses(prev => ({ ...prev, [tx.id]: result }));
            });
        }
    }, [transactions, validateTransaction, blockchain, blockIndex]);

    const dataContent = (
        <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
            <div className={`${classes.txList} overflow-y-auto no-scrollbar border border-slate-100 rounded-xl bg-slate-50/50 p-2 space-y-2 shadow-inner flex-1`}>
                {transactions.length === 0 ? (
                    <div className={`${classes.text} text-slate-300 italic text-left py-2 px-1`}>
                        No transactions
                    </div>
                ) : (
                    transactions.map((tx, idx) => {
                        const status = txStatuses[tx.id];
                        const isValid = status?.valid ?? true;

                        return (
                            <div
                                key={tx.id || idx}
                                className={`p-2 rounded-lg border-2 transition-all group relative ${isValid
                                    ? 'bg-white border-slate-100 shadow-sm'
                                    : 'bg-red-50 border-red-200 shadow-md ring-1 ring-red-100'
                                    } flex flex-col gap-1`}
                                style={{
                                    borderColor: isValid ? '#f1f5f9' : '#fee2e2',
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-slate-400">
                                            <span className="truncate w-12">{tx.from.slice(0, 8)}...</span>
                                            <span className="text-blue-500">→</span>
                                            <span className="truncate w-12">...{tx.to.slice(-8)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            {isValid ? (
                                                <CheckCircle size={8} className="text-emerald-500" />
                                            ) : (
                                                <AlertCircle size={8} className="text-red-500" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-[10px] font-bold ${isValid ? 'text-slate-700' : 'text-red-700'}`}>
                                            {tx.amount} <small className="text-[8px] opacity-60">COINS</small>
                                        </span>
                                        <span className="text-[8px] font-medium text-slate-400">Fee: {tx.fee}</span>
                                    </div>
                                </div>

                                {/* Error Tooltip */}
                                {!isValid && status?.reason && (
                                    <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] py-1.5 px-2 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-[100] whitespace-nowrap pointer-events-none border border-white/10 ring-1 ring-black/5">
                                        {status.reason}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 -translate-y-1" />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>)

    return (
        <BaseBlock
            blockNumber={blockNumber}
            prevHash={prevHash}
            nonce={nonce}
            hash={hash}
            size={size}
            fixedHeight={fixedHeight}
            dataContent={dataContent}
            dataTitle={dataTitle}
            onMineClick={onMineClick}
            onClose={onRemoveBlock}
            isMining={isMining}
            miningHash={miningHash}
        />
    );
}
