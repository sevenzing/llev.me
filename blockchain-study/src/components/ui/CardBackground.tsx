import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export type CardStyle = 'glass' | 'white';

interface CardBackgroundProps {
    children: ReactNode;
    className?: string;
    style?: CardStyle;
}

// Change this to 'white' if you prefer the clean look by default
const DEFAULT_STYLE: CardStyle = 'glass';

export function CardBackground({ children, className, style = DEFAULT_STYLE }: CardBackgroundProps) {
    const styles = {
        glass: "bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl ring-1 ring-white/40",
        white: "bg-white rounded-3xl shadow-xl border border-slate-200"
    };

    return (
        <div className={cn(styles[style], className)}>
            {children}
        </div>
    );
}
