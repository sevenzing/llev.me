import { useState, useRef, useCallback, useEffect } from "react";
import { Block, Node, Connection, SyncMessage, SyncFeedback, Transaction } from "@/lib/types";
import { mockedGenesisBlock } from "@/lib/mockData";
import { blockIsValid, calculateBlockHash, mineBlock } from "@/lib/blockchain";
import { ACCOUNTS, ec } from "@/lib/constants";
import { v4 as uuidv4 } from 'uuid';

const INITIAL_SQUARE_OFFSET = 25;
const INITIAL_SQUARE_SIZE = 50;

export function useEcosystem() {
    const [nodes, setNodes] = useState<Node[]>([
        { id: "A", x: INITIAL_SQUARE_OFFSET, y: INITIAL_SQUARE_OFFSET, blockchain: [mockedGenesisBlock()] },
        { id: "B", x: INITIAL_SQUARE_OFFSET + INITIAL_SQUARE_SIZE, y: INITIAL_SQUARE_OFFSET, blockchain: [mockedGenesisBlock()] },
        { id: "C", x: INITIAL_SQUARE_OFFSET, y: INITIAL_SQUARE_OFFSET + INITIAL_SQUARE_SIZE, blockchain: [mockedGenesisBlock()] },
        { id: "D", x: INITIAL_SQUARE_OFFSET + INITIAL_SQUARE_SIZE, y: INITIAL_SQUARE_OFFSET + INITIAL_SQUARE_SIZE, blockchain: [mockedGenesisBlock()] },
    ]);

    const [connections, setConnections] = useState<Connection[]>([
        { from: "A", to: "B" },
        { from: "B", to: "D" },
        { from: "A", to: "C" },
        { from: "C", to: "D" },
    ]);

    const [balances, setBalances] = useState<Record<string, number>>({
        'Alice': 150,
        'Bob': 150,
        'Charlie': 150
    });

    const [selectedNode, setSelectedNode] = useState<string>("A");
    const [syncMessages, setSyncMessages] = useState<SyncMessage[]>([]);
    const [syncFeedback, setSyncFeedback] = useState<SyncFeedback[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [autoSync, setAutoSync] = useState(false);
    const [draggingFrom, setDraggingFrom] = useState<string | null>(null);
    const [dragTarget, setDragTarget] = useState<string | null>(null);
    const [movingNode, setMovingNode] = useState<string | null>(null);
    const [miningBlock, setMiningBlock] = useState<{ nodeId: string; blockIndex: number } | null>(null);
    const [miningNonce, setMiningNonce] = useState<number>(0);
    const [miningHash, setMiningHash] = useState<string>("");
    const [allowInvalid, setAllowInvalid] = useState(false);
    const [autoMine, setAutoMine] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const syncIdRef = useRef(0);
    const feedbackIdRef = useRef(0);

    const nodesRef = useRef(nodes);
    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    const selectedBlockchain = nodes.find(n => n.id === selectedNode)?.blockchain || [];

    const handleBlockDataChange = useCallback((nodeId: string, index: number, data: any) => {
        setNodes(prev => prev.map(n => {
            if (n.id === nodeId) {
                const newChain = [...n.blockchain];
                newChain[index] = { ...newChain[index], data };
                // Trigger hash recalculation
                calculateBlockHash(newChain[index].index, newChain[index].nonce, data, newChain[index].prevHash).then(h => {
                    setNodes(current => current.map(node => {
                        if (node.id === nodeId) {
                            const chain = [...node.blockchain];
                            // Careful: ensure index still exists and matches
                            if (chain[index]) {
                                chain[index] = { ...chain[index], hash: h };
                            }
                            return { ...node, blockchain: chain };
                        }
                        return node;
                    }));
                });
                return { ...n, blockchain: newChain };
            }
            return n;
        }));
    }, []);

    const handleBlockNonceChange = useCallback((nodeId: string, index: number, nonce: number) => {
        setNodes(prev => prev.map(n => {
            if (n.id === nodeId) {
                const newChain = [...n.blockchain];
                newChain[index] = { ...newChain[index], nonce };
                calculateBlockHash(newChain[index].index, nonce, newChain[index].data, newChain[index].prevHash).then(h => {
                    setNodes(current => current.map(node => {
                        if (node.id === nodeId) {
                            const chain = [...node.blockchain];
                            if (chain[index]) {
                                chain[index] = { ...chain[index], hash: h };
                            }
                            return { ...node, blockchain: chain };
                        }
                        return node;
                    }));
                });
                return { ...n, blockchain: newChain };
            }
            return n;
        }));
    }, []);

    const validateSignature = useCallback(async (tx: Transaction): Promise<boolean> => {
        try {
            const sender = ACCOUNTS.find(a => `0x${ec.keyFromPrivate(a.privateKey).getPublic('hex').slice(-40)}` === tx.from);
            if (!sender) return false;

            const keyPair = ec.keyFromPublic(ec.keyFromPrivate(sender.privateKey).getPublic('hex'), 'hex');
            const msgData = {
                from: tx.from,
                to: tx.to,
                amount: tx.amount,
                fee: tx.fee
            };
            const msgBuffer = new TextEncoder().encode(JSON.stringify(msgData));
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));

            return keyPair.verify(hashArray, tx.signature!);
        } catch (e) {
            return false;
        }
    }, []);

    const validateChain = useCallback((chain: Block[]): boolean => {
        if (chain.length === 0) return false;
        for (let i = 0; i < chain.length; i++) {
            const block = chain[i];
            if (!blockIsValid(block)) return false;
            if (i > 0) {
                const prevBlock = chain[i - 1];
                if (block.prevHash !== prevBlock.hash) return false;
            }
        }
        return true;
    }, []);

    const handleSync = useCallback(async (fromId: string, toId: string, isRecursive = false, visitedNodes = new Set<string>()) => {
        const currentNodes = nodesRef.current;
        const fromNode = currentNodes.find(n => n.id === fromId);
        const toNode = currentNodes.find(n => n.id === toId);
        if (!fromNode || !toNode) return;

        const newVisitedNodes = new Set(visitedNodes);
        newVisitedNodes.add(fromId);
        newVisitedNodes.add(toId);

        const syncId = syncIdRef.current++;
        const feedbackId = feedbackIdRef.current++;

        setSyncMessages(prev => [...prev, {
            id: syncId,
            from: fromId,
            to: toId,
            timestamp: Date.now(),
            progress: 0,
            isRecursive
        }]);

        const duration = isRecursive ? 500 : 1000;
        const startTime = Date.now();
        await new Promise<void>(resolve => {
            const animate = () => {
                const now = Date.now();
                const progress = Math.min(100, ((now - startTime) / duration) * 100);
                setSyncMessages(prev => prev.map(msg => msg.id === syncId ? { ...msg, progress } : msg));
                if (progress < 100) requestAnimationFrame(animate);
                else resolve();
            };
            requestAnimationFrame(animate);
        });

        const latestNodes = nodesRef.current;
        const latestFromNode = latestNodes.find(n => n.id === fromId);
        const latestToNode = latestNodes.find(n => n.id === toId);
        if (!latestFromNode || !latestToNode) return;

        const fromValid = validateChain(latestFromNode.blockchain);
        const toValid = validateChain(latestToNode.blockchain);

        // Verify all transactions in the incoming chain are valid
        let allTransactionsValid = true;
        if (!allowInvalid) {
            for (let i = 0; i < latestFromNode.blockchain.length; i++) {
                const block = latestFromNode.blockchain[i];
                if (Array.isArray(block.data)) {
                    for (const tx of block.data) {
                        const result = await validateTransaction(tx, latestFromNode.blockchain, i);
                        if (!result.valid) {
                            allTransactionsValid = false;
                            break;
                        }
                    }
                }
                if (!allTransactionsValid) break;
            }
        }

        const isLonger = latestFromNode.blockchain.length > latestToNode.blockchain.length;
        const isIdentical = latestFromNode.blockchain.length === latestToNode.blockchain.length &&
            JSON.stringify(latestFromNode.blockchain) === JSON.stringify(latestToNode.blockchain);

        const shouldAccept = fromValid && allTransactionsValid && (isLonger || !toValid || isIdentical);

        setSyncFeedback(prev => [...prev, {
            id: feedbackId,
            nodeId: toId,
            accepted: shouldAccept,
            timestamp: Date.now()
        }]);

        if (shouldAccept) {
            setNodes(prev => prev.map(node =>
                node.id === toId ? { ...node, blockchain: [...latestFromNode.blockchain] } : node
            ));

            const neighbors = connections
                .filter(c => c.from === toId || c.to === toId)
                .map(c => c.from === toId ? c.to : c.from)
                .filter(neighborId => !newVisitedNodes.has(neighborId));

            neighbors.forEach(neighborId => {
                setTimeout(() => {
                    handleSync(toId, neighborId, true, newVisitedNodes);
                }, 300);
            });
        }

        setTimeout(() => {
            setSyncMessages(prev => prev.filter(m => m.id !== syncId));
            setSyncFeedback(prev => prev.filter(f => f.id !== feedbackId));
        }, 2000);
    }, [connections, validateChain]);

    const propagateChain = useCallback(async (nodeId: string) => {
        setIsSyncing(true);
        const peers = connections
            .filter(c => c.from === nodeId || c.to === nodeId)
            .map(c => c.from === nodeId ? c.to : c.from);

        await Promise.all(peers.map(peerId => handleSync(nodeId, peerId)));
        setIsSyncing(false);
    }, [connections, handleSync]);

    const mineNodeBlock = useCallback(async (nodeId: string, blockIndex: number) => {
        const latestNodes = nodesRef.current;
        const node = latestNodes.find(n => n.id === nodeId);
        if (!node || blockIndex >= node.blockchain.length) return;

        const block = node.blockchain[blockIndex];
        setMiningBlock({ nodeId, blockIndex });
        setMiningNonce(0);
        setMiningHash("");

        try {
            // Validate all transactions in the block before mining
            if (!allowInvalid && Array.isArray(block.data)) {
                for (const tx of block.data) {
                    const result = await validateTransaction(tx, node.blockchain, blockIndex);
                    if (!result.valid) {
                        setError("invalidTx");
                        const feedbackId = feedbackIdRef.current++;
                        setSyncFeedback(prev => [...prev, {
                            id: feedbackId,
                            nodeId: nodeId,
                            accepted: false,
                            timestamp: Date.now()
                        }]);
                        setTimeout(() => {
                            setSyncFeedback(prev => prev.filter(f => f.id !== feedbackId));
                        }, 2000);
                        return;
                    }
                }
            }

            const { hash, nonce } = await mineBlock(
                block.index,
                block.data,
                block.prevHash,
                (currentNonce, currentHash) => {
                    setMiningNonce(currentNonce);
                    setMiningHash(currentHash);
                }
            );

            setNodes(prev => prev.map(n => {
                if (n.id === nodeId) {
                    const newChain = [...n.blockchain];
                    newChain[blockIndex] = { ...newChain[blockIndex], hash, nonce };
                    return { ...n, blockchain: newChain };
                }
                return n;
            }));

            if (autoSync) {
                setTimeout(() => propagateChain(nodeId), 500);
            }
        } finally {
            setMiningBlock(null);
        }
    }, [nodes, autoSync, propagateChain]);

    const sendTransaction = useCallback(async (tx: Transaction) => {
        if (!selectedNode) return;
        setError(null);

        // Validation
        if (!allowInvalid) {
            // Amount check
            if (tx.amount <= 0) {
                setError("invalidTx");
                // Show rejection feedback on node
                const feedbackId = feedbackIdRef.current++;
                setSyncFeedback(prev => [...prev, {
                    id: feedbackId,
                    nodeId: selectedNode,
                    accepted: false,
                    timestamp: Date.now()
                }]);
                setTimeout(() => {
                    setSyncFeedback(prev => prev.filter(f => f.id !== feedbackId));
                }, 2000);
                return;
            }

            const isValidSig = await validateSignature(tx);
            if (!isValidSig) {
                setError("invalidTx");
                // Show rejection feedback on node
                const feedbackId = feedbackIdRef.current++;
                setSyncFeedback(prev => [...prev, {
                    id: feedbackId,
                    nodeId: selectedNode,
                    accepted: false,
                    timestamp: Date.now()
                }]);
                setTimeout(() => {
                    setSyncFeedback(prev => prev.filter(f => f.id !== feedbackId));
                }, 2000);
                return;
            }

            // Balance check
            const sender = ACCOUNTS.find(a => `0x${ec.keyFromPrivate(a.privateKey).getPublic('hex').slice(-40)}` === tx.from);
            if (sender) {
                const currentBalance = balances[sender.name] || 0;
                if (tx.amount + tx.fee > currentBalance) {
                    setError("invalidTx");
                    // Show rejection feedback on node
                    const feedbackId = feedbackIdRef.current++;
                    setSyncFeedback(prev => [...prev, {
                        id: feedbackId,
                        nodeId: selectedNode,
                        accepted: false,
                        timestamp: Date.now()
                    }]);
                    setTimeout(() => {
                        setSyncFeedback(prev => prev.filter(f => f.id !== feedbackId));
                    }, 2000);
                    return;
                }
            }
        } else if (!tx.isValid) {
            // If cheat mode is on and tx is invalid, show "Accepted INVALID"
            const feedbackId = feedbackIdRef.current++;
            setSyncFeedback(prev => [...prev, {
                id: feedbackId,
                nodeId: selectedNode,
                accepted: true,
                isWarning: true,
                timestamp: Date.now()
            }]);
            setTimeout(() => {
                setSyncFeedback(prev => prev.filter(f => f.id !== feedbackId));
            }, 2000);
        }

        // Update balances immediately for the wallet UI
        setBalances(prev => {
            const newBalances = { ...prev };
            const sender = ACCOUNTS.find(a => `0x${ec.keyFromPrivate(a.privateKey).getPublic('hex').slice(-40)}` === tx.from);
            const recipient = ACCOUNTS.find(a => `0x${ec.keyFromPrivate(a.privateKey).getPublic('hex').slice(-40)}` === tx.to);

            if (sender) {
                newBalances[sender.name] = Math.round(((newBalances[sender.name] || 0) - (tx.amount + tx.fee)) * 1e8) / 1e8;
            }
            if (recipient) {
                newBalances[recipient.name] = Math.round(((newBalances[recipient.name] || 0) + tx.amount) * 1e8) / 1e8;
            }
            return newBalances;
        });

        setNodes(prev => prev.map(node => {
            if (node.id === selectedNode) {
                const blockchain = [...node.blockchain];
                const lastBlock = blockchain[blockchain.length - 1];

                if (blockIsValid(lastBlock)) {
                    const newIndex = blockchain.length;
                    const newBlock: Block = {
                        index: newIndex,
                        data: [tx],
                        nonce: 0,
                        prevHash: lastBlock.hash,
                        hash: ''
                    };
                    calculateBlockHash(newIndex, 0, [tx], lastBlock.hash).then(h => {
                        setNodes(currentNodes => currentNodes.map(n => {
                            if (n.id === node.id && n.blockchain.length === newIndex + 1) {
                                const updatedChain = [...n.blockchain];
                                updatedChain[newIndex] = { ...updatedChain[newIndex], hash: h };
                                return { ...n, blockchain: updatedChain };
                            }
                            return n;
                        }));
                    });

                    if (autoMine && !miningBlock) {
                        setTimeout(() => mineNodeBlock(node.id, newIndex), 100);
                    }

                    return { ...node, blockchain: [...blockchain, newBlock] };
                } else {
                    const updatedBlock = {
                        ...lastBlock,
                        data: Array.isArray(lastBlock.data) ? [...lastBlock.data, tx] : [tx]
                    };
                    const updatedChain = [...blockchain];
                    const targetIndex = updatedChain.length - 1;
                    updatedChain[targetIndex] = updatedBlock;

                    calculateBlockHash(updatedBlock.index, updatedBlock.nonce, updatedBlock.data, updatedBlock.prevHash).then(h => {
                        setNodes(currentNodes => currentNodes.map(n => {
                            if (n.id === node.id) {
                                const chain = [...n.blockchain];
                                chain[targetIndex] = { ...chain[targetIndex], hash: h };
                                return { ...n, blockchain: chain };
                            }
                            return n;
                        }));
                    });

                    if (autoMine && !miningBlock) {
                        setTimeout(() => mineNodeBlock(node.id, updatedBlock.index), 100);
                    }

                    return { ...node, blockchain: updatedChain };
                }
            }
            return node;
        }));
    }, [selectedNode, allowInvalid, validateSignature, balances, autoMine, miningBlock, mineNodeBlock]);

    const addNode = useCallback(() => {
        const newId = String.fromCharCode(65 + nodes.length);
        const newNode: Node = {
            id: newId,
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            blockchain: [mockedGenesisBlock()]
        };
        setNodes(prev => [...prev, newNode]);
    }, [nodes]);

    const validateTransaction = useCallback(async (tx: Transaction, blockchain: Block[], blockIndex: number) => {
        // 1. Amount check
        if (tx.amount <= 0) return { valid: false, reason: "Amount must be > 0" };

        // 2. Signature check
        const isValidSig = await validateSignature(tx);
        if (!isValidSig) return { valid: false, reason: "Invalid signature" };

        // 3. Double spend check
        for (let i = 1; i <= blockIndex; i++) {
            const block = blockchain[i];
            if (Array.isArray(block.data)) {
                for (const existingTx of block.data) {
                    // Check if it's the exact same transaction (by ID or properties)
                    // But if it's the current transaction we are validating in the current block, skip it
                    if (existingTx === tx) continue;
                    if (existingTx.id === tx.id) return { valid: false, reason: "Duplicate transaction (Double spend)" };
                }
            }
        }

        // 4. Balance check
        const sender = ACCOUNTS.find(a => `0x${ec.keyFromPrivate(a.privateKey).getPublic('hex').slice(-40)}` === tx.from);
        if (sender) {
            let currentBalance = 150; // Initial balance matching useEcosystem
            for (let i = 1; i <= blockIndex; i++) {
                const block = blockchain[i];
                if (Array.isArray(block.data)) {
                    for (const existingTx of block.data) {
                        if (existingTx === tx) break; // Don't count the current transaction yet

                        if (existingTx.from === tx.from) {
                            currentBalance -= (existingTx.amount + existingTx.fee);
                        }
                        if (existingTx.to === tx.from) {
                            currentBalance += existingTx.amount;
                        }
                    }
                }
            }
            if (tx.amount + tx.fee > currentBalance) {
                return { valid: false, reason: `Insufficient funds (Balance: ${Math.round(currentBalance * 100) / 100})` };
            }
        }

        return { valid: true };
    }, [validateSignature]);

    const stealMoney = useCallback(async () => {
        if (!selectedNode) return;
        const sender = ACCOUNTS[0]; // Alice
        const recipient = ACCOUNTS[2]; // Charlie
        const senderAddress = `0x${ec.keyFromPrivate(sender.privateKey).getPublic('hex').slice(-40)}`;
        const recipientAddress = `0x${ec.keyFromPrivate(recipient.privateKey).getPublic('hex').slice(-40)}`;

        const txData = {
            from: senderAddress,
            to: recipientAddress,
            amount: 50,
            fee: 0.1
        };

        const transaction: Transaction = {
            id: uuidv4(),
            ...txData,
            signature: 'FORGED_SIGNATURE_0x' + Math.random().toString(16).slice(2, 10),
            hash: 'forged_hash_' + Math.random().toString(16).slice(2, 10),
            isValid: false
        };

        await sendTransaction(transaction);
    }, [selectedNode, sendTransaction]);

    return {
        nodes,
        connections,
        balances,
        selectedNode,
        selectedBlockchain,
        syncMessages,
        syncFeedback,
        isSyncing,
        autoSync,
        draggingFrom,
        dragTarget,
        movingNode,
        miningBlock,
        miningNonce,
        miningHash,
        allowInvalid,
        autoMine,
        error,
        setNodes,
        setConnections,
        setDraggingFrom,
        setDragTarget,
        setMovingNode,
        setAutoSync,
        setAllowInvalid,
        setAutoMine,
        setError,
        selectNode: setSelectedNode,
        sendTransaction,
        stealMoney,
        mineNodeBlock,
        propagateChain,
        addNode,
        handleBlockDataChange,
        handleBlockNonceChange,
        validateTransaction
    };
}
