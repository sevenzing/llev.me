export interface CarDimensions {
  width: number;
  height: number;
}

export interface DifficultySettings {
  speed: number;
  obstacleFrequency: number;
}

export type BonusType = 'speedup' | 'shield' | 'vortex';

export interface BonusesConfig {
  items: {
    [key in BonusType]: BonusConfig;
  },
  spawnFrequency: number;
  isReverseBonusEnabled?: boolean;
}

export interface BonusConfig {
  duration: number;
  speedMultiplier?: number;
  movingSpeed: number;
  width: number;
  height: number;
  spriteOnPlayerScale?: number;
  glow: {
    color: string;
    size: number;
  };
  negativeImage?: any;
}

export interface Bonus {
  type: BonusType;
  x: number;
  y: number;
  width: number;
  height: number;
  config: BonusConfig;
  image: any;
  lane: number;
  isReversed: boolean;
}

export interface ActiveBonus {
  type: BonusType;
  endTime: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  lane: number;
  movingSpeed: number;
  isFadingOut?: boolean;
  fadeStartTime?: number;
  rotation?: number;
}

export interface GameState {
  currentLane: number;
  carX: number;
  targetX: number;
  score: number;
  lives: number;
  gameSpeed: number;
  baseGameSpeed: number;
  roadSpeedMultiplier: number;
  isRunning: boolean;
  isAutoPlay: boolean;
  obstacles: Obstacle[];
  bonuses: Bonus[];
  frameCount: number;
  roadLineOffset: number;
  obstacleFrequency: number;
  isInvincible: boolean;
  invincibilityStartTime: number;
  lastBlinkTime: number;
  isVisible: boolean;
  activeBonuses: {
    [key in BonusType]?: ActiveBonus;
  };
  lastBonusUpdateTime: number;
  bonusUpdateInterval: number;
  nextObstacleSpawn: number;
  nextBonusSpawn: number;
}

export interface GameConfig {
  laneCount: number;
  laneWidth: number;
  carY: number;
  maxLives: number;
  invincibilityDuration: number;
  blinkInterval: number;
}

export type Difficulty = 'easy' | 'normal' | 'hard' | 'insane';
