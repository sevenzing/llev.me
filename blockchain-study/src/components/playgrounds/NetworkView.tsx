// "use client";

// import { useState, useRef, useCallback, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { GenesisBlock } from "@/lib/utils";
// import { Block, Connection, Node, SyncFeedback, SyncMessage } from "@/lib/types";

// interface NetworkViewProps {
//     onBlockchainChange?: (blockchain: Block[]) => void;
//     onSelectedNodeChange?: (nodeId: string) => void;
//     onSyncingChange?: (isSyncing: boolean) => void;
//     onSyncRequest?: (syncFn: () => void) => void;
//     onAddBlockRequest?: (addBlockFn: () => void) => void;
//     onUpdateBlockRequest?: (updateFn: (index: number, hash: string, nonce: number) => void) => void;
// }

// export function NetworkView({
//     onBlockchainChange,
//     onSelectedNodeChange,
//     onSyncingChange,
//     onSyncRequest,
//     onAddBlockRequest,
//     onUpdateBlockRequest
// }: NetworkViewProps) {
//     const [nodes, setNodes] = useState<Node[]>([
//         { id: "A", x: 20, y: 30, blockchain: [GenesisBlock()] },
//         { id: "B", x: 80, y: 30, blockchain: [GenesisBlock()] },
//         { id: "C", x: 50, y: 70, blockchain: [GenesisBlock()] },
//     ]);

//     const [connections, setConnections] = useState<Connection[]>([
//         { from: "A", to: "B" },
//         { from: "B", to: "C" },
//         { from: "A", to: "C" },
//     ]);

//     const [selectedNode, setSelectedNode] = useState<string>("A");
//     const [syncMessages, setSyncMessages] = useState<SyncMessage[]>([]);
//     const [syncFeedback, setSyncFeedback] = useState<SyncFeedback[]>([]);
//     const [isSyncing, setIsSyncing] = useState(false);
//     const [draggingFrom, setDraggingFrom] = useState<string | null>(null);
//     const [dragTarget, setDragTarget] = useState<string | null>(null);
//     const [movingNode, setMovingNode] = useState<string | null>(null);
//     const syncIdRef = useRef(0);
//     const feedbackIdRef = useRef(0);
//     const containerRef = useRef<HTMLDivElement>(null);

//     const updateSyncing = useCallback((syncStatus: boolean) => {
//         setIsSyncing(syncStatus);
//         if (onSyncingChange) {
//             onSyncingChange(syncStatus);
//         }
//     }, [onSyncingChange]);

//     // Auto-remove feedback after 2 seconds
//     useEffect(() => {
//         if (syncFeedback.length === 0) return;

//         const timer = setTimeout(() => {
//             const now = Date.now();
//             setSyncFeedback(prev => prev.filter(f => now - f.timestamp < 2000));
//         }, 100);

//         return () => clearTimeout(timer);
//     }, [syncFeedback]);

//     // Validate blockchain
//     const validateChain = useCallback((chain: Block[]): boolean => {
//         if (chain.length === 0) return false;

//         // Check each block
//         for (let i = 0; i < chain.length; i++) {
//             const block = chain[i];

//             // All blocks must be mined (hash starts with 0000)
//             if (!block.hash.startsWith('0000')) {
//                 return false;
//             }

//             // Check prevHash links (except genesis)
//             if (i > 0) {
//                 const prevBlock = chain[i - 1];
//                 if (block.prevHash !== prevBlock.hash) {
//                     return false;
//                 }
//             }
//         }

//         return true;
//     }, []);

//     const handleSync = useCallback((nodeId: string, isRecursive = false, visitedNodes = new Set<string>(), currentNodes?: Node[]) => {
//         if (!isRecursive && isSyncing) return;

//         if (!isRecursive) updateSyncing(true);

//         // Use provided nodes or current state
//         const nodesToUse = currentNodes || nodes;
//         const sourceNode = nodesToUse.find(n => n.id === nodeId);
//         if (!sourceNode) return;

//         visitedNodes.add(nodeId);

//         const connectedPeers = connections
//             .filter(c => c.from === nodeId || c.to === nodeId)
//             .map(c => c.from === nodeId ? c.to : c.from)
//             .filter(peerId => !visitedNodes.has(peerId));

