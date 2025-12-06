import { renderHook, act } from '@testing-library/react';
import { useNetwork } from '../hooks/useNetwork';

// Mock blockchain module
jest.mock('../lib/blockchain', () => ({
    calculateBlockHash: jest.fn().mockImplementation(async (index, nonce, data, prevHash) => {
        return `hash-${index}-${nonce}-${data}-${prevHash}`.substring(0, 64);
    }),
    mineBlock: jest.fn().mockImplementation(async (index, data, prevHash) => {
        return { hash: `0000-mined-${index}`, nonce: 12345 };
    })
}));

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
});
