"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHash } from "@/hooks/useHash";

export function HashComparator({ initialA, initialB }: { initialA: string; initialB: string }) {
    const [inputA, setInputA] = useState(initialA);
    const [inputB, setInputB] = useState(initialB);
    const hashA = useHash(inputA);
    const hashB = useHash(inputB);
    const isEqual = hashA === hashB;

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                {/* Device A */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Device A (Moscow)</span>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl opacity-30 group-hover:opacity-50 transition duration-500 blur"></div>
                        <textarea
                            value={inputA}
                            onChange={(e) => setInputA(e.target.value)}
                            className="relative w-full h-32 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all resize-none font-mono text-slate-700 shadow-inner"
                            placeholder="Type something..."
                        />
                    </div>
                    <div className="bg-slate-900/5 rounded-xl p-3 border border-white/20">
                        <div className="text-xs font-bold text-slate-500 mb-1 uppercase">SHA-256 Output</div>
                        <div className="font-mono text-xs break-all text-slate-700 leading-relaxed">
                            {hashA || <span className="text-slate-400 italic">Calculating...</span>}
                        </div>
                    </div>
                </div>

                {/* Equality Indicator (Absolute Center) */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center justify-center pointer-events-none">
                    <AnimatePresence mode="wait">
                        {isEqual ? (
                            <motion.div
                                key="equal"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg border-4 border-white"
                            >
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="not-equal"
                                initial={{ scale: 0, rotate: 180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: -180 }}
                                className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center shadow-lg border-4 border-white"
                            >
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Device B */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 justify-end">
                        <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Device B (New York)</span>
                        <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl opacity-30 group-hover:opacity-50 transition duration-500 blur"></div>
                        <textarea
                            value={inputB}
                            onChange={(e) => setInputB(e.target.value)}
                            className="relative w-full h-32 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all resize-none font-mono text-slate-700 shadow-inner text-right"
                            placeholder="Type something..."
                        />
                    </div>
                    <div className="bg-slate-900/5 rounded-xl p-3 border border-white/20 text-right">
                        <div className="text-xs font-bold text-slate-500 mb-1 uppercase">SHA-256 Output</div>
                        <div className="font-mono text-xs break-all text-slate-700 leading-relaxed">
                            {hashB || <span className="text-slate-400 italic">Calculating...</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Connection Lines Animation */}
            <div className="mt-8 flex justify-center">
                <div className={`h-1 w-full rounded-full transition-colors duration-500 ${isEqual ? 'bg-emerald-400/50' : 'bg-rose-400/50'}`} />
            </div>
        </div>
    );
}
