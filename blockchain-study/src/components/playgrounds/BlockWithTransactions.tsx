"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Transaction } from "@/lib/types";
import { hashIsValid } from "@/lib/blockchain";

import { BaseBlock } from "./BaseBlock";

interface BlockWithTransactionsProps {
    blockNumber: number;
    prevHash: string;
    transactions: Transaction[];
    nonce: number;
    hash: string;
    size?: 'small' | 'large';
    fixedHeight?: boolean;
}

export function BlockWithTransactions({
    blockNumber,
    prevHash,
    transactions = [],
    nonce,
    hash,
    size = 'small',
    fixedHeight = false
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

    const dataContent = (
        <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
            <div className={`${classes.txList} overflow-y-auto no-scrollbar border border-slate-100 rounded-xl bg-slate-50/50 p-2 space-y-2 shadow-inner flex-1`}>
                {transactions.length === 0 ? (
                    <div className={`${classes.text} text-slate-300 italic text-left py-2 px-1`}>
                        No transactions
                    </div>
                ) : (
                    transactions.map((tx, idx) => (
                        <div key={tx.id || idx} className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm flex flex-col gap-1">
                            <div className="flex justify-between text-[9px] font-bold">
                                <span className="text-slate-400 truncate w-20">{tx.from.slice(0, 8)}...</span>
                                <span className="text-blue-500">→</span>
                                <span className="text-slate-400 truncate w-20 text-right">...{tx.to.slice(-8)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-700">{tx.amount} <small className="text-[8px] opacity-60">COINS</small></span>
                                <span className="text-[8px] font-medium text-slate-400">Fee: {tx.fee}</span>
                            </div>
                        </div>
                    ))
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
        />
    );
}
