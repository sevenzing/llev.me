import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { MempoolPlayground } from './MempoolPlayground';
import { LanguageProvider } from '@/contexts/LanguageContext';
import '@testing-library/jest-dom';

// --- Mocks ---

// Mock crypto.subtle.digest
Object.defineProperty(global, 'crypto', {
    value: {
        subtle: {
            digest: jest.fn().mockImplementation(async (algo, data) => {
                // Return a deterministic 32-byte "hash" for secp256k1 (needs 32 bytes)
                return new Uint8Array(new Array(32).fill(1)).buffer;
            }),
        },
    },
});

// Mock TextEncoder
global.TextEncoder = class {
    encode(input: string) {
        return new Uint8Array(input.length); // Simplified mock
    }
} as any;

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

// Mock uuid to return deterministic IDs for easier asserting
jest.mock('uuid', () => {
    let count = 0;
    return {
        v4: () => `test-id-${++count}`
    };
});

// Mock elliptic
jest.mock('elliptic', () => {
    return {
        ec: class {
            constructor(curve: string) { }
            keyFromPrivate(priv: string) {
                return {
                    getPublic: (fmt: string) => '04' + '1'.repeat(128), // 65 bytes uncompressed, or just a hex string
                    sign: (hash: any) => {
                        return { toDER: (fmt: string) => 'dummy-signature-hex' };
                    }
                };
            }
            keyFromPublic(pub: string) {
                return {
                    verify: (hash: any, signature: any) => true
                };
            }
        }
    };
});



// Mock MempoolQueue to avoid animation issues and isolate logic
jest.mock('./MempoolQueue', () => ({
    MempoolQueue: ({ transactions }: any) => (
        <div data-testid="mempool-queue">
            {transactions.length === 0 ? (
                <div>Queue is empty</div>
            ) : (
                transactions.map((tx: any) => (
                    <div key={tx.id}>
                        <span>{tx.amount}</span>
                        <span>+{tx.fee}</span>
                        {/* Render validation status for Scenario 3 checks */}
                        {tx.isValid === false && <span>Unsigned</span>}
                    </div>
                ))
            )}
        </div>
    )
}));

// Mock blockchain lib to avoid infinite loop (since crypto mock doesn't produce 0000)
jest.mock('../../lib/blockchain', () => ({
    mineBlock: async (blockNumber: number, data: any, prevHash: string) => {
        return { hash: '0000' + '1'.repeat(60), nonce: 12345 };
    },
    calculateBlockHash: async () => '0000mockhash',
    hashIsValid: () => true,
    blockIsValid: () => true
}));

