import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HashPlayground } from '../src/components/playgrounds/HashPlayground';

// Mock useHash hook
jest.mock('../src/hooks/useHash', () => ({
    useHash: (input: string) => input ? `hash-${input}` : '',
}));

describe('HashPlayground', () => {
    it('renders correctly', () => {
        render(<HashPlayground />);
        expect(screen.getByText('SHA-256 Hash Generator')).toBeInTheDocument();
    });

    it('updates hash when input changes', async () => {
        render(<HashPlayground />);
        const input = screen.getByPlaceholderText('Type something here...');

        fireEvent.change(input, { target: { value: 'New Data' } });

        await waitFor(() => {
            expect(screen.getByText('hash-New Data')).toBeInTheDocument();
        });
    });
});
