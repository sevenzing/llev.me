import { renderHook, act } from '@testing-library/react';
import { useEcosystem } from '../hooks/useEcosystem';
import { blockIsValid } from '@/lib/blockchain';
import { ACCOUNTS, ec } from '@/lib/constants';
import { mockedGenesisBlock } from '@/lib/mockData';

// Mock blockchain module
jest.mock('../lib/blockchain', () => {
    const original = jest.requireActual('../lib/blockchain');
    return {
        ...original,
        calculateBlockHash: jest.fn().mockImplementation(async (index, nonce, data, prevHash) => {
            return `hash-${index}-${nonce}-${JSON.stringify(data)}-${prevHash}`.substring(0, 64);
        }),
        mineBlock: jest.fn().mockImplementation(async (index, data, prevHash) => {
            return { hash: `0000-mined-${index}-${JSON.stringify(data).substring(0, 5)}`, nonce: 12345 };
        })
    };
});

// Mock crypto
const nodeCrypto = require('crypto');
Object.defineProperty(global, 'crypto', {
    value: {
        subtle: {
            digest: (algorithm: string, data: Uint8Array) => {
                return Promise.resolve(nodeCrypto.createHash('sha256').update(data).digest());
            }
        }
    }
});

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => {
    return setTimeout(cb, 0) as any;
};

describe('Ecosystem Logic', () => {
    // Helper to sign transactions for tests
    const signTx = async (tx: any) => {
        const msgData = { from: tx.from, to: tx.to, amount: tx.amount, fee: tx.fee };
        const msgBuffer = new TextEncoder().encode(JSON.stringify(msgData));
        const hashBuffer = await global.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return ec.keyFromPrivate(ACCOUNTS[0].privateKey).sign(hashArray).toDER('hex');
    };

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('Transaction validation should reject invalid signature', async () => {
        const { result } = renderHook(() => useEcosystem());

        const invalidTx = {
            id: '1',
            from: `0x${ec.keyFromPrivate(ACCOUNTS[0].privateKey).getPublic('hex').slice(-40)}`,
            to: '0xrecipient',
            amount: 10,
            fee: 1,
            signature: 'invalid_sig',
            hash: 'tx_hash',
            timestamp: Date.now()
        };

        await act(async () => {
            if (result.current.sendTransaction) {
                await result.current.sendTransaction(invalidTx);
            }
        });

        expect(result.current.error).toBe('invalidTx');
    });

    test('autoMine should trigger mining after sending transaction', async () => {
        const { result } = renderHook(() => useEcosystem());

        act(() => {
            result.current.setAutoMine?.(true);
            result.current.setAllowInvalid?.(true);
        });

        const tx = {
            id: 'auto-mine-tx',
            from: '0xfrom',
            to: '0xto',
            amount: 10,
            fee: 0,
            signature: 'sig',
            hash: 'h',
            timestamp: Date.now()
        };

        await act(async () => {
            if (result.current.sendTransaction) {
                await result.current.sendTransaction(tx);
            }
        });

        // Fast-forward timers for auto-mine
        await act(async () => {
            jest.runOnlyPendingTimers();
        });

        // Wait for all promises (calculateBlockHash and mineNodeBlock -> mineBlock)
        await act(async () => {
            await Promise.resolve(); // flush calculateBlockHash
            await Promise.resolve(); // flush mineNodeBlock start
            await Promise.resolve(); // flush mineBlock
            await Promise.resolve(); // flush state update
        });

        expect(result.current.selectedBlockchain.length).toBe(2);
        // The last block should be mined
        expect(result.current.selectedBlockchain[1].hash).toMatch(/^0000/);
    });

    test('validateTransaction should detect double spending', async () => {
        const { result } = renderHook(() => useEcosystem());

        const tx = {
            id: 'unique-id-1',
            from: `0x${ec.keyFromPrivate(ACCOUNTS[0].privateKey).getPublic('hex').slice(-40)}`,
            to: `0x${ec.keyFromPrivate(ACCOUNTS[1].privateKey).getPublic('hex').slice(-40)}`,
            amount: 50,
            fee: 1,
            hash: 'tx_hash',
            timestamp: Date.now(),
            signature: ''
        };
        tx.signature = await signTx(tx);

        const blockchain = [
            mockedGenesisBlock(),
            { index: 1, data: [tx], nonce: 123, prevHash: 'hash', hash: 'hash1' } as any
        ];

        let validation: any;
        await act(async () => {
            if (result.current.validateTransaction) {
                validation = await result.current.validateTransaction({ ...tx }, blockchain, 1);
            }
        });
        expect(validation?.valid).toBe(false);
        expect(validation?.reason).toContain('Duplicate transaction');
    });

    test('handleSync should reject chain with invalid transaction', async () => {
        const { result } = renderHook(() => useEcosystem());

        const invalidTx = {
            id: 'bad-tx',
            from: '0xA',
            to: '0xB',
            amount: -10,
            fee: 0,
            signature: 'sig',
            hash: 'h',
            timestamp: Date.now()
        };

        const badChain = [
            mockedGenesisBlock(),
            { index: 1, data: [invalidTx], nonce: 1, prevHash: mockedGenesisBlock().hash, hash: '0000-valid-hash' }
        ];

        await act(async () => {
            if (result.current.setNodes) {
                result.current.setNodes(prev => prev.map(n => n.id === 'A' ? { ...n, blockchain: badChain } : n));
            }
        });

        await act(async () => {
            if (result.current.propagateChain) {
                await result.current.propagateChain('A');
            }
        });

        act(() => {
            jest.advanceTimersByTime(1100);
        });

        // Wait for sync validation
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.nodes.find(n => n.id === 'B')?.blockchain.length).toBe(1);
    });

    test('mineNodeBlock should reject mining if transactions are invalid', async () => {
        const { result } = renderHook(() => useEcosystem());

        const invalidTx = {
            id: 'bad-tx-2',
            from: `0x${ec.keyFromPrivate(ACCOUNTS[0].privateKey).getPublic('hex').slice(-40)}`,
            to: '0xrecipient',
            amount: 1000,
            fee: 0,
            signature: '',
            hash: 'h',
            timestamp: Date.now()
        };
        invalidTx.signature = await signTx(invalidTx);

        const draftChain = [
            mockedGenesisBlock(),
            { index: 1, data: [invalidTx], nonce: 0, prevHash: mockedGenesisBlock().hash, hash: '' }
        ];

        await act(async () => {
            if (result.current.setNodes) {
                result.current.setNodes(prev => prev.map(n => n.id === 'A' ? { ...n, blockchain: draftChain } : n));
            }
        });

        await act(async () => {
            if (result.current.mineNodeBlock) {
                await result.current.mineNodeBlock('A', 1);
            }
        });

        expect(result.current.error).toBe('invalidTx');
    });
});
