import { Block } from "./types";

export function mockedGenesisBlock(): Block {
    return {
        index: 0,
        data: "Genesis",
        hash: "0000c45ddaf06cf82fa53fa3308e5dd4b1905d4c197093c9b6c4d551f30c23c3",
        prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
        nonce: 10689
    };
}

export function mockedBlockList(n: number): Block[] {
    if (n < 1) {
        return [];
    }
    const blocks: Block[] = [
        mockedGenesisBlock(),
    ];
    let latestBlock = blocks[0];
    for (let index = 1; index < n; index++) {
        latestBlock = {
            index,
            data: mockedBlockDataByIndex(index),
            prevHash: latestBlock.hash,
            nonce: 0,
            hash: ""
        };
        blocks.push(latestBlock);
    }

    return blocks;
}

export function mockedBlockDataByIndex(index: number): string {
    return `Data in block #${index}`;
}