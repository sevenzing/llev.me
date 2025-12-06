import React from 'react';

export function Highlight({ children }: { children: string }) {
    if (!children) return null;

    // Split by **text** pattern
    // The capturing group () keeps the delimiter in the result array
    const parts = children.split(/(\*\*.*?\*\*)/g);

    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    // Remove ** from start and end
                    const content = part.slice(2, -2);
                    return (
                        <span key={i} className="font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 bg-[length:200%_auto] animate-shimmer bg-clip-text text-transparent drop-shadow-sm inline-block">
                            {content}
                        </span>
                    );
                }
                return part;
            })}
        </>
    );
}
