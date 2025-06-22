import type { DifficultySettings, BonusConfig, GameConfig } from '../types/game';

export const DIFFICULTY_SETTINGS: Record<string, DifficultySettings> = {
  easy: {
    speed: 2,
    obstacleFrequency: 150,
  },
  normal: {
    speed: 4,
    obstacleFrequency: 90,
  },
  hard: {
    speed: 6,
    obstacleFrequency: 40,
  },
  insane: {
    speed: 8,
    obstacleFrequency: 20,
  },
};

export const DEFAULT_WIDTH = 40;
export const DEFAULT_BONUS_MOVING_SPEED = 2;

export const CAR_DIMENSIONS = {
  width: DEFAULT_WIDTH,
  height: 70,
};

export const BONUS_CONFIG: Record<string, BonusConfig> = {
  speedup: {
    duration: 20000, // 20 seconds
    speedMultiplier: 2, // 100% speed increase
    movingSpeed: DEFAULT_BONUS_MOVING_SPEED, // Same as game speed
    width: DEFAULT_WIDTH,
    height: DEFAULT_WIDTH,
    glow: {
      color: '#3399ff',
      size: 15,
    },
  },
  shield: {
    duration: 10000, // 10 seconds
    movingSpeed: DEFAULT_BONUS_MOVING_SPEED, // Same as game speed
    width: DEFAULT_WIDTH,
    height: DEFAULT_WIDTH,
    glow: {
      color: '#ffcc00',
      size: 15,
    },
  },
};

export const BONUS_SPAWN_FREQUENCY = 300; // Spawn bonus every 300 frames

export const CANVAS_CONFIG = {
  width: 400,
  height: 500,
};

export const GAME_CONFIG: GameConfig = {
  laneCount: 5,
  laneWidth: CANVAS_CONFIG.width / 5,
  carY: CANVAS_CONFIG.height - CAR_DIMENSIONS.height - 10,
  maxLives: 3,
  invincibilityDuration: 1000, // 1 second in milliseconds
  blinkInterval: 100, // Blink every 100ms
}; 