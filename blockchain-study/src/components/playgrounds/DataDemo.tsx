"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function DataDemo() {
    const { t } = useLanguage();
    const [data, setData] = useState("Hello World");

    // Convert text to binary string
    const textEncoder = new TextEncoder();
    const encoded = textEncoder.encode(data);
    const binaryString = Array.from(encoded)
        .map(byte => byte.toString(2).padStart(8, '0'))
        .join(' ');

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">{t.data.inputLabel}</label>
                <textarea
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm h-32 resize-none shadow-sm placeholder:text-slate-400"
                    placeholder={t.data.placeholder}
                />
            </div>

            <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Raw Data (Binary)</label>
                <div className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-green-400 h-24 overflow-y-auto shadow-inner break-all">
                    {binaryString || <span className="text-slate-600 italic">00000000</span>}
                </div>
            </div>

            <div className="flex justify-end">
                <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border border-slate-200">
                    {t.data.size}: {encoded.length}
                </div>
            </div>
        </div>
    );
}
