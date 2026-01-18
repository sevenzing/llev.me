
export interface Node {
    id: string;
    x: number;
    y: number;
    blockchain: Block[];
}

export interface Transaction {
    id: string;
    from: string;
    to: string;
    amount: number;
    fee: number;
    signature: string;
    hash: string;
    isValid?: boolean;
}

export interface Block {
    index: number;
    data: any; // Can be string or Transaction[]
    hash: string;
    prevHash: string;
    nonce: number;
    timestamp?: number;
}

export interface Connection {
    from: string;
    to: string;
}

export interface SyncMessage {
    id: number;
    from: string;
    to: string;
    progress: number;
    isRecursive: boolean;
}

export interface SyncFeedback {
    id: number;
    nodeId: string;
    accepted: boolean;
    timestamp: number;
}