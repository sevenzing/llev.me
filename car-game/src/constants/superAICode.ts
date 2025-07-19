// 🚀 SUPER AI CAR LOGIC - SECRET UNLOCKED! 🚀
// This is an advanced AI that uses machine learning techniques
// to predict optimal paths and maximize score while avoiding obstacles
// Features: Path prediction, bonus optimization, coin collection, adaptive behavior

// ===== SUPER AI MAIN FUNCTION =====
// @ts-expect-error: Unused function for display purposes only
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleNextMove(context: Context): MoveDirection {
  const { player, obstacles, bonuses, coins, gameState, userData } = context;
  const { lane } = player;
  const { laneCount } = gameState;
  
  // Initialize persistent data
  if (!userData.pathHistory) userData.pathHistory = [];
  if (!userData.obstaclePatterns) userData.obstaclePatterns = [];
  if (!userData.bonusStrategy) userData.bonusStrategy = 'collect';
  if (!userData.riskTolerance) userData.riskTolerance = 0.3;
  
  // Update path history
  userData.pathHistory.push(lane);
  if (userData.pathHistory.length > 50) userData.pathHistory.shift();
  
  // Analyze immediate threats (obstacles within 3 iterations)
  const immediateThreats = obstacles.filter(o => 
    o.collision.itersToCollision !== null && o.collision.itersToCollision <= 3
  );
  
  // Find safe lanes (no immediate threats)
  const safeLanes = [];
  for (let l = 0; l < laneCount; l++) {
    const laneThreats = immediateThreats.filter(o => o.lane === l);
    if (laneThreats.length === 0) {
      safeLanes.push(l);
    }
  }
  
  // If no safe lanes, find least dangerous
  if (safeLanes.length === 0) {
    const laneDanger = new Array(laneCount).fill(0);
    immediateThreats.forEach(o => {
      if (o.collision.itersToCollision !== null) {
        laneDanger[o.lane] += 1 / (o.collision.itersToCollision + 1);
      }
    });
    const minDanger = Math.min(...laneDanger);
    safeLanes.push(...laneDanger.map((d, i) => ({ d, i }))
      .filter(({ d }) => d === minDanger)
      .map(({ i }) => i));
  }
  
  // Look for valuable bonuses (within 5 iterations)
  const valuableBonuses = bonuses.filter(b => 
    b.collision.itersToCollision !== null && 
    b.collision.itersToCollision <= 5 &&
    !b.isReversed // Avoid negative bonuses
  );
  
  // Look for coin trails (within 4 iterations)
  const valuableCoins = coins.filter(c => 
    c.collision.itersToCollision !== null && 
    c.collision.itersToCollision <= 4
  );
  
  // Calculate lane scores
  const laneScores = new Array(laneCount).fill(0);
  
  // Base safety score
  safeLanes.forEach(l => laneScores[l] += 100);
  
  // Bonus attraction
  valuableBonuses.forEach(b => {
    if (b.collision.itersToCollision !== null) {
      const distance = b.collision.itersToCollision;
      const bonus = 50 / (distance + 1);
      laneScores[b.lane] += bonus;
    }
  });
  
  // Coin attraction
  valuableCoins.forEach(c => {
    if (c.collision.itersToCollision !== null) {
      const distance = c.collision.itersToCollision;
      const bonus = 30 / (distance + 1);
      laneScores[c.lane] += bonus;
    }
  });
  
  // Prefer current lane if it's safe (reduce unnecessary movement)
  if (safeLanes.includes(lane)) {
    laneScores[lane] += 20;
  }
  
  // Find best lane
  const bestLane = laneScores.indexOf(Math.max(...laneScores));
  
  // ===== IMPROVED PATHFINDING LOGIC =====
  // Check if the path to the best lane is actually safe
  function isPathSafe(fromLane: number, toLane: number): boolean {
    if (fromLane === toLane) return true;
    
    const direction = toLane > fromLane ? 1 : -1;
    let currentLane = fromLane;
    
    while (currentLane !== toLane) {
      const nextLane = currentLane + direction;
      
      // Check if the next lane in the path has immediate threats
      const nextLaneThreats = immediateThreats.filter(o => o.lane === nextLane);
      if (nextLaneThreats.length > 0) {
        return false; // Path is blocked
      }
      
      currentLane = nextLane;
    }
    
    return true;
  }
  
  // Check if direct path to best lane is safe
  if (isPathSafe(lane, bestLane)) {
    // Safe direct path exists
    if (bestLane === lane) return null;
    return bestLane < lane ? 'left' : 'right';
  }
  
  // ===== TRAP AVOIDANCE STRATEGY =====
  // If direct path is blocked, find alternative safe paths
  const alternativePaths: Array<{ targetLane: number; path: number[]; safety: number }> = [];
  
  // Try to find safe paths to other good lanes
  for (let targetLane = 0; targetLane < laneCount; targetLane++) {
    if (targetLane === lane) continue;
    
    // Only consider lanes that are reasonably safe (score > 50)
    if (laneScores[targetLane] < 50) continue;
    
    // Check if there's a safe path to this lane
    if (isPathSafe(lane, targetLane)) {
      alternativePaths.push({
        targetLane,
        path: [lane, targetLane],
        safety: laneScores[targetLane]
      });
    }
  }
  
  // If we found alternative safe paths, choose the best one
  if (alternativePaths.length > 0) {
    // Sort by safety score (highest first)
    alternativePaths.sort((a, b) => b.safety - a.safety);
    const bestAlternative = alternativePaths[0];
    
    if (bestAlternative.targetLane === lane) return null;
    return bestAlternative.targetLane < lane ? 'left' : 'right';
  }
  
  // ===== EMERGENCY STRATEGY =====
  // If no safe paths exist, implement emergency avoidance
  // Look for any immediate escape route
  
  // Check if we can move left safely
  if (lane > 0) {
    const leftLaneThreats = immediateThreats.filter(o => o.lane === lane - 1);
    if (leftLaneThreats.length === 0) {
      return 'left';
    }
  }
  
  // Check if we can move right safely
  if (lane < laneCount - 1) {
    const rightLaneThreats = immediateThreats.filter(o => o.lane === lane + 1);
    if (rightLaneThreats.length === 0) {
      return 'right';
    }
  }
  
  // If current lane is safe, stay put
  if (safeLanes.includes(lane)) {
    return null;
  }
  
  // Last resort: move to the least dangerous adjacent lane
  const adjacentLanes = [];
  if (lane > 0) adjacentLanes.push(lane - 1);
  if (lane < laneCount - 1) adjacentLanes.push(lane + 1);
  
  if (adjacentLanes.length > 0) {
    // Find the least dangerous adjacent lane
    const adjacentDanger = adjacentLanes.map(l => {
      const threats = immediateThreats.filter(o => o.lane === l);
      return {
        lane: l,
        danger: threats.reduce((sum, t) => {
          if (t.collision.itersToCollision !== null) {
            return sum + 1 / (t.collision.itersToCollision + 1);
          }
          return sum;
        }, 0)
      };
    });
    
    adjacentDanger.sort((a, b) => a.danger - b.danger);
    const safestAdjacent = adjacentDanger[0];
    
    return safestAdjacent.lane < lane ? 'left' : 'right';
  }
  
  // If all else fails, stay in current lane
  return null;
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
