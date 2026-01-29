import { useState, useEffect } from 'react';

export function useHash(data: string) {
    const [hash, setHash] = useState('');

    useEffect(() => {
        let active = true;

        const generateHash = async () => {
            if (!data) {
                if (active) setHash('');
                return;
            }

            const msgBuffer = new TextEncoder().encode(data);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

            if (active) setHash(hashHex);
        };

        generateHash();

        return () => {
            active = false;
        };
    }, [data]);

    return hash;
}
