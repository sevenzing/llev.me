export interface CarDimensions {
  width: number;
  height: number;
}

export interface DifficultySettings {
  speed: number;
  obstacleFrequency: number;
}

export interface BonusConfig {
  duration: number;
  speedMultiplier?: number;
  movingSpeed: number;
  width: number;
  height: number;
  glow: {
    color: string;
    size: number;
  };
}

export interface Bonus {
  type: 'speedup' | 'shield';
  x: number;
  y: number;
  width: number;
  height: number;
  config: BonusConfig;
}

export interface ActiveBonus {
  type: 'speedup' | 'shield';
  endTime: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  lane: number;
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
    speedup: ActiveBonus | null;
    shield: ActiveBonus | null;
  };
  lastBonusUpdateTime: number;
  bonusUpdateInterval: number;
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