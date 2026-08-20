/**
 * CLI to generate the obfuscated blob for src/lib/reward/data.ts.
 *
 * Usage: npm run encode-reward
 *
 * Mining is deterministic, so the key (sum of every block's nonce once the
 * whole chain is mined) is derived here by actually mining the chain
 * headlessly — reusing the exact same proof-of-work (`mineNonce`) as the
 * UI in src/lib/chain/sha256.ts. That means this always stays correct even
 * if achievement content changes, with no manual recalculation needed.
 *
 * Only asks for the content, e.g. "Hello world". Prints a line ready to
 * paste into src/lib/reward/data.ts — the plaintext is never written to a
 * file, only the encoded output is meant to be committed.
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { encodeReward } from "../src/lib/reward/cipher";
import { mineFullChainNonceSum } from "../src/lib/chain/useChain";

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const content = await rl.question('Content (e.g. "Hello world"): ');
    if (!content) {
      console.error("\nContent must not be empty.");
      process.exitCode = 1;
      return;
    }

    console.log("\nMining the full chain to derive the key…");
    const key = await mineFullChainNonceSum();
    console.log(`Key (sum of all nonces): ${key}`);

    const encoded = encodeReward(key, content);
    console.log("\nPaste this into src/lib/reward/data.ts:\n");
    console.log(`export const ENCODED_REWARD_CONTENT = "${encoded}";`);
  } finally {
    rl.close();
  }
}

main();
