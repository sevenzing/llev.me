import { decodeReward } from "./cipher";

/**
 * The "all blocks mined" easter-egg message, obfuscated so it isn't stored
 * as plaintext in the repo. Generate this with:
 *
 *   npm run encode-reward
 *
 * (see scripts/encode-reward.ts). The key needed to both generate and
 * decode it is the sum of every mined block's nonce — deterministic, but
 * only known once you've actually mined the whole chain.
 */
export const ENCODED_REWARD_CONTENT = "9RYip86+yLoir9uBc9t5+atqW6KUEKO05W5iyq1JJzqyiKmSKY0sqYZiSr5jMQFuVgFp9rUylO2R2zpgYRARCOs55pDJpJgOps0FxkiQYKE77bGOs8LzJUGJGBSf/wFZWUrW3zyBQcqRqNi5g+jaqrpQENKv0wO9aDc7IAxoRw==";

const FALLBACK_CONTENT = "You mined the whole chain. Nice work.";

/** Decode the reward message using `key` (sum of all mined nonces). */
export function getRewardContent(key: number): string {
  if (!ENCODED_REWARD_CONTENT) return FALLBACK_CONTENT;
  try {
    const decoded = decodeReward(key, ENCODED_REWARD_CONTENT);
    return decoded || FALLBACK_CONTENT;
  } catch {
    return FALLBACK_CONTENT;
  }
}
