"use client";

import React, { useState, useEffect } from 'react';
import { ec as EC } from 'elliptic';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Lock, Trash2, Plus, PenTool, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Phone } from '../ui/Phone';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocaleByLanguage, getHour12UsageByLanguage } from '@/lib/translations';

const ec = new EC('secp256k1');

// Deterministic key for E2E tests and consistent initial state
const INITIAL_PRIVATE_KEY = "18e14a7b6a307f426a94f8114701e7c8e774e7f9a47e2c2035db29a206321725";

interface Message {
    id: string;
    data: string;
    signature: string;
    timestamp: number;
}

export function KeysAndSignatures() {
    // Identity State
    const [privateKey, setPrivateKey] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const { t, language } = useLanguage();

    // Messages State
    const [messages, setMessages] = useState<Message[]>([]);

    // Generate mock address
    const toAddress = (pubKey: string) => {
        if (!pubKey) return "";
        return `0x${pubKey.slice(-40)}`;
    };

    // Helper for displaying truncated address
    const formatDisplayAddress = (addr: string) => {
        if (!addr) return "Not generated";
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const generateKeys = (useFixed = false) => {
        let key;
        if (useFixed) {
            key = ec.keyFromPrivate(INITIAL_PRIVATE_KEY);
        } else {
            key = ec.genKeyPair();
        }

        setPrivateKey(key.getPrivate('hex'));
        setPublicKey(key.getPublic('hex'));
        // Clear all signatures when identity changes as they are no longer valid for new key
        setMessages(msgs => msgs.map(m => ({ ...m, signature: '' })));
    };

    // Auto-generate keys on mount (deterministic)
    useEffect(() => {
        generateKeys(true);
    }, []);

    const addMessage = () => {
        const timestamp = new Date();
        const date = timestamp.toLocaleString(getLocaleByLanguage(language), {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: '2-digit',
            hour12: getHour12UsageByLanguage(language),
        });

        const newMessage: Message = {
            id: uuidv4(),
            data: t.keys.newMessageTemplate(date),
            signature: "",
            timestamp: timestamp.getTime()
        };
        setMessages([...messages, newMessage]);
    };

    const deleteMessage = (id: string) => {
        setMessages(messages.filter(m => m.id !== id));
    };

    const updateMessageData = (id: string, data: string) => {
        setMessages(messages.map(m =>
            m.id === id ? { ...m, data } : m
        ));
    };

    const signMessage = async (id: string) => {
        if (!privateKey) return;

        try {
            const message = messages.find(m => m.id === id);
            if (!message) return;

            const key = ec.keyFromPrivate(privateKey);

            // Hash the message data first (SHA-256)
            const msgBuffer = new TextEncoder().encode(message.data);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));

            // Sign the hash
            const signature = key.sign(hashArray).toDER('hex');

            setMessages(messages.map(m =>
                m.id === id ? { ...m, signature } : m
            ));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-16">

            {/* LEFT: IDENTITY PHONE */}
            <div className="shrink-0 flex justify-center w-full lg:w-auto">
                {/* Enforce a min-width on the container to prevent jumping during load/generation */}
                <div className="w-[20rem] h-[32rem]">
                    <Phone className="w-full h-full">
                        <div className="text-center space-y-1 mb-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 text-blue-400 rounded-full mb-2 shadow-inner ring-1 ring-white/10">
                                <Smartphone size={24} />
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm">Wallet Application</h4>
                            <p className="text-[10px] text-slate-500">Cryptographic Identity Management</p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => generateKeys(false)}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-blue-500/20"
                            >
                                Generate New ID
                            </button>

                            {/* Private Key */}
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Lock size={10} /> Private Key
                                </label>
                                <div className="text-[11px] w-full bg-red-50 border border-red-100 rounded-xl p-3 font-mono  text-red-800 break-all leading-tight shadow-sm">
                                    {privateKey ? `0x${privateKey}` : "Generating..."}
                                </div>
                                <div className="text-[9px] text-red-400 font-medium pl-1">
                                    ⚠️ Never share this key!
                                </div>
                            </div>

                            {/* Public Key */}
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <PenTool size={10} /> Public Key
                                </label>
                                <div className="text-[11px] w-full bg-emerald-50 border border-emerald-100 rounded-xl p-3 font-mono text-emerald-800 break-all leading-tight shadow-sm">
                                    {publicKey ? toAddress(publicKey) : "Generating..."}
                                </div>
                                <div className="text-[9px] text-emerald-500 font-medium pl-1">
                                    Safe to share with anyone.
                                </div>
                            </div>
                        </div>
                    </Phone>
                </div>
            </div>

            {/* RIGHT: MESSAGES LIST */}
            <div className="w-full lg:w-[26rem] flex-shrink-0 space-y-6">
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-lg text-slate-700">Messages to Sign</h3>
                </div>

                <div className="space-y-4">
                    <AnimatePresence>
                        {messages.map((message, index) => (
                            <MessageItem
                                key={message.id}
                                message={message}
                                publicKey={publicKey}
                                onSign={() => signMessage(message.id)}
                                onDelete={() => deleteMessage(message.id)}
                                onChangeData={(data) => updateMessageData(message.id, data)}
                                toAddress={toAddress}
                            />
                        ))}
                    </AnimatePresence>

                    {/* GHOST ADD BUTTON */}
                    <motion.button
                        layout
                        onClick={addMessage}
                        className="w-full h-24 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 group hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500 flex items-center justify-center transition-colors">
                            <Plus size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 group-hover:text-blue-500 transition-colors">Create New Message</span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

// Sub-component for individual message cards
function MessageItem({
    message,
    publicKey,
    onSign,
    onDelete,
    onChangeData,
    toAddress
}: {
    message: Message,
    publicKey: string,
    onSign: () => void,
    onDelete: () => void,
    onChangeData: (data: string) => void,
    toAddress: (key: string) => string
}) {
    // Verify signature state
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const verify = async () => {
            if (message.signature && publicKey) {
                try {
                    const key = ec.keyFromPublic(publicKey, 'hex');
                    // Hash data before verify
                    const msgBuffer = new TextEncoder().encode(message.data);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));

                    const valid = key.verify(hashArray, message.signature);
                    setIsValid(valid);
                } catch {
                    setIsValid(false);
                }
            } else {
                setIsValid(false);
            }
        };
        verify();
    }, [message.data, message.signature, publicKey]);

    const hasSignature = !!message.signature;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            layout
            className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-colors duration-300 relative group w-full ${hasSignature
                ? isValid
                    ? 'border-emerald-100 shadow-emerald-500/5'
                    : 'border-red-100 shadow-red-500/5'
                : 'border-slate-100'
                }`}
        >
            <div className="p-5 flex gap-4">
                {/* Status Indicator Bar */}
                <div className={`w-1.5 self-stretch rounded-full flex-shrink-0 ${hasSignature
                    ? isValid
                        ? 'bg-emerald-400'
                        : 'bg-red-400'
                    : 'bg-slate-200'
                    }`} />

                <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-center gap-4">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                            Message
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate flex-1 text-right">
                            From: {publicKey ? toAddress(publicKey) : "..."}
                        </div>
                        <button
                            onClick={onDelete}
                            className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                            title="Delete Message"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>

                    <textarea
                        value={message.data}
                        onChange={(e) => onChangeData(e.target.value)}
                        className={`w-full p-2 rounded-lg bg-slate-50 border-2 font-medium text-sm text-slate-700 focus:outline-none transition-all resize-none shadow-inner ${hasSignature
                            ? isValid
                                ? 'border-emerald-100 focus:border-emerald-300'
                                : 'border-red-100 focus:border-red-300 bg-red-50/10'
                            : 'border-slate-100 focus:border-blue-300 bg-white'
                            }`}
                        rows={2}
                        placeholder="Type message..."
                    />


                    <div className="flex-1 space-y-3 min-w-0">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                            Signature
                        </div>

                        <div className="flex items-center gap-3 h-8">
                            <div className={`flex-1 p-2 rounded-lg border font-mono text-[10px] h-full overflow-hidden relative items-center flex ${hasSignature
                                ? isValid
                                    ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700'
                                    : 'bg-red-50/50 border-red-100 text-red-700'
                                : 'bg-slate-50 border-slate-100 text-slate-400 italic'
                                }`}>
                                <div className="truncate w-full">
                                    {message.signature || "Unsigned"}
                                </div>
                            </div>

                            {/* Fixed Width Button Container to preventing jumping */}
                            <div className="w-[88px] flex-shrink-0">
                                {!hasSignature || !isValid ? (
                                    <button
                                        onClick={onSign}
                                        className={`w-full h-8 rounded-lg font-bold text-xs text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap ${hasSignature
                                            ? 'bg-red-500 hover:bg-red-600'
                                            : 'bg-slate-900 hover:bg-slate-800'
                                            }`}
                                    >
                                        <PenTool size={12} />
                                        {hasSignature ? "Re-sign" : "Sign"}
                                    </button>
                                ) : (
                                    <div className="w-full h-8 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-xs border border-emerald-200 flex items-center justify-center gap-1.5 whitespace-nowrap">
                                        <CheckCircle2 size={14} /> Signed
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
