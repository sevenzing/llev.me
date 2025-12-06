import { renderHook, act } from '@testing-library/react';
import { useSingleBlockchain, useSingleBlockchainMocked } from '../hooks/useSingleBlockchain';
import { useNetwork } from '../hooks/useNetwork';
import { calculateBlockHash } from '../lib/blockchain';

// Mock blockchain module
jest.mock('../lib/blockchain', () => ({
    calculateBlockHash: jest.fn().mockImplementation(async (index, nonce, data, prevHash) => {
        return `hash-${index}-${nonce}-${data}-${prevHash}`.substring(0, 64);
    }),
    mineBlock: jest.fn().mockImplementation(async (index, data, prevHash) => {
        return { hash: `0000-mined-${index}`, nonce: 12345 };
    })
}));

describe('Blockchain Logic', () => {
    test('Scenario 1: Chain Invalidation - Changing Block A should invalidate B and C', async () => {
        const { result } = renderHook(() => useSingleBlockchainMocked(3));

        // 1. Mine all blocks
        await act(async () => {
            await result.current.mineBlockAtIndex(0);
        });
        await act(async () => {
            await result.current.mineBlockAtIndex(1);
        });
        await act(async () => {
            await result.current.mineBlockAtIndex(2);
        });

        const hashA_Original = result.current.blocks[0].hash;
        const hashB_Original = result.current.blocks[1].hash;
        const hashC_Original = result.current.blocks[2].hash;

        // Verify all start with 0000 (mocked mining might be different, but let's assume mining works)
        // Actually, with our mock hash, mining might loop forever if we don't mock it to return 0000 eventually.
        // For this test, we might not need actual mining, just checking if hashes UPDATE.

        // 2. Change Data in Block A
        await act(async () => {
            await result.current.recalculateBlockHash(0, "New Data");
        });

        const hashA_New = result.current.blocks[0].hash;
        const hashB_New = result.current.blocks[1].hash;
        const hashC_New = result.current.blocks[2].hash;

        // Block A hash should change
        expect(hashA_New).not.toBe(hashA_Original);

        // Block B prevHash should match Block A new hash
        expect(result.current.blocks[1].prevHash).toBe(hashA_New);

        // Block B hash should ALSO change because its prevHash changed
        expect(hashB_New).not.toBe(hashB_Original);

        // Block C prevHash should match Block B new hash
        expect(result.current.blocks[2].prevHash).toBe(hashB_New);

        // Block C hash should ALSO change
        expect(hashC_New).not.toBe(hashC_Original);
    });

    test('Scenario 3: Mining Propagation - Mining B should invalidate C', async () => {
        const { result } = renderHook(() => useSingleBlockchainMocked(3));

        // Mine C first (weird but possible)
        await act(async () => {
            await result.current.mineBlockAtIndex(2);
        });
        const hashC_Original = result.current.blocks[2].hash;

        // Mine B
        await act(async () => {
            await result.current.mineBlockAtIndex(1);
        });

        const hashB_New = result.current.blocks[1].hash;
        const hashC_New = result.current.blocks[2].hash;

        // Block C prevHash should update to Block B's new hash
        expect(result.current.blocks[2].prevHash).toBe(hashB_New);

        // Block C's OWN hash should change because its input (prevHash) changed
        expect(hashC_New).not.toBe(hashC_Original);
    });
});
