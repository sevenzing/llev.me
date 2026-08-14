export interface AchievementSeed {
  number: string;
  date: string;
  title: string;
  content: string | null;
}

export interface Block extends AchievementSeed {
  hash: string | null;
  nonce: number | null;
  mined: boolean;
  mining: boolean;
  currentTry: string;
  prevHashUsed: string | null;
  decrypted: boolean;
}

export interface UseChainOptions {
  /** Persist mined state to localStorage across reloads. Default: false (chain starts broken every visit). */
  persist?: boolean;
  /** Require a block to be mined before its content can be decrypted. Default: true. */
  decryptGated?: boolean;
  /** Increase required leading zeros for later blocks instead of a flat '0000'. Default: false. */
  scalingDifficulty?: boolean;
}
