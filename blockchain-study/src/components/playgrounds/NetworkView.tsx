"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Node {
    id: string;
    x: number;
    y: number;
    blockchain: Block[];
}

interface Block {
    index: number;
    data: string;
    hash: string;
    prevHash: string;
}

interface Connection {
    from: string;
    to: string;
}

interface SyncMessage {
    id: number;
    from: string;
    to: string;
    progress: number;
    isRecursive: boolean;
}

interface NetworkViewProps {
    onBlockchainChange?: (blockchain: Block[]) => void;
    onSelectedNodeChange?: (nodeId: string) => void;
    onSyncingChange?: (isSyncing: boolean) => void;
    onSyncRequest?: (syncFn: () => void) => void;
}

export function NetworkView({ onBlockchainChange, onSelectedNodeChange, onSyncingChange, onSyncRequest }: NetworkViewProps) {
    const [nodes, setNodes] = useState<Node[]>([
        { id: "A", x: 20, y: 30, blockchain: [{ index: 1, data: "Genesis", hash: "0x1a2b", prevHash: "0x0000" }] },
        { id: "B", x: 80, y: 30, blockchain: [{ index: 1, data: "Genesis", hash: "0x1a2b", prevHash: "0x0000" }] },
        { id: "C", x: 50, y: 70, blockchain: [{ index: 1, data: "Genesis", hash: "0x1a2b", prevHash: "0x0000" }] },
    ]);

    const [connections, setConnections] = useState<Connection[]>([
        { from: "A", to: "B" },
        { from: "B", to: "C" },
        { from: "A", to: "C" },
    ]);

    const [selectedNode, setSelectedNode] = useState<string>("A");
    const [syncMessages, setSyncMessages] = useState<SyncMessage[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [draggingFrom, setDraggingFrom] = useState<string | null>(null);
    const [dragTarget, setDragTarget] = useState<string | null>(null);
    const [movingNode, setMovingNode] = useState<string | null>(null);
    const syncIdRef = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const updateSyncing = useCallback((syncStatus: boolean) => {
        setIsSyncing(syncStatus);
        if (onSyncingChange) {
            onSyncingChange(syncStatus);
        }
    }, [onSyncingChange]);

    const handleSync = useCallback((nodeId: string, isRecursive = false, visitedNodes = new Set<string>()) => {
        if (!isRecursive && isSyncing) return;

        if (!isRecursive) updateSyncing(true);

        const sourceNode = nodes.find(n => n.id === nodeId);
        if (!sourceNode) return;

        visitedNodes.add(nodeId);

        const connectedPeers = connections
            .filter(c => c.from === nodeId || c.to === nodeId)
            .map(c => c.from === nodeId ? c.to : c.from)
            .filter(peerId => !visitedNodes.has(peerId));

        if (connectedPeers.length === 0) {
            if (!isRecursive) updateSyncing(false);
            return;
        }

        const newMessages = connectedPeers.map(peerId => ({
            id: syncIdRef.current++,
            from: nodeId,
            to: peerId,
            progress: 0,
            isRecursive,
        }));

        setSyncMessages(prev => [...prev, ...newMessages]);

        const interval = setInterval(() => {
            setSyncMessages(prev => {
                const updated = prev.map(msg => ({ ...msg, progress: msg.progress + 5 }));
                const completed = updated.filter(msg => msg.progress >= 100);

                if (completed.length > 0) {
                    setNodes(prevNodes => {
                        const updatedNodes = prevNodes.map(node => {
                            const receivedMsg = completed.find(msg => msg.to === node.id);
                            if (receivedMsg && sourceNode) {
                                setTimeout(() => {
                                    handleSync(node.id, true, new Set(visitedNodes));
                                }, 100);
                                return { ...node, blockchain: [...sourceNode.blockchain] };
                            }
                            return node;
                        });

                        const selectedNodeData = updatedNodes.find(n => n.id === selectedNode);
                        if (selectedNodeData && onBlockchainChange) {
                            onBlockchainChange(selectedNodeData.blockchain);
                        }

                        return updatedNodes;
                    });
                }

                const remaining = updated.filter(msg => msg.progress < 100);
                if (remaining.length === 0) {
                    clearInterval(interval);
                    if (!isRecursive) {
                        setTimeout(() => updateSyncing(false), 500);
                    }
                }
                return remaining;
            });
        }, 30);
    }, [nodes, connections, isSyncing, selectedNode, onBlockchainChange, updateSyncing]);

    const handleNodeSelect = (nodeId: string) => {
        setSelectedNode(nodeId);
        if (onSelectedNodeChange) {
            onSelectedNodeChange(nodeId);
        }
        const node = nodes.find(n => n.id === nodeId);
        if (node && onBlockchainChange) {
            onBlockchainChange(node.blockchain);
        }
    };

    // Expose sync function to parent
    useEffect(() => {
        if (onSyncRequest) {
            onSyncRequest(() => handleSync(selectedNode));
        }
    }, [selectedNode, onSyncRequest, handleSync]);

    const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
        if (e.detail === 2) {
            setMovingNode(nodeId);
        } else {
            setDraggingFrom(nodeId);
        }
        e.preventDefault();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (movingNode && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            setNodes(prev => prev.map(node =>
                node.id === movingNode ? { ...node, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) } : node
            ));
        }
    };

    const handleMouseUp = () => {
        if (draggingFrom && dragTarget && draggingFrom !== dragTarget) {
            const existingIndex = connections.findIndex(
                c => (c.from === draggingFrom && c.to === dragTarget) || (c.from === dragTarget && c.to === draggingFrom)
            );

            if (existingIndex >= 0) {
                setConnections(prev => prev.filter((_, i) => i !== existingIndex));
            } else {
                setConnections(prev => [...prev, { from: draggingFrom, to: dragTarget }]);
            }
        }
        setDraggingFrom(null);
        setDragTarget(null);
        setMovingNode(null);
    };

    const addNode = () => {
        const newId = String.fromCharCode(65 + nodes.length);
        const x = 20 + Math.random() * 60;
        const y = 20 + Math.random() * 60;
        setNodes(prev => [...prev, {
            id: newId,
            x,
            y,
            blockchain: [{ index: 1, data: "Genesis", hash: "0x1a2b", prevHash: "0x0000" }],
        }]);
    };

    const addBlock = () => {
        if (!selectedNode) return;

        setNodes(prev => {
            const updated = prev.map(node => {
                if (node.id === selectedNode) {
                    const newIndex = node.blockchain.length + 1;
                    const prevBlock = node.blockchain[node.blockchain.length - 1];
                    const newBlock: Block = {
                        index: newIndex,
                        data: `Transaction ${newIndex}`,
                        hash: `0x${Math.random().toString(16).slice(2, 6)}`,
                        prevHash: prevBlock.hash,
                    };
                    const newBlockchain = [...node.blockchain, newBlock];

                    if (onBlockchainChange) {
                        onBlockchainChange(newBlockchain);
                    }

                    return { ...node, blockchain: newBlockchain };
                }
                return node;
            });
            return updated;
        });
    };

    return (
        <div className="w-full space-y-4 select-none">
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={addNode}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-bold"
                >
                    + Node
                </button>
            </div>

            <div
                ref={containerRef}
                className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden shadow-inner"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {connections.map((conn, i) => {
                        const fromNode = nodes.find(n => n.id === conn.from);
                        const toNode = nodes.find(n => n.id === conn.to);
                        if (!fromNode || !toNode) return null;
                        return (
                            <line
                                key={`${conn.from}-${conn.to}-${i}`}
                                x1={`${fromNode.x}%`}
                                y1={`${fromNode.y}%`}
                                x2={`${toNode.x}%`}
                                y2={`${toNode.y}%`}
                                stroke="#334155"
                                strokeWidth="2"
                            />
                        );
                    })}

                    {draggingFrom && dragTarget && (
                        <line
                            x1={`${nodes.find(n => n.id === draggingFrom)?.x}%`}
                            y1={`${nodes.find(n => n.id === draggingFrom)?.y}%`}
                            x2={`${nodes.find(n => n.id === dragTarget)?.x}%`}
                            y2={`${nodes.find(n => n.id === dragTarget)?.y}%`}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                        />
                    )}
                </svg>

                <AnimatePresence>
                    {syncMessages.map(msg => {
                        const fromNode = nodes.find(n => n.id === msg.from);
                        const toNode = nodes.find(n => n.id === msg.to);
                        if (!fromNode || !toNode) return null;

                        const x = fromNode.x + (toNode.x - fromNode.x) * (msg.progress / 100);
                        const y = fromNode.y + (toNode.y - fromNode.y) * (msg.progress / 100);

                        return (
                            <motion.div
                                key={msg.id}
                                className={`absolute w-2 h-2 rounded-full ${msg.isRecursive ? 'bg-blue-400 opacity-40' : 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]'
                                    }`}
                                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            />
                        );
                    })}
                </AnimatePresence>

                {nodes.map(node => (
                    <motion.div
                        key={node.id}
                        className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-2 flex items-center justify-center text-white text-sm font-bold cursor-pointer z-10 transition-all ${selectedNode === node.id ? 'bg-blue-600 border-blue-400 scale-110' : 'bg-slate-800 border-blue-500'
                            } ${draggingFrom === node.id ? 'ring-4 ring-yellow-400' : ''} ${movingNode === node.id ? 'ring-4 ring-green-400' : ''}`}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        onClick={() => handleNodeSelect(node.id)}
                        onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                        onMouseEnter={() => draggingFrom && setDragTarget(node.id)}
                        onMouseLeave={() => setDragTarget(null)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {node.id}
                    </motion.div>
                ))}
            </div>

            <p className="text-xs text-slate-500 text-center">
                Click to select • Double-click to move • Drag to connect/disconnect
            </p>
        </div>
    );
}
