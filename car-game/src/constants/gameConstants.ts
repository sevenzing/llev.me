import type {
  DifficultySettings,
  GameConfig,
  BonusesConfig,
  Difficulty,
} from "../types/game";

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  easy: {
    speed: 2,
    obstacleFrequency: 150,
  },
  normal: {
    speed: 3,
    obstacleFrequency: 90,
  },
  hard: {
    speed: 5,
    obstacleFrequency: 40,
  },
  insane: {
    speed: 6,
    obstacleFrequency: 20,
  },
};

const DEFAULT_BONUS_WIDTH = 40;
const STATIC_SPEED = 0.5;
const DEFAULT_BONUS_MOVING_SPEED = STATIC_SPEED;
const DEFAULT_COIN_MOVING_SPEED = STATIC_SPEED;

export const OBSTACLE_CONFIG = {
  minSpeed: 0.8,
  maxSpeed: 1.2,
};

export const CAR_DIMENSIONS = {
  width: 40,
  height: 70,
};

export const BONUSES_CONFIG: BonusesConfig = {
  items: {
    speedup: {
      duration: 20000, // 20 seconds
      speedMultiplier: 2, // 100% speed increase
      movingSpeed: DEFAULT_BONUS_MOVING_SPEED,
      width: DEFAULT_BONUS_WIDTH,
      height: DEFAULT_BONUS_WIDTH,
      glow: {
        color: "#3399ff",
        size: 15,
      },
      isReversable: true,
    },
    shield: {
      duration: 10000, // 10 seconds
      movingSpeed: DEFAULT_BONUS_MOVING_SPEED,
      width: DEFAULT_BONUS_WIDTH,
      height: DEFAULT_BONUS_WIDTH,
      glow: {
        color: "#ffcc00",
        size: 15,
      },
      spriteOnPlayerScale: 0.8,
      isReversable: true,
    },
    vortex: {
      duration: 0, // Instant effect
      movingSpeed: DEFAULT_BONUS_MOVING_SPEED,
      width: DEFAULT_BONUS_WIDTH,
      height: DEFAULT_BONUS_WIDTH,
      glow: {
        color: "#8a2be2", // A vortex-like purple
        size: 15,
      },
      isReversable: false,
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
  invincibilityDuration: 200, // 1 second in milliseconds
  blinkInterval: 15,
  laneDashLength: 15,
  laneDashGap: 20,
};

export const USER_CODE_CONFIG = {
  executionFrequency: 25, // Execute user code every 25 frames (instead of every frame)
  // Increase this number to reduce CPU usage but make AI less responsive
  // Decrease this number to make AI more responsive but use more CPU
  maxExecutionTime: 100, // Maximum execution time in milliseconds
  autoRestartDelay: 2000, // Delay before auto-restarting the game in auto mode
};

export const FADE_OUT_DURATION = 300; // 300ms fade-out for cleared obstacles

export const DEFAULT_EDITOR_FILE_NAME = "~/personal/car-project/car-logic.ts";

// Version tracking for default editor content
export const DEFAULT_EDITOR_CONTENT_VERSION = "1.0.0";

const GAP = 40;
const SIZE = 32;
export const COIN_CONFIG = {
  width: SIZE,
  height: SIZE,
  minTrailFrequency: 1000,
  maxTrailFrequency: 2000,
  movingSpeed: DEFAULT_COIN_MOVING_SPEED,
  trails: [
    // {
    //   name: "straight",
    //   shape: [
    //     { laneOffset: 0, yOffset: 0 },
    //     { laneOffset: 0, yOffset: 1 },
    //     { laneOffset: 0, yOffset: 2 },
    //     { laneOffset: 0, yOffset: 3 },
    //     { laneOffset: 0, yOffset: 4 },
    //   ],
    //   gap: GAP,
    //   startLanes: [0, 1, 2, 3, 4],
    // },
    // {
    //   name: "arcLeft",
    //   shape: [
    //     { laneOffset: 0, yOffset: 0 },
    //     { laneOffset: 0, yOffset: 1 },
    //     { laneOffset: 1, yOffset: 2 },
    //     { laneOffset: 2, yOffset: 3 },
    //     { laneOffset: 2, yOffset: 4 },
    //   ],
    //   gap: GAP,
    //   startLanes: [2, 3, 4],
    // },
    // {
    //   name: "arcRight",
    //   shape: [
    //     { laneOffset: 0, yOffset: 0 },
    //     { laneOffset: 0, yOffset: 1 },
    //     { laneOffset: -1, yOffset: 2 },
    //     { laneOffset: -2, yOffset: 3 },
    //     { laneOffset: -2, yOffset: 4 },
    //   ],
    //   gap: GAP,
    //   startLanes: [0, 1, 2],
    // },
    // {
    //   name: "zigzag",
    //   shape: [
    //     { laneOffset: 0, yOffset: 0 },
    //     { laneOffset: 1, yOffset: 1 },
    //     { laneOffset: 2, yOffset: 2 },
    //     { laneOffset: 1, yOffset: 3 },
    //     { laneOffset: 0, yOffset: 4 },
    //   ],
    //   gap: GAP,
    //   startLanes: [1, 2, 3],
    // },
    // {
    //   name: "threeLines",
    //   shape: [
    //     { laneOffset: 0, yOffset: 0 },
    //     { laneOffset: 0, yOffset: 1 },
    //     { laneOffset: 0, yOffset: 2 },
    //     { laneOffset: 2, yOffset: 0 },
    //     { laneOffset: 2, yOffset: 1 },
    //     { laneOffset: 2, yOffset: 2 },
    //     { laneOffset: -2, yOffset: 0 },
    //     { laneOffset: -2, yOffset: 1 },
    //     { laneOffset: -2, yOffset: 2 },
    //   ],
    //   gap: GAP,
    //   startLanes: [2],
    // },
    {
      name: "zigzagBig",
      shape: [
        { laneOffset: 0, yOffset: 0 },
        { laneOffset: 0, yOffset: 1 },
        { laneOffset: 0, yOffset: 2 },
        { laneOffset: 1, yOffset: 3 },
        { laneOffset: 1, yOffset: 4 },
        { laneOffset: 1, yOffset: 5 },
        { laneOffset: 2, yOffset: 6 },
        { laneOffset: 2, yOffset: 7 },
        { laneOffset: 2, yOffset: 8 },
        { laneOffset: 3, yOffset: 9 },
        { laneOffset: 3, yOffset: 10 },
        { laneOffset: 3, yOffset: 11 },
        { laneOffset: 4, yOffset: 12 },
        { laneOffset: 4, yOffset: 13 },
        { laneOffset: 4, yOffset: 14 },
      ],
      gap: GAP,
      startLanes: [0],
    },
  ],
};
