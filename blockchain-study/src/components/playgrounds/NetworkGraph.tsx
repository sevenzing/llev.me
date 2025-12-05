"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNetwork } from "@/hooks/useNetwork";

interface NetworkGraphProps {
    network: ReturnType<typeof useNetwork>;
}

export function NetworkGraph({ network }: NetworkGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
        if (e.detail === 2) {
            network.setMovingNode(nodeId);
        } else {
            network.setDraggingFrom(nodeId);
        }
        e.preventDefault();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (network.movingNode && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            network.setNodes(prev => prev.map(node =>
                node.id === network.movingNode
                    ? { ...node, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
                    : node
            ));
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
    };

    return (
        <div className="w-full space-y-2 select-none">
            <div
                ref={containerRef}
                className="relative w-full h-80 bg-slate-50 rounded-xl border-2 border-slate-300 overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
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
                                stroke="#94a3b8"
                                strokeWidth="2"
                            />
                        );
                    })}

                    {network.draggingFrom && network.dragTarget && (
                        <line
                            x1={`${network.nodes.find(n => n.id === network.draggingFrom)?.x}%`}
                            y1={`${network.nodes.find(n => n.id === network.draggingFrom)?.y}%`}
                            x2={`${network.nodes.find(n => n.id === network.dragTarget)?.x}%`}
                            y2={`${network.nodes.find(n => n.id === network.dragTarget)?.y}%`}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray="5,5"
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
                                className={`absolute w-3 h-3 rounded-full ${msg.isRecursive ? 'bg-blue-400' : 'bg-yellow-400'}`}
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
                    const blockHeight = node.blockchain.length;
                    const lastHashBytes = latestBlock.hash.slice(-4);
                    const feedback = network.syncFeedback.find(f => f.nodeId === node.id);

                    return (
                        <div key={node.id} className="absolute" style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}>
                            <motion.div
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-white text-sm font-bold cursor-pointer z-10 ${network.movingNode === node.id ? '' : 'transition-all'} ${network.selectedNode === node.id ? 'bg-blue-600 border-blue-400 scale-110' : 'bg-slate-800 border-blue-500'
                                    } ${network.draggingFrom === node.id ? 'ring-4 ring-yellow-400' : ''} ${network.movingNode === node.id ? 'ring-4 ring-green-400' : ''}`}
                                onClick={() => network.selectNode(node.id)}
                                onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                                onMouseEnter={() => network.draggingFrom && network.setDragTarget(node.id)}
                                onMouseLeave={() => network.setDragTarget(null)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {node.id}
                            </motion.div>
                            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs text-slate-300 font-mono whitespace-nowrap bg-slate-900/80 px-2 py-1 rounded">
                                #{blockHeight} ...{lastHashBytes}
                            </div>
                            {feedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${feedback.accepted
                                        ? 'bg-green-500 text-white'
                                        : 'bg-red-500 text-white'
                                        }`}
                                >
                                    {feedback.accepted ? 'Accepted ✓' : 'Rejected ✗'}
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col gap-2 items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={network.addNode}
                        className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-bold"
                    >
                        + Node
                    </button>
                    <button
                        onClick={network.addBlock}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-bold"
                    >
                        + Block
                    </button>
                    <button
                        onClick={() => network.propagateChain(network.selectedNode)}
                        disabled={network.isSyncing}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-xs font-bold"
                    >
                        {network.isSyncing ? 'Syncing...' : 'Sync'}
                    </button>
                </div>
                <p className="text-xs text-slate-500 text-center">
                    Click to select • Double-click & drag to move • Drag between nodes to connect/disconnect
                </p>
            </div>
        </div>
    );
}