describe('MempoolPlayground', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    // Helper: Fill form and send
    const createTransaction = async (amount: string, fee: string, sign: boolean, confirmUnsigned: boolean = false) => {
        // 1. Set Amount & Fee
        const inputs = screen.getAllByRole('spinbutton');
        const amountInput = inputs[0];
        const feeInput = inputs[1];

        fireEvent.change(amountInput, { target: { value: amount } });
        fireEvent.change(feeInput, { target: { value: fee } });

        // 3. Sign if needed
        if (sign) {
            const signBtn = screen.getByRole('button', { name: /sign/i });
            // Wait for button to be ready (cleared from previous state)
            await waitFor(() => {
                expect(signBtn).toBeEnabled();
                expect(signBtn).toHaveTextContent(/sign/i); // Ensure it says "Sign" not "Signed" initially
            }, { timeout: 3000 });

            fireEvent.click(signBtn);
            // Button text changes to "Signed"
            // Since we mocked elliptic, it should be fast, but waitFor is safe
            await screen.findByRole('button', { name: /signed/i }, { timeout: 5000 });
        }

        // 4. Send
        const sendBtn = screen.getByRole('button', { name: /send/i });
        await waitFor(() => expect(sendBtn).toBeEnabled());
        fireEvent.click(sendBtn);

        // 5. Handle Unsigned Warning
        if (!sign) {
            expect(screen.getByText(/unsigned transaction/i)).toBeInTheDocument();
            if (confirmUnsigned) {
                const sendAnywayBtn = screen.getByRole('button', { name: /send anyway/i });
                await act(async () => {
                    fireEvent.click(sendAnywayBtn);
                    // Yield to allow async handleSend to queue setTimeout
                    await Promise.resolve();
                    await Promise.resolve();
                    jest.runOnlyPendingTimers();
                });
            } else {
                const cancelBtn = screen.getByRole('button', { name: /cancel/i });
                fireEvent.click(cancelBtn);
            }
        } else {
            // For valid send, force flush potential timeouts (to reset form state)
            await act(async () => {
                // Yield to allow async handleSend to queue setTimeout
                await Promise.resolve();
                await Promise.resolve();
                jest.runOnlyPendingTimers();
            });
        }
    };

    const mineBlock = async () => {
        const mineBtn = screen.getByRole('button', { name: /mine/i });

        await act(async () => {
            fireEvent.click(mineBtn);
            // Advance time in steps and yield to allow promises to resolve between timeouts
            // We have ~22 steps (initial delays + 20 loop steps). Increase generously.
            for (let i = 0; i < 100; i++) {
                jest.advanceTimersByTime(200); // 200ms * 100 = 20000ms
                await Promise.resolve();
            }
        });
    };

    test('Scenario 1: Happy Path - Sign, Send, Mine, Verify', async () => {
        render(
            <LanguageProvider>
                <MempoolPlayground />
            </LanguageProvider>
        );

        // 1. Create Valid Tx
        await createTransaction('10', '0.5', true);

        // Verify in Mempool Queue
        const queue = screen.getByTestId('mempool-queue');
        expect(within(queue).getByText('10')).toBeInTheDocument();
        expect(within(queue).getByText('+0.5')).toBeInTheDocument();

        const beforeBlockCount = await screen.findAllByText(/Block #/);

        await mineBlock();

        // 3. Verify Mempool empty Blockchain
        // "Block #1" should be visible (Block #0 is genesis)
        expect(await screen.findByText('Block #1')).toBeInTheDocument();

        // Check Validity
        // Both Genesis and Mined Blocks now use the same unified styling/text
        expect(screen.getAllByText('✓ Valid').length).toBeGreaterThanOrEqual(2);

        // Ensure NO invalid blocks
        expect(screen.queryByText('INVALID')).not.toBeInTheDocument();
        expect(screen.queryByText('✗ Invalid')).not.toBeInTheDocument();

        // Verify Tx in Block #1 (we might need to check within the block component)
        // Since we simple rendering, finding text "10 COINS" in the block area is good enough 
        // provided mempool is cleared.

        // Mempool should be empty
        const queueAfter = screen.getByTestId('mempool-queue');
        expect(within(queueAfter).getByText(/Queue is empty/i)).toBeInTheDocument();
    });

    test('Scenario 2: Two Transactions - Sign Both, Send Both, Mine', async () => {
        render(
            <LanguageProvider>
                <MempoolPlayground />
            </LanguageProvider>
        );

        // Tx 1
        await createTransaction('10', '0.5', true);
        // Tx 2
        await createTransaction('20', '0.8', true);

        // Verify both in mempool queue
        const queue = screen.getByTestId('mempool-queue');
        expect(within(queue).getByText('10')).toBeInTheDocument();
        expect(within(queue).getByText('20')).toBeInTheDocument();

        // Mine
        await act(async () => {
            await mineBlock();
        });

        // Verify Block #1
        expect(await screen.findByText('Block #1')).toBeInTheDocument();

        // Check Validity
        expect(screen.getAllByText('✓ Valid').length).toBeGreaterThanOrEqual(2);

        expect(screen.queryByText('INVALID')).not.toBeInTheDocument();
        expect(screen.queryByText('✗ Invalid')).not.toBeInTheDocument();

        // Mempool empty
        expect(within(queue).getByText(/Queue is empty/i)).toBeInTheDocument();
    });

    test('Scenario 3: 3 Transactions - 1 Invalid (Unsigned)', async () => {
        render(
            <LanguageProvider>
                <MempoolPlayground />
            </LanguageProvider>
        );

        // Tx 1: Valid
        await createTransaction('10', '0.1', true);

        // Tx 2: Valid
        await createTransaction('20', '0.2', true);

        // Tx 3: Invalid (Unsigned)
        await createTransaction('30', '0.3', false, true); // sign=false, confirm=true

        // Verify all 3 in mempool queue
        const queue = screen.getByTestId('mempool-queue');
        expect(within(queue).getByText('10')).toBeInTheDocument();
        expect(within(queue).getByText('20')).toBeInTheDocument();
        expect(within(queue).getByText('30')).toBeInTheDocument();

        // Verify unsigned indicator (tooltip text exists in DOM but hidden, or check icon presence)
        // Our unsigned tx has Amount 30.
        // Check if "Unsigned" text exists (from mock) inside queue
        const alerts = await within(queue).findAllByText(/Unsigned/i);
        expect(alerts.length).toBeGreaterThan(0);

        // Mine
        await mineBlock();

        // Mempool should NOT be empty. Should contain the unsigned transaction (30)
        expect(within(queue).getByText('30')).toBeInTheDocument(); // Still visible in queue

        // Removed ones should NOT be in queue
        expect(within(queue).queryByText('10')).not.toBeInTheDocument();
        expect(within(queue).queryByText('20')).not.toBeInTheDocument();

        // Block #1 should be visible and VALID
        expect(await screen.findByText('Block #1')).toBeInTheDocument();

        // Check Validity
        expect(screen.getAllByText('✓ Valid').length).toBeGreaterThanOrEqual(2);

        expect(screen.queryByText('INVALID')).not.toBeInTheDocument();
        expect(screen.queryByText('✗ Invalid')).not.toBeInTheDocument();

        // Verify "Queue is empty" is NOT shown
        expect(within(queue).queryByText(/Queue is empty/i)).not.toBeInTheDocument();
    });

    test('Scenario 4: 1 Not Signed Tx - Mine - Empty Block', async () => {
        render(
            <LanguageProvider>
                <MempoolPlayground />
            </LanguageProvider>
        );

        // Tx 1: Invalid
        await createTransaction('50', '0.5', false, true);

        // Verify in mempool queue
        const queue = screen.getByTestId('mempool-queue');
        expect(within(queue).getByText('50')).toBeInTheDocument();

        // Mine
        await act(async () => {
            await mineBlock();
        });

        // Block #1 created
        expect(await screen.findByText('Block #1')).toBeInTheDocument();

        // Check Validity
        expect(screen.getAllByText('✓ Valid').length).toBeGreaterThanOrEqual(2);

        expect(screen.queryByText('INVALID')).not.toBeInTheDocument();
        expect(screen.queryByText('✗ Invalid')).not.toBeInTheDocument();

        // Tx still in mempool queue
        expect(within(queue).getByText('50')).toBeInTheDocument();
        expect(within(queue).queryByText(/Queue is empty/i)).not.toBeInTheDocument();
    });
});
