// 🚀 SUPER AI CAR LOGIC - SECRET UNLOCKED! 🚀
// This is an advanced AI that uses machine learning techniques
// to predict optimal paths and maximize score while avoiding obstacles
// Features: Path prediction, bonus optimization, coin collection, adaptive behavior

// NOTE: The following helper functions are automatically available in the global scope:
// getCurrentLane, isLaneSafe, getSafeLanes, getObstaclesInRange, getValuableBonuses, 
// getCoinTrails, calculateLaneScore, getBestLane, canMoveToLane, getDirectionToLane, 
// getEmergencyOptions, hasShieldProtection, shouldAvoidReversedShield, 
// getSafestAdjacentLane, getLaneDanger

// ===== SUPER AI MAIN FUNCTION =====
// @ts-expect-error: Unused function for display purposes only
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleNextMove(context: Context): MoveDirection {
  const { userData } = context;

  // Initialize persistent data
  if (!userData.pathHistory) userData.pathHistory = [];
  if (!userData.obstaclePatterns) userData.obstaclePatterns = [];
  if (!userData.bonusStrategy) userData.bonusStrategy = 'collect';
  if (!userData.riskTolerance) userData.riskTolerance = 0.3;

  // Update path history
  const currentLane = getCurrentLane(context);
  userData.pathHistory.push(currentLane);
  if (userData.pathHistory.length > 50) userData.pathHistory.shift();

  // Get immediate threats and safe lanes
  const immediateThreats = getObstaclesInRange(context, 3);
  const safeLanes = getSafeLanes(context, 3);

  // Get valuable bonuses and coins
  const valuableBonuses = getValuableBonuses(context);
  const valuableCoins = getCoinTrails(context);

  // Calculate lane scores using helper function
  const laneScores = Array.from({ length: context.gameState.laneCount }, (_, i) =>
    calculateLaneScore(context, i)
  );

  // Find best lane
  const bestLane = getBestLane(context);

  // ===== IMPROVED PATHFINDING LOGIC =====
  // Check if the path to the best lane is actually safe
  if (canMoveToLane(context, bestLane)) {
    // Safe direct path exists
    if (bestLane === currentLane) return null;
    return getDirectionToLane(context, bestLane);
  }

  // ===== TRAP AVOIDANCE STRATEGY =====
  // If direct path is blocked, find alternative safe paths
  const alternativePaths: Array<{ targetLane: number; path: number[]; safety: number }> = [];

  // Try to find safe paths to other good lanes
  for (let targetLane = 0; targetLane < context.gameState.laneCount; targetLane++) {
    if (targetLane === currentLane) continue;

    // Only consider lanes that are reasonably safe (score > 50)
    if (laneScores[targetLane] < 50) continue;

    // Check if there's a safe path to this lane
    if (canMoveToLane(context, targetLane)) {
      alternativePaths.push({
        targetLane,
        path: [currentLane, targetLane],
        safety: laneScores[targetLane]
      });
    }
  }

  // If we found alternative safe paths, choose the best one
  if (alternativePaths.length > 0) {
    // Sort by safety score (highest first)
    alternativePaths.sort((a, b) => b.safety - a.safety);
    const bestAlternative = alternativePaths[0];

    if (bestAlternative.targetLane === currentLane) return null;
    return getDirectionToLane(context, bestAlternative.targetLane);
  }

  // ===== EMERGENCY STRATEGY =====
  // If no safe paths exist, implement emergency avoidance
  const emergency = getEmergencyOptions(context);
  if (emergency.length > 0) {
    return emergency[0].direction;
  }

  // If current lane is safe, stay put
  if (isLaneSafe(context, currentLane)) {
    return null;
  }

  // Last resort: move to the least dangerous adjacent lane
  const safestAdjacent = getSafestAdjacentLane(context);

  if (safestAdjacent === currentLane) {
    return null;
  } else if (safestAdjacent < currentLane) {
    return 'left';
  } else {
    return 'right';
  }
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