//         if (connectedPeers.length === 0) {
//             if (!isRecursive) updateSyncing(false);
//             return;
//         }

//         const newMessages = connectedPeers.map(peerId => ({
//             id: syncIdRef.current++,
//             from: nodeId,
//             to: peerId,
//             progress: 0,
//             isRecursive,
//         }));

//         setSyncMessages(prev => [...prev, ...newMessages]);

//         const interval = setInterval(() => {
//             setSyncMessages(prev => {
//                 const updated = prev.map(msg => ({ ...msg, progress: msg.progress + 5 }));
//                 const completed = updated.filter(msg => msg.progress >= 100);

//                 if (completed.length > 0) {
//                     setNodes(prevNodes => {
//                         const updatedNodes = prevNodes.map(node => {
//                             const receivedMsg = completed.find(msg => msg.to === node.id);
//                             if (receivedMsg && sourceNode) {
//                                 // Check if blockchain is acceptable
//                                 const isSourceValid = validateChain(sourceNode.blockchain);
//                                 const isLonger = sourceNode.blockchain.length > node.blockchain.length;
//                                 const isSameLength = sourceNode.blockchain.length === node.blockchain.length;

//                                 // Check if chains are identical (same hashes)
//                                 const areIdentical = isSameLength &&
//                                     sourceNode.blockchain.every((block, idx) =>
//                                         block.hash === node.blockchain[idx]?.hash
//                                     );

//                                 // Accept if: valid AND (longer OR identical)
//                                 const shouldAccept = isSourceValid && (isLonger || areIdentical);

//                                 if (shouldAccept) {
//                                     // Actually accept the blockchain
//                                     const updatedBlockchain = isLonger
//                                         ? [...sourceNode.blockchain]
//                                         : node.blockchain; // Keep same if identical

//                                     // Emit accepted event
//                                     setSyncFeedback(prev => [...prev, {
//                                         id: feedbackIdRef.current++,
//                                         nodeId: node.id,
//                                         accepted: true,
//                                         timestamp: Date.now()
//                                     }]);

//                                     return { ...node, blockchain: updatedBlockchain };
//                                 } else {
//                                     // Emit rejected event
//                                     setSyncFeedback(prev => [...prev, {
//                                         id: feedbackIdRef.current++,
//                                         nodeId: node.id,
//                                         accepted: false,
//                                         timestamp: Date.now()
//                                     }]);
//                                 }
//                             }
//                             return node;
//                         });

//                         // Trigger recursive sync with UPDATED node state
//                         completed.forEach(msg => {
//                             const updatedNode = updatedNodes.find(n => n.id === msg.to);
//                             if (updatedNode && sourceNode && validateChain(sourceNode.blockchain) &&
//                                 sourceNode.blockchain.length > (prevNodes.find(n => n.id === msg.to)?.blockchain.length || 0)) {
//                                 setTimeout(() => {
//                                     // Pass updated nodes to recursive call
//                                     handleSync(updatedNode.id, true, new Set(visitedNodes), updatedNodes);
//                                 }, 100);
//                             }
//                         });

//                         const selectedNodeData = updatedNodes.find(n => n.id === selectedNode);
//                         if (selectedNodeData && onBlockchainChange) {
//                             onBlockchainChange(selectedNodeData.blockchain);
//                         }

//                         return updatedNodes;
//                     });
//                 }

//                 const remaining = updated.filter(msg => msg.progress < 100);
//                 if (remaining.length === 0) {
//                     clearInterval(interval);
//                     if (!isRecursive) {
//                         setTimeout(() => updateSyncing(false), 500);
//                     }
//                 }
//                 return remaining;
//             });
//         }, 30);
//     }, [nodes, connections, isSyncing, selectedNode, onBlockchainChange, updateSyncing, validateChain]);

//     const handleNodeSelect = (nodeId: string) => {
//         setSelectedNode(nodeId);
//         if (onSelectedNodeChange) {
//             onSelectedNodeChange(nodeId);
//         }
//         const node = nodes.find(n => n.id === nodeId);
//         if (node && onBlockchainChange) {
//             onBlockchainChange(node.blockchain);
//         }
//     };

