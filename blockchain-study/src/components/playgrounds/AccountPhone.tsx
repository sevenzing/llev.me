"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Send, Wallet, RefreshCcw, ChevronLeft, ChevronRight, Activity, AlertTriangle, X, Check } from 'lucide-react';
import { Phone } from '../ui/Phone';
import { useLanguage } from '@/contexts/LanguageContext';
import { Transaction } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { ACCOUNTS, ec } from "@/lib/constants";

interface AccountPhoneProps {
    onSendTransaction: (tx: Transaction) => void;
    balances?: Record<string, number>;
}

export function AccountPhone({ onSendTransaction, balances }: AccountPhoneProps) {
    const { t } = useLanguage();
    const [currentAccountIdx, setCurrentAccountIdx] = useState(0);
    const [recipient, setRecipient] = useState(ACCOUNTS[1].name); // Default to Bob
    const [amount, setAmount] = useState((Math.floor(Math.random() * 9) + 1).toString());
    const [fee, setFee] = useState('0.1');
    const [isSending, setIsSending] = useState(false);
    const [signature, setSignature] = useState('');
    const [direction, setDirection] = useState(0);
    const [showWarning, setShowWarning] = useState(false);

    const activeAccount = ACCOUNTS[currentAccountIdx];
    const keyPair = ec.keyFromPrivate(activeAccount.privateKey);
    const publicKey = keyPair.getPublic('hex');
    const address = `0x${publicKey.slice(-40)}`;

    const isSelfSend = recipient === activeAccount.name;

    const switchAccount = (dir: 'next' | 'prev') => {
        setSignature(''); // Reset signature when switching account
        let nextIdx;
        if (dir === 'next') {
            setDirection(1);
            nextIdx = (currentAccountIdx + 1) % ACCOUNTS.length;
        } else {
            setDirection(-1);
            nextIdx = (currentAccountIdx - 1 + ACCOUNTS.length) % ACCOUNTS.length;
        }
        setCurrentAccountIdx(nextIdx);

        // Auto-switch recipient if it becomes the same as active account
        const nextAccount = ACCOUNTS[nextIdx];
        if (recipient === nextAccount.name) {
            const otherAccounts = ACCOUNTS.filter(a => a.name !== nextAccount.name);
            setRecipient(otherAccounts[0].name);
        }
    };

    // Reset signature when inputs change
    useEffect(() => {
        setSignature('');
    }, [recipient, amount, fee]);

    const handleSign = async () => {
        try {
            const recipientAccount = ACCOUNTS.find(a => a.name === recipient);
            const recipientAddress = recipientAccount
                ? `0x${ec.keyFromPrivate(recipientAccount.privateKey).getPublic('hex').slice(-40)}`
                : '0x0000000000000000000000000000000000000000';

            const txData = {
                from: address,
                to: recipientAddress,
                amount: parseFloat(amount),
                fee: parseFloat(fee)
            };

            const msgBuffer = new TextEncoder().encode(JSON.stringify(txData));
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const sig = keyPair.sign(hashArray).toDER('hex');
            setSignature(sig);
        } catch (e) {
            console.error(e);
        }
    };

    const [balanceWarning, setBalanceWarning] = useState(false);

    const handleSendClick = () => {
        const amountNum = parseFloat(amount) || 0;
        const feeNum = parseFloat(fee) || 0;
        const total = amountNum + feeNum;
        const currentBalance = balances ? (balances[activeAccount.name] || 0) : Infinity;

        if (total > currentBalance && !balanceWarning) {
            setBalanceWarning(true);
            return;
        }

        if (!signature) {
            setShowWarning(true);
        } else {
            handleSend(true);
        }
    };

    const handleSend = async (isValidSignature: boolean) => {
        setIsSending(true);
        setShowWarning(false);

        try {
            const recipientAccount = ACCOUNTS.find(a => a.name === recipient);
            const recipientAddress = recipientAccount
                ? `0x${ec.keyFromPrivate(recipientAccount.privateKey).getPublic('hex').slice(-40)}`
                : '0x0000000000000000000000000000000000000000';

            const txData = {
                from: address,
                to: recipientAddress,
                amount: parseFloat(amount),
                fee: parseFloat(fee)
            };

            const msgBuffer = new TextEncoder().encode(JSON.stringify(txData));
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const transaction: Transaction = {
                id: uuidv4(),
                ...txData,
                signature,
                hash: hashHex,
                isValid: isValidSignature
            };

            onSendTransaction(transaction);

            // Randomize inputs after send
            setTimeout(() => {
                setAmount((Math.floor(Math.random() * 9) + 1).toString());
                setFee((Math.random() * 0.09 + 0.01).toFixed(2));
                setSignature('');
                setIsSending(false);
            }, 800);
        } catch (e) {
            console.error(e);
            setIsSending(false);
        }
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95
        })
    };

    return (
        <div className="lg flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {t.mempool.phoneTitle}
                </h4>
            </div>

            <Phone
                overlay={
                    <AnimatePresence>
                        {showWarning && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="absolute inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-4"
                            >
                                <div className="bg-white rounded-2xl p-4 shadow-2xl w-full max-w-xs space-y-4 border border-red-100">
                                    <div className="flex flex-col items-center text-center gap-2">
                                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-1">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{t.mempool.unsignedTx}</h3>
                                        <p className="text-xs text-slate-500">
                                            {t.mempool.unsignedTxConfirm}
                                        </p>
                                        <div className="bg-red-50 p-2 rounded-lg border border-red-100 w-full">
                                            <p className="text-[10px] font-medium text-red-600">
                                                {t.mempool.unsignedTxWarning}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setShowWarning(false)}
                                            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                        >
                                            <X size={14} /> {t.nav.cancel}
                                        </button>
                                        <button
                                            onClick={() => handleSend(false)}
                                            className="py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Check size={14} /> {t.mempool.sendAnyway}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {balanceWarning && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-4"
                            >
                                <div className="bg-white rounded-2xl p-4 shadow-2xl w-full max-w-xs space-y-4 border border-amber-100">
                                    <div className="flex flex-col items-center text-center gap-2">
                                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 mb-1">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{t.mempool.insufficientBalance}</h3>
                                        <p className="text-xs text-slate-500">
                                            {t.mempool.insufficientBalanceDesc(
                                                activeAccount.name,
                                                balances?.[activeAccount.name] || 0,
                                                (parseFloat(amount) || 0) + (parseFloat(fee) || 0)
                                            )}
                                        </p>
                                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 w-full">
                                            <p className="text-[10px] font-medium text-amber-600">
                                                {t.mempool.insufficientBalanceWarning}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setBalanceWarning(false)}
                                            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                        >
                                            <X size={14} /> {t.nav.cancel}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setBalanceWarning(false);
                                                if (!signature) setShowWarning(true);
                                                else handleSend(true);
                                            }}
                                            className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Check size={14} /> {t.mempool.sendAnyway}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                }
            >
                <div className="flex flex-col h-full space-y-4">
                    {/* Header / StatusBar */}
                    <div className="flex items-center justify-between px-1 mb-2">
                        <div className="flex items-center gap-1.5 font-bold text-slate-400 text-[10px] tracking-tight">
                            <Activity size={10} className="text-blue-500" />
                            {t.mempool.connected}
                        </div>
                    </div>

                    {/* Account Switcher - Gallery Mode */}
                    <div className="relative group min-h-[140px]">
                        <AnimatePresence initial={false} custom={direction} mode="popLayout">
                            <motion.div
                                key={currentAccountIdx}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                className={`absolute inset-0 p-4 rounded-2xl ${activeAccount.color} shadow-lg relative overflow-hidden flex flex-col justify-between`}
                            >
                                <div className="absolute top-0 right-0 p-1 opacity-20 transform translate-x-1 translate-y--1">
                                    <Wallet size={80} />
                                </div>

                                <div className="relative z-10 space-y-1">
                                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{t.mempool.phoneTitle}</p>
                                    <h3 className="text-2xl font-black text-white flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2">
                                            {activeAccount.icon} {activeAccount.name}
                                        </div>
                                        {balances && (
                                            <div className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                                                {balances[activeAccount.name] || 0} <small className="text-[10px] opacity-70">COINS</small>
                                            </div>
                                        )}
                                    </h3>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/20">
                                    <p className="text-[9px] font-mono text-white/60 truncate">{address}</p>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <button
                            onClick={() => switchAccount('prev')}
                            className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all z-20"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => switchAccount('next')}
                            className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all z-20"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Transaction Form */}
                    <div className="flex-1 space-y-3 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.transactions.to}</label>
                            <div className="flex gap-2">
                                {ACCOUNTS.map(acc => (
                                    <button
                                        key={acc.name}
                                        onClick={() => setRecipient(acc.name)}
                                        disabled={acc.name === activeAccount.name}
                                        className={`flex-1 py-2 rounded-xl border-2 transition-all font-bold text-xs ${recipient === acc.name
                                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                                            : acc.name === activeAccount.name
                                                ? 'border-slate-50 bg-slate-50 text-slate-200 cursor-not-allowed'
                                                : 'border-slate-100 bg-white text-slate-400'
                                            }`}
                                    >
                                        {acc.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.transactions.amount}</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-white border-2 border-slate-100 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.transactions.fee}</label>
                                <input
                                    type="number"
                                    value={fee}
                                    onChange={(e) => setFee(e.target.value)}
                                    step="0.01"
                                    className="w-full bg-white border-2 border-slate-100 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 space-y-2">
                        <div className="flex gap-2">
                            <button
                                onClick={handleSign}
                                disabled={isSending || isSelfSend || !!signature}
                                className={`flex-1 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${signature
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-none'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <User size={14} />
                                {signature ? "Signed" : t.mempool.sign}
                            </button>

                            <button
                                onClick={handleSendClick}
                                disabled={isSending || isSelfSend}
                                className={`flex-1 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${!signature
                                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'
                                    } disabled:cursor-not-allowed`}
                            >
                                {isSending ? (
                                    <RefreshCcw size={14} className="animate-spin" />
                                ) : (
                                    <>
                                        <Send size={14} />
                                        {t.mempool.send}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </Phone>
        </div>
    );
}
