import { renderHook, act } from '@testing-library/react';
import { useNetwork } from '../hooks/useNetwork';
import { blockIsValid } from '@/lib/blockchain';

// Mock blockchain module
jest.mock('../lib/blockchain', () => {
    const original = jest.requireActual('../lib/blockchain');
    return {
        ...original,
        calculateBlockHash: jest.fn().mockImplementation(async (index, nonce, data, prevHash) => {
            return `hash-${index}-${nonce}-${data}-${prevHash}`.substring(0, 64);
        }),
        mineBlock: jest.fn().mockImplementation(async (index, data, prevHash) => {
            return { hash: `0000-mined-${index}-${data.substring(0, 5)}`, nonce: 12345 };
        })
    };
});

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => {
    return setTimeout(cb, 0) as any;
};

describe('Network Logic', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('Scenario: Recursive Sync should not revert chain state', async () => {
        const { result } = renderHook(() => useNetwork());

        // 1. Setup: A has 2 blocks. B and C have 1.
        // Connect B and C for this test
        await act(async () => {
            result.current.setConnections([...result.current.connections, { from: 'B', to: 'C' }]);
        });

        // Add block to A
        await act(async () => {
            // Select A
            result.current.selectNode('A');
        });

        await act(async () => {
            await result.current.addBlock();
        });

        // Mine block 1 on A (index 1)
        await act(async () => {
            await result.current.mineBlockAtIndex('A', 1);
        });

        // Verify A has 2 blocks
        expect(result.current.nodes.find(n => n.id === 'A')?.blockchain.length).toBe(2);
        expect(result.current.nodes.find(n => n.id === 'B')?.blockchain.length).toBe(1);
        expect(result.current.nodes.find(n => n.id === 'C')?.blockchain.length).toBe(1);

        // 2. Sync A -> B
        // This triggers recursive sync B -> C
        await act(async () => {
            result.current.handleSync('A', 'B');
        });

        // Fast-forward animation (1000ms)
        await act(async () => {
            jest.advanceTimersByTime(1100);
        });

        // B should have 2 blocks now
        expect(result.current.nodes.find(n => n.id === 'B')?.blockchain.length).toBe(2);

        // Recursive sync B -> C is scheduled (300ms delay)
        await act(async () => {
            jest.advanceTimersByTime(400);
        });

        // Recursive sync B -> C animation (500ms)
        await act(async () => {
            jest.advanceTimersByTime(600);
        });

        // C should have 2 blocks now
        // If stale closure bug exists, B (stale) had 1 block, C (stale) had 1 block.
        // 1 >= 1 is true. C gets updated to 1 block (no change effectively, but if C had 2 blocks from elsewhere it would revert).

        // To strictly prove the revert, we need C to ALREADY have 2 blocks when B->C runs.
        // Let's simulate A->C happening in parallel or before B->C.

        // But simply checking if C gets 2 blocks from B is enough to prove B sent the *latest* chain.
        // If B sent stale chain, it would send 1 block.
        // C has 1 block. 1 >= 1. C accepts 1 block.
        // So C would have 1 block.

        // If B sent latest chain, it sends 2 blocks.
        // C has 1 block. 2 >= 1. C accepts 2 blocks.
        // So C would have 2 blocks.

        expect(result.current.nodes.find(n => n.id === 'C')?.blockchain.length).toBe(2);
    });

    test('Scenario: Syncing identical chain should be accepted', async () => {
        const { result } = renderHook(() => useNetwork());

        // 1. Setup: A and B have identical genesis blocks
        expect(result.current.nodes.find(n => n.id === 'A')?.blockchain.length).toBe(1);
        expect(result.current.nodes.find(n => n.id === 'B')?.blockchain.length).toBe(1);

        // 2. Sync A -> B
        await act(async () => {
            result.current.handleSync('A', 'B');
        });

        // Fast-forward animation (1000ms)
        await act(async () => {
            jest.advanceTimersByTime(1100);
        });

        // 3. Verify feedback indicates acceptance
        const feedback = result.current.syncFeedback.find(f => f.nodeId === 'B');
        expect(feedback).toBeDefined();
        expect(feedback?.accepted).toBe(true);
    });

    test('Scenario: Tampering, Validation, and Recovery', async () => {
        const { result } = renderHook(() => useNetwork());

        // 1. Setup: Mine Genesis, Add and mine block on A (A: 2 blocks)
        await act(async () => {
            result.current.selectNode('A');
        });
        // Mine Genesis first to ensure consistent state across network
        await act(async () => {
            await result.current.mineBlockAtIndex('A', 0);
        });

        await act(async () => {
            await result.current.addBlock();
        });
        await act(async () => {
            await result.current.mineBlockAtIndex('A', 1);
        });

        // Capture original data for restoration later
        const originalGenesisData = result.current.nodes.find(n => n.id === 'A')?.blockchain[0].data;
        const originalBlock1Data = result.current.nodes.find(n => n.id === 'A')?.blockchain[1].data;

        expect(result.current.nodes.find(n => n.id === 'A')?.blockchain.length).toBe(2);

        // Sync A -> B -> C (via propagateChain)
        await act(async () => {
            result.current.propagateChain('A');
        });
        // Fast-forward sync animation (ensure all recursions A->B->C and A->C->B settle)
        await act(async () => {
            jest.advanceTimersByTime(1100);
        });

        // B should have 2 blocks
        expect(result.current.nodes.find(n => n.id === 'B')?.blockchain.length).toBe(2);
        // C should have 2 blocks
        expect(result.current.nodes.find(n => n.id === 'C')?.blockchain.length).toBe(2);

        // Capture the "correct" hash for verification later
        const validHash = result.current.nodes.find(n => n.id === 'A')?.blockchain[1].hash;

        // 2. Tamper with A's latest block
        // Change data and mine (creating a valid but DIFFERENT chain of same length)
        const TAMPERED_DATA = 'TAMPERED_DATA';
        await act(async () => {
            await result.current.recalculateBlockHash('A', 1, TAMPERED_DATA);
        });
        await act(async () => {
            await result.current.mineBlockAtIndex('A', 1);
        });

        // Expect hash to be different (in a real scenario) or data to be different
        // Our mock might return same hash for same index, but data IS different, so JSON is different.
        expect(result.current.nodes.find(n => n.id === 'A')?.blockchain[1].data).toBe(TAMPERED_DATA);

        // Sync A -> B (and C) via propagateChain
        // B has correct chain (len 2). A has tampered chain (len 2).
        // Should be REJECTED.

        // Helper to find new feedback (get the LATEST one to avoid stale/recursive entries)
        const findNewFeedback = (nodeId: string, minId: number) => {
            return [...result.current.syncFeedback]
                .reverse()
                .find(f => f.id > minId && f.nodeId === nodeId);
        };

        const getMaxFeedbackId = () => Math.max(-1, ...result.current.syncFeedback.map(f => f.id));

        const maxIdBeforeTamper = getMaxFeedbackId();

        await act(async () => {
            result.current.propagateChain('A');
        });
        await act(async () => {
            jest.advanceTimersByTime(1100);
        });

        const feedbackTmp = findNewFeedback('B', maxIdBeforeTamper);
        expect(feedbackTmp).toBeDefined();
        expect(feedbackTmp?.accepted).toBe(false); // REJECTED

        // Verify B still has original data
        expect(result.current.nodes.find(n => n.id === 'B')?.blockchain[1].data).not.toBe(TAMPERED_DATA);

        // 3. Tamper with Genesis of A
        const TAMPERED_GENESIS = 'TAMPERED_GENESIS';
        await act(async () => {
            // Modify genesis (index 0)
            await result.current.recalculateBlockHash('A', 0, TAMPERED_GENESIS);
        });
        // Check that all blocks of nodes' A are not valid
        expect(result.current.nodes.find(n => n.id === 'A')?.blockchain.every(b => !blockIsValid(b))).toBe(true);
        // Note: In this simulation, altering genesis invalidates chain, but we will mine to fix it locally
        await act(async () => {
            await result.current.mineBlockAtIndex('A', 0);
            await result.current.mineBlockAtIndex('A', 1);
        });

        // A is valid again, length 2. Sync A -> B.
        // Should be REJECTED (same length, different content).
        const maxIdBeforeGenesis = getMaxFeedbackId();
        await act(async () => {
            result.current.propagateChain('A');
        });
        await act(async () => {
            jest.advanceTimersByTime(2000);
        });

        const feedbackGenesis = findNewFeedback('B', maxIdBeforeGenesis);
        expect(feedbackGenesis).toBeDefined();
        expect(feedbackGenesis?.accepted).toBe(false); // REJECTED

        // 4. Restore A and Sync
        // Revert Genesis and Block 1 to match B

        // Revert Genesis
        // Use captured original data
        await act(async () => {
            await result.current.recalculateBlockHash('A', 0, originalGenesisData);
        });
        // Mine Genesis
        await act(async () => {
            await result.current.mineBlockAtIndex('A', 0);
        });

        // Revert Block 1
        // Use captured original data
        await act(async () => {
            await result.current.recalculateBlockHash('A', 1, originalBlock1Data);
        });
        // Mine Block 1
        await act(async () => {
            await result.current.mineBlockAtIndex('A', 1);
        });

        // Now A should be identical to B (assuming mocks are deterministic)
        // Verify hashes match as per user request
        const hashA = result.current.nodes.find(n => n.id === 'A')?.blockchain[1].hash;
        const hashB = result.current.nodes.find(n => n.id === 'B')?.blockchain[1].hash;
        expect(hashA).toBe(hashB);

        // Sync A -> B
        const maxIdBeforeRestore = getMaxFeedbackId();
        await act(async () => {
            result.current.propagateChain('A');
        });
        await act(async () => {
            jest.advanceTimersByTime(2000);
        });

        const feedbackRestore = findNewFeedback('B', maxIdBeforeRestore);
        expect(feedbackRestore).toBeDefined();
        expect(feedbackRestore?.accepted).toBe(true); // ACCEPTED
    });
});
