import React from 'react';
import { KEYWORDS } from '@/lib/keywords';

export function Highlight({ children }: { children: string }) {
    if (!children) return null;

    // Split by **text** or `code` pattern
    // The capturing group () keeps the delimiter in the result array
    const parts = children.split(/(\*\*.*?\*\*|`.*?`)/g);

    const handleKeywordClick = (content: string) => {
        const target = KEYWORDS[content.toLowerCase()];
        if (!target) return;

        const section = document.getElementById(target.scroll);
        if (!section) return;

        // 1. Try to find the specific text to highlight within the section first
        const walk = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, null);
        let textNode;
        let targetElement: HTMLElement | null = null;

        while (textNode = walk.nextNode()) {
            const parent = textNode.parentElement;
            if (parent && parent.textContent?.includes(target.highlight)) {
                targetElement = parent;
                // Keep looking for a more specific match (smaller container)
                if (parent.tagName === 'SPAN' || parent.tagName === 'B' || parent.tagName === 'STRONG' || parent.tagName === 'CODE') {
                    break;
                }
            }
        }

        // If we found a specific match in a span, try to get the whole sentence/paragraph for better context
        if (targetElement && (targetElement.tagName === 'SPAN' || targetElement.tagName === 'B' || targetElement.tagName === 'STRONG')) {
            const p = targetElement.closest('p, li, h1, h2, h3, h4');
            if (p && p.textContent?.includes(target.highlight)) {
                targetElement = p as HTMLElement;
            }
        }

        const finalTarget = targetElement || section;

        // 2. Scroll the specific element into the middle of the screen
        finalTarget.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });

        // 3. Trigger the highlight flash
        setTimeout(() => {
            finalTarget.classList.remove('highlight-flash');
            void (finalTarget as HTMLElement).offsetWidth; // Force reflow
            finalTarget.classList.add('highlight-flash');

            setTimeout(() => {
                finalTarget.classList.remove('highlight-flash');
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
