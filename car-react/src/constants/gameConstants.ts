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

const DEFAULT_BONUS_WIDTH = 40;
const DEFAULT_BONUS_MOVING_SPEED = 0.5;

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
        color: '#3399ff',
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
        color: '#ffcc00',
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
        color: '#8a2be2', // A vortex-like purple
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
};

export const FADE_OUT_DURATION = 300; // 300ms fade-out for cleared obstacles

export const DEFAULT_EDITOR_FILE_NAME = '~/personal/car-project/car-logic.ts';

export const DEFAULT_EDITOR_CONTENT = `// Car Game AI Logic
// Write your handleNextMove function to control the car
// This is TypeScript - you get full type safety and IntelliSense!


function handleNextMove(context: Context): MoveDirection {
  const { lane } = context.player;
  const { laneCount } = context.gameState;
  const offsets = [0, -1, 1, 2, -2, -3, 3, -4, 4];
  const lanesWithIter = offsets
    .map(offset => lane + offset)
    .filter(l => l >= 0 && l < laneCount)
    .map(l => ({
      lane: l,
      iter: Math.min(
        ...context.obstacles
          .filter(o => o.lane === l)
          .map(o => o.collision.itersToCollision)
          .concat(Infinity)
      )
    }));
  const safest = lanesWithIter.reduce((max, curr) => (curr.iter > max.iter ? curr : max)).lane;
  if (safest === lane) return null;
  return safest < lane ? 'left' : 'right'; // Return the direction to move the car
}

// Context type:
interface Context {
  player: Player;
  obstacles: Array<Obstacle>;
  bonuses: Array<Bonus>;
  gameState: GameState;
  userData: Record<string, any>; // Persistent between iterations
}

interface CollisionInfo {
  pixelsToCollision: number;
  framesToCollision: number;
  itersToCollision: number;
}

interface Player {
  lane: number;
  x: number;
  y: number;
  width: number;
  height: number;
  invincibility: {
    isActive: boolean;
    framesLeft: number;
    itersLeft: number;
  };
}

interface Obstacle {
  lane: number;
  x: number;
  y: number;
  width: number;
  height: number;
  movingSpeed: number;
  collision: CollisionInfo;
}

interface Bonus {
  lane: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  isReversed: boolean;
  movingSpeed: number;
  collision: CollisionInfo;
}

interface GameState {
  score: number;
  lives: number;
  gameSpeed: number;
  frameCount: number;
  nextInterationInFrames: number;
  laneCount: number;
}
type MoveDirection = 'left' | 'right' | null;
`;