//     // Expose functions to parent
//     useEffect(() => {
//         if (onSyncRequest) {
//             onSyncRequest(() => handleSync(selectedNode));
//         }
//         if (onAddBlockRequest) {
//             onAddBlockRequest(addBlock);
//         }
//         if (onUpdateBlockRequest) {
//             onUpdateBlockRequest(updateBlock);
//         }
//     }, [selectedNode, onSyncRequest, handleSync, onAddBlockRequest, onUpdateBlockRequest]);

//     const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
//         if (e.detail === 2) {
//             setMovingNode(nodeId);
//         } else {
//             setDraggingFrom(nodeId);
//         }
//         e.preventDefault();
//     };

//     const handleMouseMove = (e: React.MouseEvent) => {
//         if (movingNode && containerRef.current) {
//             const rect = containerRef.current.getBoundingClientRect();
//             const x = ((e.clientX - rect.left) / rect.width) * 100;
//             const y = ((e.clientY - rect.top) / rect.height) * 100;

//             setNodes(prev => prev.map(node =>
//                 node.id === movingNode ? { ...node, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) } : node
//             ));
//         }
//     };

//     const handleMouseUp = () => {
//         if (draggingFrom && dragTarget && draggingFrom !== dragTarget) {
//             const existingIndex = connections.findIndex(
//                 c => (c.from === draggingFrom && c.to === dragTarget) || (c.from === dragTarget && c.to === draggingFrom)
//             );

//             if (existingIndex >= 0) {
//                 setConnections(prev => prev.filter((_, i) => i !== existingIndex));
//             } else {
//                 setConnections(prev => [...prev, { from: draggingFrom, to: dragTarget }]);
//             }
//         }
//         setDraggingFrom(null);
//         setDragTarget(null);
//         setMovingNode(null);
//     };

//     const addNode = () => {
//         const newId = String.fromCharCode(65 + nodes.length);
//         const x = 20 + Math.random() * 60;
//         const y = 20 + Math.random() * 60;
//         setNodes(prev => [...prev, {
//             id: newId,
//             x,
//             y,
//             blockchain: [{ index: 1, data: "Genesis", hash: "0000bbbdbb4724e11babfe192bcc389a8ce1501ee1a5419f5599ed2f6c42d490", prevHash: "0000000000000000000000000000000000000000000000000000000000000000", nonce: 52116 }],
//         }]);
//     };

//     const addBlock = () => {
//         if (!selectedNode) return;

//         setNodes(prev => {
//             const updated = prev.map(node => {
//                 if (node.id === selectedNode) {
//                     const newIndex = node.blockchain.length + 1;
//                     const prevBlock = node.blockchain[node.blockchain.length - 1];
//                     const newBlock: Block = {
//                         index: newIndex,
//                         data: `Transaction ${newIndex}`,
//                         hash: `0x${Math.random().toString(16).slice(2, 6)}`,
//                         prevHash: prevBlock.hash,
//                         nonce: 0,
//                     };
//                     const newBlockchain = [...node.blockchain, newBlock];

//                     if (onBlockchainChange) {
//                         onBlockchainChange(newBlockchain);
//                     }

//                     return { ...node, blockchain: newBlockchain };
//                 }
//                 return node;
//             });
//             return updated;
//         });
//     };

//     const updateBlock = useCallback((blockIndex: number, hash: string, nonce: number) => {
//         if (!selectedNode) return;

//         setNodes(prev => {
//             const updated = prev.map(node => {
//                 if (node.id === selectedNode) {
//                     const newBlockchain = node.blockchain.map((block, idx) =>
//                         idx === blockIndex ? { ...block, hash, nonce } : block
//                     );

//                     if (onBlockchainChange) {
//                         onBlockchainChange(newBlockchain);
//                     }

//                     return { ...node, blockchain: newBlockchain };
//                 }
//                 return node;
//             });
//             return updated;
//         });
//     }, [selectedNode, onBlockchainChange]);

//     return (
//         <div className="w-full space-y-4 select-none">
//             <div className="flex gap-2 flex-wrap">
//                 <button
//                     onClick={addNode}
//                     className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-bold"
//                 >
//                     + Node
//                 </button>
//             </div>

