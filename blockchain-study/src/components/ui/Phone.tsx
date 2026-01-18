import React from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a utils file for merging classes, or I can just use template literals if not. I'll stick to standard className prop usage.

interface PhoneProps {
    children: React.ReactNode;
    className?: string;
    overlay?: React.ReactNode;
}

export function Phone({ children, className, overlay }: PhoneProps) {
    return (
        <div className={`w-full max-w-[20rem] h-[38rem] bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-800 ring-4 ring-slate-900/50 relative overflow-hidden ${className || ''}`}>
            {/* Dynamic Island / Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20"></div>

            {/* Screen Content */}
            <div className="bg-slate-50 w-full h-full rounded-[2rem] overflow-hidden flex flex-col pt-8 pb-4 px-3 relative">
                {overlay}
                <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden no-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}
