
export interface Node {
    id: string;
    x: number;
    y: number;
    blockchain: Block[];
}

export interface Block {
    index: number;
    data: any; // Can be string or JSON object (for transactions)
    hash: string;
    prevHash: string;
    nonce: number;
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