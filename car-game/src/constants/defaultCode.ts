// Car Game AI Logic
// Write your handleNextMove function to control the car
// This is TypeScript - you get full type safety and IntelliSense!


// ===== MAIN FUNCTION =====
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
          .filter((iter): iter is number => iter !== null)
          .concat(Infinity)
      )
    }));
  const safest = lanesWithIter.reduce((max, curr) => (curr.iter > max.iter ? curr : max)).lane;
  if (safest === lane) return null;
  return safest < lane ? 'left' : 'right'; // Return the direction to move the car
}


// ===== INTERFACES =====
type MoveDirection = 'left' | 'right' | null;

interface Context {
  player: Player;
  obstacles: Array<Obstacle>;
  bonuses: Array<Bonus>;
  coins: Array<Coin>;
  gameState: GameState;
  userData: Record<string, any>; // Persistent between iterations
}

interface CollisionInfo {
  pixelsToCollision: number | null;
  framesToCollision: number | null;
  itersToCollision: number | null;
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

interface Coin {
  lane: number;
  x: number;
  y: number;
  width: number;
  height: number;
  movingSpeed: number;
  trailId: string;
  collision: CollisionInfo;
}

interface GameState {
  score: number;
  lives: number;
  gameSpeed: number;
  frameCount: number;
  nextInterationInFrames: number;
  laneCount: number;
  coinsCollected: number;
}
