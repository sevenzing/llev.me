import type { DifficultySettings, GameConfig, BonusesConfig, Difficulty } from '../types/game';

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
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

const DEFAULT_WIDTH = 40;
const DEFAULT_BONUS_MOVING_SPEED = 0.5;

export const OBSTACLE_CONFIG = {
  minSpeed: 0.8,
  maxSpeed: 1.2,
};

export const CAR_DIMENSIONS = {
  width: DEFAULT_WIDTH,
  height: 70,
};

export const BONUSES_CONFIG: BonusesConfig = {
  items: {
    speedup: {
      duration: 20000, // 20 seconds
      speedMultiplier: 2, // 100% speed increase
      movingSpeed: DEFAULT_BONUS_MOVING_SPEED,
      width: DEFAULT_WIDTH,
      height: DEFAULT_WIDTH,
      glow: {
        color: '#3399ff',
        size: 15,
      },
      negativeImage: '/static/speedup-negative.png',
    },
    shield: {
      duration: 10000, // 10 seconds
      movingSpeed: DEFAULT_BONUS_MOVING_SPEED,
      width: DEFAULT_WIDTH,
      height: DEFAULT_WIDTH,
      glow: {
        color: '#ffcc00',
        size: 15,
      },
      spriteOnPlayerScale: 0.8,
      negativeImage: '/static/shield-negative.png',
    },
    vortex: {
      duration: 0, // Instant effect
      movingSpeed: DEFAULT_BONUS_MOVING_SPEED,
      width: DEFAULT_WIDTH,
      height: DEFAULT_WIDTH,
      glow: {
        color: '#8a2be2', // A vortex-like purple
        size: 15,
      },
      negativeImage: '/static/vortex-negative.png',
    },
  },
  spawnFrequency: 300,
  isReverseBonusEnabled: true,
};

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

export const FADE_OUT_DURATION = 300; // 300ms fade-out for cleared obstacles 