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
      negativeImage: '/static/speedup-negative.png',
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
      negativeImage: '/static/shield-negative.png',
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
  laneDashLength: 15,
  laneDashGap: 20,
};

export const USER_CODE_CONFIG = {
  executionFrequency: 25, // Execute user code every 10 frames (instead of every frame)
  // Increase this number to reduce CPU usage but make AI less responsive
  // Decrease this number to make AI more responsive but use more CPU
  maxExecutionTime: 100, // Maximum execution time in milliseconds
};

export const FADE_OUT_DURATION = 300; // 300ms fade-out for cleared obstacles

export const DEFAULT_EDITOR_FILE_NAME = '~/personal/car-project/car-logic.ts';

const DEFAULT_EDITOR_COMMENT = `// Car Game AI Logic
// Write your handleNextMove function to control the car
// This is TypeScript - you get full type safety and IntelliSense!

// Type definitions for better development experience
interface Player {
  lane: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Obstacle {
  lane: number;
  x: number;
  y: number;
  width: number;
  height: number;
  movingSpeed: number;
}

interface Bonus {
  lane: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'speedup' | 'shield' | 'vortex';
  isReversed: boolean;
}

type MoveDirection = 'left' | 'right' | null;
`;

const DEFAULT_EDITOR_FUNCTION_DOC_COMMENT = `
/**
 * Determines the next move for the car based on current game state
 * @param player - The player car object
 * @param obstacles - Array of obstacle objects
 * @param bonuses - Array of bonus objects
 * @returns Direction to move, or null to stay
 */
`;

const DEFAULT_EDITOR_FUNCTION = `
function handleNextMove(player: Player, obstacles: Obstacle[], bonuses: Bonus[]): MoveDirection {
  // Example: Simple avoidance logic
  const currentLane = player.lane;
  
  // Find obstacles in current lane that are close
  const nearbyObstacles = obstacles.filter(obstacle => 
    obstacle.lane === currentLane && 
    obstacle.y > player.y - 100 && 
    obstacle.y < player.y + 50
  );
  
  // If there's an obstacle ahead, try to avoid it
  if (nearbyObstacles.length > 0) {
    // Try moving left first
    if (currentLane > 0) {
      const leftLaneSafe = !obstacles.some(obstacle => 
        obstacle.lane === currentLane - 1 && 
        obstacle.y > player.y - 100 && 
        obstacle.y < player.y + 50
      );
      if (leftLaneSafe) return 'left';
    }
    
    // Try moving right
    if (currentLane < 4) {
      const rightLaneSafe = !obstacles.some(obstacle => 
        obstacle.lane === currentLane + 1 && 
        obstacle.y > player.y - 100 && 
        obstacle.y < player.y + 50
      );
      if (rightLaneSafe) return 'right';
    }
  }
  
  // Look for bonuses to collect
  const nearbyBonuses = bonuses.filter(bonus => 
    bonus.y > player.y - 50 && 
    bonus.y < player.y + 100
  );
  
  for (const bonus of nearbyBonuses) {
    if (bonus.lane < currentLane && currentLane > 0) {
      return 'left';
    } else if (bonus.lane > currentLane && currentLane < 4) {
      return 'right';
    }
  }
  
  // Stay in current lane
  return null;
}
`

export const DEFAULT_EDITOR_CONTENT = `${DEFAULT_EDITOR_COMMENT}
${DEFAULT_EDITOR_FUNCTION}
`;
