import { useState, useRef, useCallback, useEffect } from "react";
import { Block, Node, Connection, SyncMessage, SyncFeedback } from "@/lib/types";
import { mockedBlockDataByIndex, mockedGenesisBlock } from "@/lib/mockData";
import { calculateBlockHash, mineBlock } from "@/lib/blockchain";

export function useNetwork() {
    const [nodes, setNodes] = useState<Node[]>([
        { id: "A", x: 20, y: 30, blockchain: [mockedGenesisBlock()] },
        { id: "B", x: 80, y: 30, blockchain: [mockedGenesisBlock()] },
        { id: "C", x: 50, y: 70, blockchain: [mockedGenesisBlock()] },
    ]);

    const [connections, setConnections] = useState<Connection[]>([
        { from: "A", to: "B" },
        { from: "B", to: "C" },
        { from: "A", to: "C" },
    ]);

    const [selectedNode, setSelectedNode] = useState<string>("A");
    const [syncMessages, setSyncMessages] = useState<SyncMessage[]>([]);
    const [syncFeedback, setSyncFeedback] = useState<SyncFeedback[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [draggingFrom, setDraggingFrom] = useState<string | null>(null);
    const [dragTarget, setDragTarget] = useState<string | null>(null);
    const [movingNode, setMovingNode] = useState<string | null>(null);
    const [miningBlock, setMiningBlock] = useState<{ nodeId: string; blockIndex: number } | null>(null);
    const [miningNonce, setMiningNonce] = useState<number>(0);

    const syncIdRef = useRef(0);
    const feedbackIdRef = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Keep a ref to nodes for async access in handleSync
    const nodesRef = useRef(nodes);
    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    // Get selected node's blockchain
    const selectedBlockchain = nodes.find(n => n.id === selectedNode)?.blockchain || [];

    // Validate blockchain
    const validateChain = useCallback((chain: Block[]): boolean => {
        if (chain.length === 0) return false;

        for (let i = 0; i < chain.length; i++) {
            const block = chain[i];

            if (!block.hash.startsWith('0000')) {
                return false;
            }

            if (i > 0) {
                const prevBlock = chain[i - 1];
                if (block.prevHash !== prevBlock.hash) {
                    return false;
                }
            }
        }

        return true;
    }, []);

    // Sync function
    const handleSync = useCallback(async (fromId: string, toId: string, isRecursive = false, visitedNodes = new Set<string>()) => {
        // Use ref to get latest nodes state, avoiding stale closures in recursive calls
        const currentNodes = nodesRef.current;
        const fromNode = currentNodes.find(n => n.id === fromId);
        const toNode = currentNodes.find(n => n.id === toId);

        if (!fromNode || !toNode) return;

        // Add current nodes to visited set
        const newVisitedNodes = new Set(visitedNodes);
        newVisitedNodes.add(fromId);
        newVisitedNodes.add(toId);

        const syncId = syncIdRef.current++;
        const feedbackId = feedbackIdRef.current++;

        // Start animation
        setSyncMessages(prev => [...prev, {
            id: syncId,
            from: fromId,
            to: toId,
            timestamp: Date.now(),
            progress: 0,
            isRecursive
        }]);

        // Animate progress
        const startTime = Date.now();
        // Faster animation for recursive syncs (500ms vs 1000ms)
        const duration = isRecursive ? 500 : 1000;

        await new Promise<void>(resolve => {
            const animate = () => {
                const now = Date.now();
                const progress = Math.min(100, ((now - startTime) / duration) * 100);

                setSyncMessages(prev => prev.map(msg =>
                    msg.id === syncId ? { ...msg, progress } : msg
                ));

                if (progress < 100) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });

        // Re-fetch nodes from ref after animation to ensure we have the very latest state
        // (State might have changed during the animation wait)
        const latestNodes = nodesRef.current;
        const latestFromNode = latestNodes.find(n => n.id === fromId);
        const latestToNode = latestNodes.find(n => n.id === toId);

        if (!latestFromNode || !latestToNode) return;

        const fromValid = validateChain(latestFromNode.blockchain);
        // We don't strictly need to validate 'to' node to accept, but good for logic
        // const toValid = validateChain(latestToNode.blockchain);

        // Allow accepting if chain is valid and length is greater OR equal
        const isLongerOrEqual = latestFromNode.blockchain.length >= latestToNode.blockchain.length;

        // User wants to see "Accepted" even if chains are identical
        const shouldAccept = fromValid && isLongerOrEqual;

        setSyncFeedback(prev => [...prev, {
            id: feedbackId,
            nodeId: toId,
            accepted: shouldAccept,
            timestamp: Date.now()
        }]);

        if (shouldAccept) {
            // Update the node's blockchain
            setNodes(prev => prev.map(node =>
                node.id === toId ? { ...node, blockchain: [...latestFromNode.blockchain] } : node
            ));

            // Recursive propagation: Sync to all neighbors of 'toId' that haven't been visited
            const neighbors = connections
                .filter(c => c.from === toId || c.to === toId)
                .map(c => c.from === toId ? c.to : c.from)
                .filter(neighborId => !newVisitedNodes.has(neighborId));

            // Trigger recursive syncs
            neighbors.forEach(neighborId => {
                // Add a small delay for visual clarity
                setTimeout(() => {
                    handleSync(toId, neighborId, true, newVisitedNodes);
                }, 300); // Shorter delay for recursive steps
            });
        }

        setTimeout(() => {
            setSyncMessages(prev => prev.filter(m => m.id !== syncId));
            setSyncFeedback(prev => prev.filter(f => f.id !== feedbackId));
        }, 2000);
    }, [connections, validateChain]);

    // Add block to selected node
    const addBlock = useCallback(async () => {
        if (!selectedNode) return;

        const node = nodes.find(n => n.id === selectedNode);
        if (!node) return;

        const lastBlock = node.blockchain[node.blockchain.length - 1];
        const newIndex = node.blockchain.length;
        const data = mockedBlockDataByIndex(newIndex);

        // Calculate initial hash for the new block
        const initialHash = await calculateBlockHash(
            newIndex,
            0,
            data,
            lastBlock.hash
        );

        const newBlock: Block = {
            index: newIndex,
            data,
            hash: initialHash,
            prevHash: lastBlock.hash,
            nonce: 0
        };

        setNodes(prev => prev.map(n => {
            if (n.id === selectedNode) {
                return { ...n, blockchain: [...n.blockchain, newBlock] };
            }
            return n;
        }));
    }, [selectedNode, nodes]);

    // Helper to propagate changes to subsequent blocks
    const propagateChanges = useCallback(async (currentBlocks: Block[], startIndex: number, newHash: string) => {
        const newBlocks = [...currentBlocks];

        // Update the start block's hash
        const startBlockIdx = newBlocks.findIndex(b => b.index === startIndex);
        if (startBlockIdx === -1) return newBlocks;

        newBlocks[startBlockIdx] = { ...newBlocks[startBlockIdx], hash: newHash };

        // Propagate to subsequent blocks
        for (let i = startBlockIdx + 1; i < newBlocks.length; i++) {
            const prevBlock = newBlocks[i - 1];
            const currentBlock = newBlocks[i];

            // Update prevHash
            const updatedBlock = { ...currentBlock, prevHash: prevBlock.hash };

            // Recalculate hash for this block because its prevHash changed
            const newBlockHash = await calculateBlockHash(
                updatedBlock.index,
                updatedBlock.nonce,
                updatedBlock.data,
                updatedBlock.prevHash
            );

            updatedBlock.hash = newBlockHash;
            newBlocks[i] = updatedBlock;
        }

        return newBlocks;
    }, []);

    // Update block in selected node
    const updateBlock = useCallback(async (blockIndex: number, hash: string, nonce: number, data: string) => {
        if (!selectedNode) return;

        // This function seems unused or redundant with recalculateBlockHash/updateNonce?
        // But if used, it needs to propagate too.
        // Let's assume it's used for generic updates.

        const node = nodes.find(n => n.id === selectedNode);
        if (!node) return;

        const currentBlocks = [...node.blockchain];
        const idx = currentBlocks.findIndex(b => b.index === blockIndex);
        if (idx !== -1) {
            currentBlocks[idx] = { ...currentBlocks[idx], hash, nonce, data };
            // If hash changed, propagate? Or if data/nonce changed, we should recalculate hash?
            // The signature implies hash is passed in.
            // If hash is passed, we assume it's correct for the data/nonce.
            // But we MUST propagate to next blocks.
            const updatedBlocks = await propagateChanges(currentBlocks, blockIndex, hash);

            setNodes(prev => prev.map(n =>
                n.id === selectedNode ? { ...n, blockchain: updatedBlocks } : n
            ));
        }
    }, [selectedNode, nodes, propagateChanges]);

    // Mine a block at a specific index for a given node
    const mineBlockAtIndex = useCallback(async (nodeId: string, blockIndex: number) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node || blockIndex >= node.blockchain.length) return;

        const block = node.blockchain[blockIndex];
        setMiningBlock({ nodeId, blockIndex });
        setMiningNonce(0);

        try {
            const { hash, nonce } = await mineBlock(
                block.index,
                block.data,
                block.prevHash,
                (currentNonce, currentHash) => {
                    setMiningNonce(currentNonce);
                }
            );

            // Update and propagate
            const currentBlocks = [...node.blockchain];
            const idx = currentBlocks.findIndex(b => b.index === blockIndex);
            if (idx !== -1) {
                currentBlocks[idx] = { ...currentBlocks[idx], nonce };
                const updatedBlocks = await propagateChanges(currentBlocks, blockIndex, hash);

                setNodes(prevNodes => prevNodes.map(n =>
                    n.id === nodeId ? { ...n, blockchain: updatedBlocks } : n
                ));
            }
        } finally {
            setMiningBlock(null);
        }
    }, [nodes, propagateChanges]);

    // Recalculate hash when block data changes
    const recalculateBlockHash = useCallback(async (nodeId: string, blockIndex: number, newData: any) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node || blockIndex >= node.blockchain.length) return;

        const block = node.blockchain[blockIndex];
        const hash = await calculateBlockHash(block.index, block.nonce, newData, block.prevHash);

        const currentBlocks = [...node.blockchain];
        const idx = currentBlocks.findIndex(b => b.index === blockIndex);
        if (idx !== -1) {
            currentBlocks[idx] = { ...currentBlocks[idx], data: newData };
            const updatedBlocks = await propagateChanges(currentBlocks, blockIndex, hash);

            setNodes(prevNodes => prevNodes.map(n =>
                n.id === nodeId ? { ...n, blockchain: updatedBlocks } : n
            ));
        }
    }, [nodes, propagateChanges]);

    // Update nonce manually
    const updateNonce = useCallback(async (nodeId: string, blockIndex: number, newNonce: number) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node || blockIndex >= node.blockchain.length) return;

        const block = node.blockchain[blockIndex];
        const hash = await calculateBlockHash(block.index, newNonce, block.data, block.prevHash);

        const currentBlocks = [...node.blockchain];
        const idx = currentBlocks.findIndex(b => b.index === blockIndex);
        if (idx !== -1) {
            currentBlocks[idx] = { ...currentBlocks[idx], nonce: newNonce };
            const updatedBlocks = await propagateChanges(currentBlocks, blockIndex, hash);

            setNodes(prevNodes => prevNodes.map(n =>
                n.id === nodeId ? { ...n, blockchain: updatedBlocks } : n
            ));
        }
    }, [nodes, propagateChanges]);

    // Propagate chain from a node to its peers
    const propagateChain = useCallback(async (nodeId: string) => {
        setIsSyncing(true);
        const peers = connections
            .filter(c => c.from === nodeId || c.to === nodeId)
            .map(c => c.from === nodeId ? c.to : c.from);

        await Promise.all(peers.map(peerId => handleSync(nodeId, peerId)));
        setIsSyncing(false);
    }, [connections, handleSync]);

    // Add new node to network
    const addNode = useCallback(() => {
        const newId = String.fromCharCode(65 + nodes.length);
        const newNode: Node = {
            id: newId,
            x: 50,
            y: 50,
            blockchain: [mockedGenesisBlock()]
        };
        setNodes(prev => [...prev, newNode]);
    }, [nodes]);

    // Select a node
    const selectNode = useCallback((nodeId: string) => {
        setSelectedNode(nodeId);
    }, []);

    return {
        // State
        nodes,
        connections,
        selectedNode,
        selectedBlockchain,
        syncMessages,
        syncFeedback,
        isSyncing,
        draggingFrom,
        dragTarget,
        movingNode,
        miningBlock,
        miningNonce,
        containerRef,

        // Actions
        setNodes,
        setConnections,
        setDraggingFrom,
        setDragTarget,
        setMovingNode,
        selectNode,
        handleSync,
        propagateChain,
        addBlock,
        addNode,
        updateBlock,
        mineBlockAtIndex,
        recalculateBlockHash,
        updateNonce,
    };
}