//             <div
//                 ref={containerRef}
//                 className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden shadow-inner"
//                 onMouseMove={handleMouseMove}
//                 onMouseUp={handleMouseUp}
//                 onMouseLeave={handleMouseUp}
//             >
//                 <svg className="absolute inset-0 w-full h-full pointer-events-none">
//                     {connections.map((conn, i) => {
//                         const fromNode = nodes.find(n => n.id === conn.from);
//                         const toNode = nodes.find(n => n.id === conn.to);
//                         if (!fromNode || !toNode) return null;
//                         return (
//                             <line
//                                 key={`${conn.from}-${conn.to}-${i}`}
//                                 x1={`${fromNode.x}%`}
//                                 y1={`${fromNode.y}%`}
//                                 x2={`${toNode.x}%`}
//                                 y2={`${toNode.y}%`}
//                                 stroke="#334155"
//                                 strokeWidth="2"
//                             />
//                         );
//                     })}

//                     {draggingFrom && dragTarget && (
//                         <line
//                             x1={`${nodes.find(n => n.id === draggingFrom)?.x}%`}
//                             y1={`${nodes.find(n => n.id === draggingFrom)?.y}%`}
//                             x2={`${nodes.find(n => n.id === dragTarget)?.x}%`}
//                             y2={`${nodes.find(n => n.id === dragTarget)?.y}%`}
//                             stroke="#3b82f6"
//                             strokeWidth="2"
//                             strokeDasharray="5,5"
//                         />
//                     )}
//                 </svg>

//                 <AnimatePresence>
//                     {syncMessages.map(msg => {
//                         const fromNode = nodes.find(n => n.id === msg.from);
//                         const toNode = nodes.find(n => n.id === msg.to);
//                         if (!fromNode || !toNode) return null;

//                         const x = fromNode.x + (toNode.x - fromNode.x) * (msg.progress / 100);
//                         const y = fromNode.y + (toNode.y - fromNode.y) * (msg.progress / 100);

//                         return (
//                             <motion.div
//                                 key={msg.id}
//                                 className={`absolute w-2 h-2 rounded-full ${msg.isRecursive ? 'bg-blue-400 opacity-40' : 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]'
//                                     }`}
//                                 style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
//                                 initial={{ scale: 0 }}
//                                 animate={{ scale: 1 }}
//                                 exit={{ scale: 0 }}
//                             />
//                         );
//                     })}
//                 </AnimatePresence>

//                 {nodes.map(node => {
//                     const latestBlock = node.blockchain[node.blockchain.length - 1];
//                     const blockHeight = node.blockchain.length;
//                     const lastHashBytes = latestBlock.hash.slice(-4);
//                     const feedback = syncFeedback.find(f => f.nodeId === node.id);

//                     return (
//                         <div key={node.id} className="absolute" style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}>
//                             <motion.div
//                                 className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-white text-sm font-bold cursor-pointer z-10 ${movingNode === node.id ? '' : 'transition-all'} ${selectedNode === node.id ? 'bg-blue-600 border-blue-400 scale-110' : 'bg-slate-800 border-blue-500'
//                                     } ${draggingFrom === node.id ? 'ring-4 ring-yellow-400' : ''} ${movingNode === node.id ? 'ring-4 ring-green-400' : ''}`}
//                                 onClick={() => handleNodeSelect(node.id)}
//                                 onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
//                                 onMouseEnter={() => draggingFrom && setDragTarget(node.id)}
//                                 onMouseLeave={() => setDragTarget(null)}
//                                 whileHover={{ scale: 1.1 }}
//                                 whileTap={{ scale: 0.95 }}
//                             >
//                                 {node.id}
//                             </motion.div>
//                             <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs text-slate-300 font-mono whitespace-nowrap bg-slate-900/80 px-2 py-1 rounded">
//                                 #{blockHeight} ...{lastHashBytes}
//                             </div>
//                             {feedback && (
//                                 <motion.div
//                                     initial={{ opacity: 0, y: -10 }}
//                                     animate={{ opacity: 1, y: 0 }}
//                                     exit={{ opacity: 0 }}
//                                     className={`absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${feedback.accepted
//                                         ? 'bg-green-500 text-white'
//                                         : 'bg-red-500 text-white'
//                                         }`}
//                                 >
//                                     {feedback.accepted ? 'Accepted ✓' : 'Rejected ✗'}
//                                 </motion.div>
//                             )}
//                         </div>
//                     );
//                 })}
//             </div>

//             <p className="text-xs text-slate-500 text-center">
//                 Click to select • Double-click to move • Drag to connect/disconnect
//             </p>
//         </div>
//     );
// }
