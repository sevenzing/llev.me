import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BlockMiner } from '../src/components/playgrounds/BlockMiner';

// Mock crypto.subtle
const mockDigest = jest.fn();
Object.defineProperty(global, 'crypto', {
    value: {
        subtle: {
            digest: mockDigest,
        },
    },
});

describe('BlockMiner', () => {
    beforeEach(() => {
        mockDigest.mockClear();
        // Default mock implementation
        const mockBuffer = new Uint8Array([0, 0, 0, 0]).buffer; // Will result in "00000000"
        mockDigest.mockResolvedValue(mockBuffer);
    });

    it('renders correctly with initial props', async () => {
        render(<BlockMiner blockNumber={1} prevHash="prev-hash" initialData="test data" />);

        expect(screen.getByText('Block #1')).toBeInTheDocument();
        expect(screen.getByText('prev-hash')).toBeInTheDocument();
        expect(screen.getByDisplayValue('test data')).toBeInTheDocument();
    });

    it('updates hash when data changes', async () => {
        render(<BlockMiner />);
        const dataInput = screen.getByDisplayValue('');

        fireEvent.change(dataInput, { target: { value: 'New Data' } });

        await waitFor(() => {
            expect(mockDigest).toHaveBeenCalled();
        });
    });

    it('shows mining state when mine button is clicked', async () => {
        render(<BlockMiner />);
        const mineButton = screen.getByText('Mine');

        // We need to mock the mining process to be fast or controllable
        // For this test, we just check if the state changes
        fireEvent.click(mineButton);

        expect(screen.getByText('Mining...')).toBeInTheDocument();
    });
});
