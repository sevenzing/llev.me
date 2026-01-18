"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNetwork } from "@/hooks/useNetwork";
import { CardBackground } from "../ui/CardBackground";
import { Zap, ZapOff, Activity, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface NetworkGraphProps {
    network: ReturnType<typeof useNetwork> & {
        allowInvalid?: boolean;
        setAllowInvalid?: (val: boolean) => void;
        autoMine?: boolean;
        setAutoMine?: (val: boolean) => void;
        stealMoney?: () => Promise<void>;
    };
    showExtraControls?: boolean;
}

export function NetworkGraph({ network, showExtraControls = true }: NetworkGraphProps) {
    const { t } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);
    const [cursorPos, setCursorPos] = useState<{ x: number, y: number } | null>(null);

    const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (e.detail === 2) {
            // Double click: Create connection
            network.setMovingNode(null); // Cancel any moving
            network.setDraggingFrom(nodeId);
        } else {
            // Single click: Move node
            network.setMovingNode(nodeId);
        }
        e.preventDefault();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            if (network.movingNode) {
                network.setNodes(prev => prev.map(node =>
                    node.id === network.movingNode
                        ? { ...node, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
                        : node
                ));
            }

            if (network.draggingFrom) {
                setCursorPos({ x, y });
            }
        }
    };

    const handleMouseUp = () => {
        if (network.draggingFrom && network.dragTarget && network.draggingFrom !== network.dragTarget) {
            const existingIndex = network.connections.findIndex(
                c => (c.from === network.draggingFrom && c.to === network.dragTarget) ||
                    (c.from === network.dragTarget && c.to === network.draggingFrom)
            );

            if (existingIndex >= 0) {
                network.setConnections(prev => prev.filter((_, i) => i !== existingIndex));
            } else {
                network.setConnections(prev => [...prev, { from: network.draggingFrom!, to: network.dragTarget! }]);
            }
        }
        network.setDraggingFrom(null);
        network.setDragTarget(null);
        network.setMovingNode(null);
        setCursorPos(null);
    };

    return (
        // className=""
        // <div className="w-full p-4 my-1 space-y-4 select-none bg-slate-100 rounded-2xl border border-slate-200 shadow-inner sticky top-32 min-h-[400px]">
        <CardBackground className="space-y-4 p-4 w-full sticky top-32 min-h-[400px] select-none my-1">
            <div
                ref={containerRef}
                className="relative w-full h-96 bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40 shadow-inner overflow-hidden ring-1 ring-white/30"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none filter drop-shadow-sm">
                    {network.connections.map((conn, idx) => {
                        const fromNode = network.nodes.find(n => n.id === conn.from);
                        const toNode = network.nodes.find(n => n.id === conn.to);
                        if (!fromNode || !toNode) return null;

                        return (
                            <line
                                key={idx}
                                x1={`${fromNode.x}%`}
                                y1={`${fromNode.y}%`}
                                x2={`${toNode.x}%`}
                                y2={`${toNode.y}%`}
                                stroke="rgba(148, 163, 184, 0.6)"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        );
                    })}

                    {/* Connection Line to Cursor or Target */}
                    {network.draggingFrom && (
                        <line
                            x1={`${network.nodes.find(n => n.id === network.draggingFrom)?.x}%`}
                            y1={`${network.nodes.find(n => n.id === network.draggingFrom)?.y}%`}
                            x2={network.dragTarget
                                ? `${network.nodes.find(n => n.id === network.dragTarget)?.x}%`
                                : `${cursorPos?.x ?? network.nodes.find(n => n.id === network.draggingFrom)?.x}%`}
                            y2={network.dragTarget
                                ? `${network.nodes.find(n => n.id === network.dragTarget)?.y}%`
                                : `${cursorPos?.y ?? network.nodes.find(n => n.id === network.draggingFrom)?.y}%`}
                            stroke="#60a5fa"
                            strokeWidth="3"
                            strokeDasharray="6,6"
                            className="animate-pulse"
                        />
                    )}
                </svg>

                {/* Sync Messages */}
                <AnimatePresence>
                    {network.syncMessages.map(msg => {
                        const fromNode = network.nodes.find(n => n.id === msg.from);
                        const toNode = network.nodes.find(n => n.id === msg.to);
                        if (!fromNode || !toNode) return null;

                        const x = fromNode.x + (toNode.x - fromNode.x) * (msg.progress / 100);
                        const y = fromNode.y + (toNode.y - fromNode.y) * (msg.progress / 100);

                        return (
                            <motion.div
                                key={msg.id}
                                className={`absolute w-4 h-4 rounded-full shadow-lg border border-white/50 ${msg.isRecursive
                                    ? 'bg-gradient-to-br from-blue-300 to-blue-500'
                                    : 'bg-gradient-to-br from-yellow-300 to-yellow-500'}`}
                                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            />
                        );
                    })}
                </AnimatePresence>

                {/* Nodes */}
                {network.nodes.map(node => {
                    const latestBlock = node.blockchain[node.blockchain.length - 1];
                    const latestBlockNumber = latestBlock.index;
                    const firstHashBytes = latestBlock.hash.slice(0, 8);
                    const feedback = network.syncFeedback.find(f => f.nodeId === node.id);
                    const isSelected = network.selectedNode === node.id;

                    return (
                        <div key={node.id} className="absolute" style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}>
                            <motion.div
                                className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold cursor-pointer z-10 relative shadow-xl transition-all duration-300
                                    ${isSelected
                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 ring-4 ring-blue-400/30 scale-110'
                                        : 'bg-gradient-to-br from-slate-700 to-slate-900 hover:scale-105'
                                    }
                                    ${network.draggingFrom === node.id ? 'ring-4 ring-yellow-400/50' : ''}
                                    ${network.movingNode === node.id ? 'ring-4 ring-green-400/50 cursor-grabbing' : ''}
                                    border border-white/20
                                `}
                                onClick={() => network.selectNode(node.id)}
                                onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                                onMouseEnter={() => network.draggingFrom && network.setDragTarget(node.id)}
                                onMouseLeave={() => network.setDragTarget(null)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {/* Glossy shine effect */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none" />
                                <span className="drop-shadow-md">{node.id}</span>
                            </motion.div>

                            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-xs font-mono whitespace-nowrap bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/50 text-slate-600 font-bold">
                                #{latestBlockNumber} <span className="text-slate-400">{firstHashBytes}...</span>
                            </div>

                            {feedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className={`absolute -top-10 left-1/2 transform -translate-x-1/2 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg backdrop-blur-md border border-white/20 z-[30] ${feedback.accepted
                                        ? feedback.isWarning
                                            ? 'bg-amber-500/90 text-white'
                                            : 'bg-emerald-500/90 text-white'
                                        : 'bg-red-500/90 text-white'
                                        }`}
                                >
                                    {feedback.accepted
                                        ? feedback.isWarning
                                            ? t.ecosystem.acceptedInvalid
                                            : t.ecosystem.accepted
                                        : t.ecosystem.rejected}
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>
            <p className="text-xs text-slate-500 font-medium text-center">
                Click to select • Drag to move • Double-click & drag to connect
            </p>

            <div className="flex flex-col gap-4 bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white/40 shadow-sm transition-all duration-300">
                {/* Row 1: Action Buttons */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={network.addNode}
                        className="px-6 py-2.5 bg-white/80 hover:bg-white text-purple-700 border border-purple-200 rounded-2xl transition-all text-xs font-black shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                    >
                        Add Node
                    </button>
                    <button
                        onClick={() => network.propagateChain(network.selectedNode)}
                        disabled={network.isSyncing}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-all text-xs font-black shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 border border-emerald-400"
                    >
                        {network.isSyncing ? 'Syncing...' : 'Sync Network'}
                    </button>
                    {showExtraControls && (
                        <button
                            onClick={network.stealMoney}
                            className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-2xl transition-all text-xs font-black shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm flex items-center gap-2"
                        >
                            <ZapOff size={14} /> Steal Money
                        </button>
                    )}
                </div>

                {/* Row 2: Toggles */}
                <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-200/50">
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {/* Auto Sync Toggle */}
                        {showExtraControls && (
                            <button
                                onClick={() => network.setAutoSync?.(!network.autoSync)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${network.autoSync
                                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                                    : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                                    }`}
                            >
                                <Zap size={12} className={network.autoSync ? 'fill-blue-500' : ''} />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                    {t.ecosystem.autoSync}
                                </span>
                                <div className={`w-6 h-3 rounded-full relative transition-colors ${network.autoSync ? 'bg-blue-500' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-white transition-transform ${network.autoSync ? 'translate-x-3' : 'translate-x-0'}`} />
                                </div>
                            </button>
                        )}

                        {/* Auto Mine Toggle */}
                        {showExtraControls && (
                            <button
                                onClick={() => network.setAutoMine?.(!network.autoMine)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${network.autoMine
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                                    : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                                    }`}
                            >
                                <Activity size={12} className={network.autoMine ? 'text-indigo-500' : ''} />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                    {t.ecosystem.autoMine}
                                </span>
                                <div className={`w-6 h-3 rounded-full relative transition-colors ${network.autoMine ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-white transition-transform ${network.autoMine ? 'translate-x-3' : 'translate-x-0'}`} />
                                </div>
                            </button>
                        )}

                        {/* Cheat Mode Toggle */}
                        {showExtraControls && network.allowInvalid !== undefined && network.setAllowInvalid && (
                            <button
                                onClick={() => network.setAllowInvalid?.(!network.allowInvalid)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${network.allowInvalid
                                    ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm'
                                    : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                                    }`}
                            >
                                <ShieldAlert size={12} className={network.allowInvalid ? 'text-amber-500' : ''} />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                    {t.ecosystem.cheatMode}
                                </span>
                                <div className={`w-6 h-3 rounded-full relative transition-colors ${network.allowInvalid ? 'bg-amber-500' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-white transition-transform ${network.allowInvalid ? 'translate-x-3' : 'translate-x-0'}`} />
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </CardBackground>
    );
}
