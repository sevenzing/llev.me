"use client";

import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface AddBlockGhostProps {
    onClick: () => void;
    size?: 'small' | 'large';
}

export function AddBlockGhost({ onClick, size = 'small' }: AddBlockGhostProps) {
    const isSmall = size === 'small';
    const dimensions = isSmall
        ? "w-64 h-[447.5px]"
        : "w-80 h-[547.5px]";

    return (
        <motion.div
            onClick={onClick}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${dimensions} border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-white/40 hover:shadow-lg transition-all group relative flex-shrink-0`}
        >
            <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" strokeWidth={3} />
            </div>
        </motion.div>
    );
}
