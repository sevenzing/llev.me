import { renderHook, waitFor } from '@testing-library/react';
import { useHash } from '../src/hooks/useHash';

// Mock crypto.subtle
const mockDigest = jest.fn();
Object.defineProperty(global, 'crypto', {
    value: {
        subtle: {
            digest: mockDigest,
        },
    },
});

describe('useHash', () => {
    beforeEach(() => {
        mockDigest.mockClear();
    });

    it('should return empty string for empty input', async () => {
        const { result } = renderHook(() => useHash(''));
        expect(result.current).toBe('');
    });

    it('should generate hash for input', async () => {
        // Mock SHA-256 implementation for "test"
        const mockBuffer = new Uint8Array([1, 2, 3]).buffer;
        mockDigest.mockResolvedValue(mockBuffer);

        const { result } = renderHook(() => useHash('test'));

        await waitFor(() => {
            expect(result.current).toBe('010203');
        });
    });
});
