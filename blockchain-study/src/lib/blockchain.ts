/**
 * Calculate SHA-256 hash for a block
 */
export async function calculateBlockHash(
    blockNumber: number,
    nonce: number,
    data: any,
    prevHash: string
): Promise<string> {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const str = blockNumber + dataString + prevHash + nonce;
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Mine a block by finding a nonce that produces a hash starting with '0000'
 */
export async function mineBlock(
    blockNumber: number,
    data: any,
    prevHash: string,
    onProgress?: (nonce: number, hash: string) => void
): Promise<{ hash: string; nonce: number }> {
    let nonce = -1;
    let hash = '';
    console.log('mine for block', blockNumber);

    while (!hash.startsWith('0000')) {
        nonce++;
        hash = await calculateBlockHash(blockNumber, nonce, data, prevHash);

        // Call progress callback every 100 iterations for smooth animation
        if (onProgress && nonce % 100 === 0) {
            onProgress(nonce, hash);
            // Yield to UI thread
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    return { hash, nonce };
}
