import { ec as EC } from "elliptic";

export const ec = new EC('secp256k1');

export const ACCOUNTS = [
    {
        name: 'Alice',
        color: 'bg-rose-500',
        icon: '👩‍🦰',
        privateKey: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    },
    {
        name: 'Bob',
        color: 'bg-sky-500',
        icon: '👨‍💼',
        privateKey: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    },
    {
        name: 'Charlie',
        color: 'bg-emerald-500',
        icon: '🧔',
        privateKey: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    }
];
