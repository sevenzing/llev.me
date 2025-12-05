import { Block } from "./types";

export function mockedGenesisBlock(): Block {
    return {
        index: 0,
        data: "Genesis",
        hash: "0000dc20d02fe253818318e51f0570903a1eb4aeeb6f2446133d7ace7ba03d18",
        prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
        nonce: 10688
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