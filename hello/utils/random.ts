export const mulberry32 = (a: number) => {
    return function () {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export const randomBitNumber = (bitLength: number) => {
    if (bitLength <= 0) {
        return 0;
    }
    if (bitLength > 32) {
        throw new Error("Bit length is too large");
    }
    let randomNumber = 0;
    for (let i = 0; i < bitLength; i++) {
        // Generate a random bit (0 or 1)
        let randomBit = Math.random() < 0.5 ? 0 : 1;
        // Shift the bit to its correct position and add it to the number
        randomNumber |= (randomBit << i);
    }
    return randomNumber;
}