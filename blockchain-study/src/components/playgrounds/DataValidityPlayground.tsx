"use client";

import { useState } from "react";
import { useHash } from "@/hooks/useHash";
import { useDebounce } from "@/hooks/useDebounce";
import { useLanguage } from "@/contexts/LanguageContext";
import { RotateCcw } from "lucide-react";
import { CardBackground } from "@/components/ui/CardBackground";

export function DataValidityPlayground() {
    const { t } = useLanguage();
    const initialValue = "Hello World,124813";
    const [input, setInput] = useState(initialValue);
    const debouncedInput = useDebounce(input, 300);
    const hash = useHash(debouncedInput);
    const isValid = hash.startsWith("0000");
    const changed = debouncedInput !== initialValue;

    const handleReset = () => {
        setInput(initialValue);
    };

    return (
        <CardBackground className="p-6 w-full max-w-md mx-auto relative group">
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-500">{t.dataValidity.inputLabel}</label>
                        <button
                            onClick={handleReset}
                            className={"text-slate-400 hover:text-blue-500 hover:bg-blue-50 p-1 rounded-md transition-all" + (changed ? " opacity-100" : " opacity-0")}
                            title="Reset to valid state"
                        >
                            <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className={`w-full p-3 rounded-lg border focus:ring-2 focus:border-transparent transition-all font-mono text-sm h-24 resize-none ${isValid ? 'border-green-400 focus:ring-green-400' : 'border-slate-300 focus:ring-blue-500'}`}
                        placeholder={t.hashing.placeholder}
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-500">{t.dataValidity.outputLabel}</label>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${isValid ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                            {isValid ? t.miningGame.valid : t.miningGame.invalid}
                        </span>
                    </div>

                    <div className="bg-slate-900/5 rounded-xl p-4 border border-white/20">
                        <div className="font-mono text-xs break-all leading-relaxed text-slate-600">
                            {hash ? (
                                <>
                                    <span className={isValid ? "text-green-600 font-bold bg-green-100/50 px-0.5 rounded" : "text-red-500 font-bold bg-red-100/50 px-0.5 rounded"}>
                                        {hash.substring(0, 4)}
                                    </span>
                                    {hash.substring(4)}
                                </>
                            ) : (
                                <span className="text-slate-400 italic">{t.hashing.emptyState}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CardBackground>
    );
}
