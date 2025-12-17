"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateBlockHash } from "@/lib/blockchain";
import { useLanguage } from "@/contexts/LanguageContext";
import { CardBackground } from "@/components/ui/CardBackground";

const MAX_ATTEMPTS_BEFORE_HINT = 5;

export function MiningGame() {
    const { t } = useLanguage();
    const [data, setData] = useState("Hello World");
    const [nonce, setNonce] = useState(0);
    const [hash, setHash] = useState("");
    const [hint, setHint] = useState<number | null>(null);
    const [isMiningHint, setIsMiningHint] = useState(false);

    const [attempts, setAttempts] = useState(0);

    const isGolden = hash.startsWith("0000");

    // Reset attempts when data changes
    useEffect(() => {
        setAttempts(0);
        setHint(null);
    }, [data]);

    // Calculate hash on change
    useEffect(() => {
        const calc = async () => {
            // Using index 0 and prevHash '0' for this isolated game
            const h = await calculateBlockHash(0, nonce, data, "0".repeat(64));
            setHash(h);

            // Increment attempts if incorrect (and not just initialized)
            if (!h.startsWith("0000")) {
                setAttempts(prev => prev + 1);
            }
        };
        calc();
    }, [data, nonce]);

    // Hint Miner Logic
    useEffect(() => {
        if (isGolden || attempts < MAX_ATTEMPTS_BEFORE_HINT || hint !== null) {
            return;
        }

        setIsMiningHint(true);

        const timeoutId = setTimeout(async () => {
            // Try to find a nonce that works
            let found = null;
            // Limit search to avoid freezing UI
            for (let i = 0; i < 100000; i++) {
                const h = await calculateBlockHash(0, i, data, "0".repeat(64));
                if (h.startsWith("0000")) {
                    found = i;
                    break;
                }
            }
            setHint(found);
            setIsMiningHint(false);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [attempts, isGolden, hint, data]);

    return (
        <div className="w-full max-w-2xl mx-auto perspective-1000">
            <motion.div
                animate={{
                    rotateX: isGolden ? [0, 10, 0] : 0,
                    scale: isGolden ? 1.05 : 1,
                    boxShadow: isGolden
                        ? "0 20px 50px -12px rgba(251, 191, 36, 0.5)"
                        : "0 10px 30px -10px rgba(0, 0, 0, 0.1)"
                }}
                transition={{ duration: 0.5 }}
                className="relative"
            >
                <CardBackground
                    className={`overflow-hidden transition-colors duration-500 ${isGolden
                        ? "bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-100 border-yellow-400"
                        : ""
                        }`}
                >
                    {/* Golden Shine Effect */}
                    {isGolden && (
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "200%" }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 pointer-events-none"
                        />
                    )}

                    <div className="p-4 space-y-6 relative z-10">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner ${isGolden ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-200 text-slate-500'}`}>
                                    {isGolden ? '🏆' : '⛏️'}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-lg ${isGolden ? 'text-yellow-800' : 'text-slate-700'}`}>
                                        {isGolden ? t.miningGame.statusSuccess : t.miningGame.statusTitle}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">{t.miningGame.statusSubtitle}</p>
                                </div>
                            </div>
                            {isGolden && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-sm"
                                >
                                    {t.miningGame.valid}
                                </motion.div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t.miningGame.dataLabel}</label>
                                <input
                                    type="text"
                                    value={data}
                                    onChange={(e) => setData(e.target.value)}
                                    className="w-full p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 focus:ring-2 focus:ring-blue-400 outline-none transition-all font-medium text-slate-700 shadow-inner"
                                    placeholder={t.hashing.placeholder}
                                />
                            </div>

                            <div className="space-y-1 relative">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">{t.miningGame.nonceLabel}</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={nonce}
                                        onChange={(e) => setNonce(parseInt(e.target.value) || 0)}
                                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                        className={`flex-1 min-w-0 p-2 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 focus:ring-2 outline-none transition-all font-mono font-bold text-lg shadow-inner ${isGolden ? 'text-yellow-600 focus:ring-yellow-400' : 'text-slate-700 focus:ring-blue-400'}`}
                                    />
                                    <button
                                        onClick={() => setNonce(n => n + 1)}
                                        className="px-6 bg-white/50 hover:bg-white/80 rounded-xl border border-white/50 font-bold text-slate-600 transition-all active:scale-95"
                                    >
                                        +1
                                    </button>
                                </div>

                                {/* Hint Popup */}
                                <AnimatePresence>
                                    {hint !== null && !isGolden && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 top-full mt-2 z-20"
                                        >
                                            <div className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer hover:bg-blue-700 transition-colors"
                                                onClick={() => setNonce(hint)}
                                            >
                                                <span>💡 {t.miningGame.hint} </span>
                                                <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-mono">{hint}</span>
                                            </div>
                                            <div className="w-3 h-3 bg-blue-600 absolute -top-1 right-8 rotate-45" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Concatenation Visualization */}
                            <div className="bg-slate-100/50 rounded-lg p-3 border border-dashed border-slate-300 text-center">
                                <p className="text-xs text-slate-500 mb-1">{t.miningGame.explanation}</p>
                                <code className="text-xs font-mono text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 block overflow-x-auto">
                                    Hash("<span className="font-bold text-blue-600">{data}</span>" + "<span className="font-bold text-purple-600">{nonce}</span>")
                                </code>
                            </div>

                            <div className="pt-2">
                                <div className="bg-slate-900/5 rounded-xl p-4 border border-white/20">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase">{t.miningGame.resultLabel}</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${isGolden ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                                            {isGolden ? t.miningGame.valid : t.miningGame.invalid}
                                        </span>
                                    </div>
                                    <div className="font-mono text-sm break-all leading-relaxed text-slate-600">
                                        <span className={isGolden ? "text-green-600 font-bold bg-green-100/50 px-0.5 rounded" : "text-red-500 font-bold bg-red-100/50 px-0.5 rounded"}>
                                            {hash.substring(0, 4)}
                                        </span>
                                        {hash.substring(4)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBackground>
            </motion.div>
        </div>
    );
}
