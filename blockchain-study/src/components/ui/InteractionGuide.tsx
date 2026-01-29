import React from 'react';
import { Highlight } from './Highlight';

export function InteractionGuide({ text }: { text: string }) {
    return (
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50/80 backdrop-blur-sm border border-blue-100 rounded-xl text-blue-800 text-sm font-medium shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
            <span className="text-lg">💡</span>
            <span><Highlight>{text}</Highlight></span>
        </div>
    );
}
