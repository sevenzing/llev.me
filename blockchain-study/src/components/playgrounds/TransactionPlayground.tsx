"use client";

import React, { useState, useEffect } from 'react';
import { ec as EC } from 'elliptic';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Coins, Receipt, PenTool, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CardBackground } from '../ui/CardBackground';

const ec = new EC('secp256k1');

// Deterministic key for initial state (matching KeysAndSignatures for consistency)
const INITIAL_PRIVATE_KEY = "18e14a7b6a307f426a94f8114701e7c8e774e7f9a47e2c2035db29a206321725";

export function TransactionPlayground() {
    const { t } = useLanguage();

    // Internal Wallet State
    const [privateKey] = useState(INITIAL_PRIVATE_KEY);
    const keyPair = ec.keyFromPrivate(privateKey);
    const publicKey = keyPair.getPublic('hex');
    const senderAddress = `0x${publicKey.slice(-40)}`;

    // Transaction State
    const [recipient, setRecipient] = useState('0xc0De20A37E2dAC848F81A93BD85FE4ACDdE7C0DE');
    const [amount, setAmount] = useState('50');
    const [fee, setFee] = useState('0.50');
    const [signature, setSignature] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [txHash, setTxHash] = useState('');

    // Get the raw data string for the transaction
    const getTransactionData = () => {
        return JSON.stringify({
            from: senderAddress,
            to: recipient,
            amount,
            fee
        });
    };

    // Calculate Transaction Hash (Data + Signature)
    useEffect(() => {
        const calcTxHash = async () => {
            const dataWithSig = getTransactionData() + signature;
            const msgBuffer = new TextEncoder().encode(dataWithSig);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            setTxHash(hashHex);
        };
        calcTxHash();
    }, [recipient, amount, fee, signature]);

    // Sign the transaction
    const signTransaction = async () => {
        try {
            const data = getTransactionData();
            const msgBuffer = new TextEncoder().encode(data);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));

            const sig = keyPair.sign(hashArray).toDER('hex');
            setSignature(sig);
        } catch (e) {
            console.error(e);
        }
    };

    // Verify signature automatically
    useEffect(() => {
        const verify = async () => {
            if (!signature) {
                setIsValid(false);
                return;
            }

            try {
                const data = getTransactionData();
                const msgBuffer = new TextEncoder().encode(data);
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));

                const valid = keyPair.verify(hashArray, signature);
                setIsValid(valid);
            } catch {
                setIsValid(false);
            }
        };
        verify();
    }, [recipient, amount, fee, signature]);

    return (
        <div className="w-full max-w-2xl mx-auto">
            <CardBackground className="p-8 space-y-6 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -m-8 opacity-5">
                    <Send size={200} />
                </div>

                {/* Header */}
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Receipt size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{t.transactions.title}</h3>
                        <p className="text-sm text-slate-500 font-medium">Create and sign a network transfer</p>
                    </div>
                </div>

                {/* Transaction Form */}
                <div className="space-y-4 relative z-10">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 h-4">
                            <User size={12} /> {t.transactions.from}
                        </label>
                        <div className="w-full h-10 px-3 flex items-center bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-500 truncate shadow-inner">
                            {senderAddress}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 h-4">
                            <ArrowRight size={12} /> {t.transactions.to}
                        </label>
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                            placeholder="0x..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 h-4">
                                <Coins size={12} /> {t.transactions.amount}
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm m-0"
                                step="0.01"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 h-4">
                                <PenTool size={12} /> {t.transactions.fee}
                            </label>
                            <input
                                type="number"
                                value={fee}
                                onChange={(e) => setFee(e.target.value)}
                                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm m-0"
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>

                {/* Signature Section */}
                <div className="pt-2 space-y-4 relative z-10">
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {t.transactions.signature}
                            </label>
                            <AnimatePresence mode="wait">
                                {signature && (
                                    <motion.span
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isValid
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {isValid ? t.transactions.statusValid : t.transactions.statusInvalid}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className={`w-full p-3 rounded-xl font-mono text-[10px] break-all min-h-[50px] flex items-center shadow-inner transition-colors duration-300 ${!signature
                            ? 'bg-slate-50 border border-slate-100 text-slate-300 italic'
                            : isValid
                                ? 'bg-emerald-50 border border-emerald-100 text-emerald-800'
                                : 'bg-red-50 border border-red-100 text-red-800'
                            }`}>
                            {signature || "Transaction not signed yet..."}
                        </div>
                    </div>

                    {/* Transaction Hash */}
                    <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {t.transactions.txHash}
                        </label>
                        <div className="w-full p-3 bg-slate-900/5 border border-slate-200 rounded-xl font-mono text-[10px] text-slate-600 break-all shadow-inner">
                            {txHash}
                        </div>
                    </div>

                    <button
                        onClick={signTransaction}
                        disabled={isValid && signature !== ''}
                        className={`w-full py-3 rounded-2xl font-bold text-sm shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isValid && signature !== ''
                            ? 'bg-slate-100 text-slate-400 shadow-none'
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'
                            }`}
                    >
                        {isValid && signature !== '' ? <CheckCircle2 size={16} /> : <PenTool size={16} />}
                        {isValid && signature !== '' ? 'Signed & Verified' : t.transactions.sign}
                    </button>

                    {!isValid && signature !== '' && (
                        <p className="text-center text-[11px] text-red-500 font-bold animate-pulse">
                            ⚠️ Transaction data has been modified! Re-sign required.
                        </p>
                    )}
                </div>
            </CardBackground>
        </div>
    );
}
