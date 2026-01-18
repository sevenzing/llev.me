import { Block } from "./types";

export function mockedGenesisBlock(): Block {
    return {
        index: 0,
        data: "Genesis",
        hash: "000073d85df97757bd4c0f801b4c633b6e61105dd43a99780f6ae5c202a6fd6e",
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