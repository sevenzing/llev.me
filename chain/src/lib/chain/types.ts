export interface AchievementSeed {
  number: string;
  date: string;
  title: string;
  content: string | null;
}

export interface Block extends AchievementSeed {
  hash: string;
  nonce: number;
  mined: boolean;
  mining: boolean;
  prevHash: string;
}

export interface UseChainOptions {
  persist?: boolean;
  scalingDifficulty?: boolean;
}
