import React from 'react';
import { KEYWORDS } from '@/lib/keywords';

export function Highlight({ children }: { children: string }) {
    if (!children) return null;

    // Split by **text** or `code` pattern
    // The capturing group () keeps the delimiter in the result array
    const parts = children.split(/(\*\*.*?\*\*|`.*?`)/g);

    const handleKeywordClick = (content: string) => {
        const targetId = KEYWORDS[content.toLowerCase()];
        if (!targetId) return;

        const section = document.getElementById(targetId);
        if (!section) return;

        // Scroll the section into the middle of the screen
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start', // Align to top because we have fixed header offset handled in CSS
            inline: 'nearest'
        });

        // Trigger the highlight flash on the section
        setTimeout(() => {
            section.classList.remove('highlight-flash');
            void (section as HTMLElement).offsetWidth; // Force reflow
            section.classList.add('highlight-flash');

            setTimeout(() => {
                section.classList.remove('highlight-flash');
            }, 2000);
        }, 300); // Wait for scroll to be mostly done
    };

    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    const content = part.slice(2, -2);
                    const hasTarget = KEYWORDS[content.toLowerCase()];

                    return (
                        <span
                            key={i}
                            onClick={() => hasTarget && handleKeywordClick(content)}
                            className={`font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 bg-[length:200%_auto] bg-clip-text text-transparent drop-shadow-sm inline-block ${hasTarget ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''}`}
                        >
                            {content}
                        </span>
                    );
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    const content = part.slice(1, -1);
                    return (
                        <code key={i} className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono text-[0.9em] text-blue-600">
                            {content}
                        </code>
                    );
                }
                return part;
            })}
        </>
    );
}
