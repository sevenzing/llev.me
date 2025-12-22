"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHash } from "@/hooks/useHash";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { CardBackground } from "@/components/ui/CardBackground";
import { useLanguage } from "@/contexts/LanguageContext";

export function HashPlayground() {
    const [input, setInput] = useState("Hello World");
    const debouncedInput = useDebounce(input, 300);
    const hash = useHash(debouncedInput);
    const { t } = useLanguage();

    return (
        <CardBackground className="p-6 w-full max-w-md mx-auto">
            <h3 className="text-lg font-heading font-bold mb-4 text-slate-800">SHA-256 Hash Generator</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">{t.hashing.inputLabel}</label>
                    <textarea
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value)
                        }}
                        className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm h-24 resize-none"
                        placeholder={t.hashing.placeholder}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">{t.hashing.outputLabel}</label>
                    <div className="relative overflow-hidden bg-slate-100 rounded-lg p-3 border border-slate-200 font-mono text-xs break-all text-slate-600 min-h-[3rem] flex items-center">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={hash}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.15 }}
                                className="block w-full"
                            >
                                {hash || <span className="text-slate-400 italic">{t.hashing.emptyState}</span>}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </CardBackground>
    );
}
