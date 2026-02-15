// 🎮 GAME HELPER FUNCTIONS 🎮
// Pure functions to simplify car control logic
// All functions take context as their first argument


import type { Context } from '@/types/public/game'; // @monaco-editor-remove-next-line

// ===== NAVIGATION & MOVEMENT HELPERS =====

/**
 * Get current lane
 */
export function getCurrentLane(context: Context): number {
  return context.player.lane;
}

/**
 * Check if lane is safe (no immediate obstacles)
 */
export function isLaneSafe(context: Context, lane: number, iterations: number = 3): boolean {
  const immediateThreats = context.obstacles.filter(o => 
    o.lane === lane && 
    o.collision.itersToCollision !== null && 
    o.collision.itersToCollision <= iterations
  );
  return immediateThreats.length === 0;
}

/**
 * Get all safe lanes within range
 */
export function getSafeLanes(context: Context, iterations: number = 3): number[] {
  const safeLanes: number[] = [];
  for (let lane = 0; lane < context.gameState.laneCount; lane++) {
    if (isLaneSafe(context, lane, iterations)) {
      safeLanes.push(lane);
    }
  }
  return safeLanes;
}

/**
 * Find the safest lane
 */
export function findSafestLane(context: Context): number {
  const safeLanes = getSafeLanes(context);
  if (safeLanes.length === 0) {
    // If no safe lanes, find least dangerous
    const laneDanger = new Array(context.gameState.laneCount).fill(0);
    context.obstacles.forEach(o => {
      if (o.collision.itersToCollision !== null && o.collision.itersToCollision <= 3) {
        laneDanger[o.lane] += 1 / (o.collision.itersToCollision + 1);
      }
    });
    const minDanger = Math.min(...laneDanger);
    const leastDangerous = laneDanger.map((d, i) => ({ d, i }))
      .filter(({ d }) => d === minDanger)
      .map(({ i }) => i);
    return leastDangerous[0];
  }
  return safeLanes[0];
}

/**
 * Check if we can move to a lane safely
 */
export function canMoveToLane(context: Context, targetLane: number): boolean {
  const currentLane = getCurrentLane(context);
  if (currentLane === targetLane) return true;
  
  const direction = targetLane > currentLane ? 1 : -1;
  let current = currentLane;
  
  while (current !== targetLane) {
    const nextLane = current + direction;
    if (!isLaneSafe(context, nextLane)) {
      return false;
    }
    current = nextLane;
  }
  return true;
}

/**
 * Get direction to move to target lane
 */
export function getDirectionToLane(context: Context, targetLane: number): 'left' | 'right' | null {
  const currentLane = getCurrentLane(context);
  if (currentLane === targetLane) return null;
  return targetLane < currentLane ? 'left' : 'right';
}

/**
 * Check if path to target lane is safe
 */
export function isPathSafe(context: Context, targetLane: number): boolean {
  return canMoveToLane(context, targetLane);
}

/**
 * Find best safe path to target
 */
export function findSafePath(context: Context, targetLane: number): number[] | null {
  if (canMoveToLane(context, targetLane)) {
    const currentLane = getCurrentLane(context);
    const path: number[] = [];
    let current = currentLane;
    
    while (current !== targetLane) {
      path.push(current);
      current += targetLane > current ? 1 : -1;
    }
    path.push(targetLane);
    return path;
  }
  return null;
}

/**
 * Get alternative safe destinations
 */
export function getAlternativeDestinations(context: Context): number[] {
  const safeLanes = getSafeLanes(context);
  const currentLane = getCurrentLane(context);
  return safeLanes.filter(lane => lane !== currentLane && canMoveToLane(context, lane));
}

// ===== OBSTACLE DETECTION HELPERS =====

/**
 * Get obstacles in specific lane
 */
export function getObstaclesInLane(context: Context, lane: number) {
  return context.obstacles.filter(o => o.lane === lane);
}

/**
 * Get obstacles within range
 */
export function getObstaclesInRange(context: Context, iterations: number = 3) {
  return context.obstacles.filter(o => 
    o.collision.itersToCollision !== null && 
    o.collision.itersToCollision <= iterations
  );
}

/**
 * Check if lane has immediate threats
 */
export function hasImmediateThreats(context: Context, lane: number): boolean {
  return !isLaneSafe(context, lane);
}

/**
 * Get closest obstacle in lane
 */
export function getClosestObstacle(context: Context, lane: number) {
  const laneObstacles = getObstaclesInLane(context, lane)
    .filter(o => o.collision.itersToCollision !== null)
    .sort((a, b) => (a.collision.itersToCollision || 0) - (b.collision.itersToCollision || 0));
  return laneObstacles.length > 0 ? laneObstacles[0] : null;
}

/**
 * Calculate danger level of lane
 */
export function getLaneDanger(context: Context, lane: number): number {
  const obstacles = getObstaclesInLane(context, lane);
  return obstacles.reduce((danger, o) => {
    if (o.collision.itersToCollision !== null) {
      return danger + 1 / (o.collision.itersToCollision + 1);
    }
    return danger;
  }, 0);
}

/**
 * Check if we're in immediate danger
 */
export function isInDanger(context: Context): boolean {
  return hasImmediateThreats(context, getCurrentLane(context));
}

/**
 * Get emergency escape options
 */
export function getEmergencyOptions(context: Context): Array<{lane: number, direction: 'left' | 'right'}> {
  const currentLane = getCurrentLane(context);
  const options: Array<{lane: number, direction: 'left' | 'right'}> = [];
  
  if (currentLane > 0 && isLaneSafe(context, currentLane - 1)) {
    options.push({ lane: currentLane - 1, direction: 'left' });
  }
  
  if (currentLane < context.gameState.laneCount - 1 && isLaneSafe(context, currentLane + 1)) {
    options.push({ lane: currentLane + 1, direction: 'right' });
  }
  
  return options;
}

/**
 * Check if we should stay put
 */
export function shouldStayPut(context: Context): boolean {
  return isLaneSafe(context, getCurrentLane(context));
}

// ===== BONUS & POWER-UP HELPERS =====

/**
 * Get bonuses in specific lane
 */
export function getBonusesInLane(context: Context, lane: number) {
  return context.bonuses.filter(b => b.lane === lane);
}

/**
 * Get valuable bonuses (non-reversed)
 */
export function getValuableBonuses(context: Context) {
  return context.bonuses.filter(b => 
    b.collision.itersToCollision !== null && 
    b.collision.itersToCollision <= 5 &&
    !b.isReversed
  );
}

/**
 * Check if lane has good bonuses
 */
export function hasGoodBonuses(context: Context, lane: number): boolean {
  return getBonusesInLane(context, lane).some(b => !b.isReversed);
}

/**
 * Get bonus score for lane
 */
export function getBonusScore(context: Context, lane: number): number {
  const bonuses = getBonusesInLane(context, lane);
  return bonuses.reduce((score, b) => {
    if (b.collision.itersToCollision !== null && !b.isReversed) {
      return score + 50 / (b.collision.itersToCollision + 1);
    }
    return score;
  }, 0);
}

/**
 * Check if we have shield protection
 */
export function hasShieldProtection(context: Context): boolean {
  return context.player.invincibility.isActive || 
    (context.userData.activeBonuses && context.userData.activeBonuses.shield);
}

/**
 * Check if lane has dangerous reversed shield
 */
export function hasReversedShield(context: Context, lane: number): boolean {
  return getBonusesInLane(context, lane).some(b => 
    b.type === 'shield' && b.isReversed
  );
}

/**
 * Should avoid lane due to reversed shield
 */
export function shouldAvoidReversedShield(context: Context, lane: number): boolean {
  return hasShieldProtection(context) && hasReversedShield(context, lane);
}

// ===== COIN COLLECTION HELPERS =====

/**
 * Get coins in specific lane
 */
export function getCoinsInLane(context: Context, lane: number) {
  return context.coins.filter(c => c.lane === lane);
}

/**
 * Get coin trails
 */
export function getCoinTrails(context: Context) {
  return context.coins.filter(c => 
    c.collision.itersToCollision !== null && 
    c.collision.itersToCollision <= 4
  );
}

/**
 * Check if lane has coins
 */
export function hasCoins(context: Context, lane: number): boolean {
  return getCoinsInLane(context, lane).length > 0;
}

/**
 * Get coin score for lane
 */
export function getCoinScore(context: Context, lane: number): number {
  const coins = getCoinsInLane(context, lane);
  return coins.reduce((score, c) => {
    if (c.collision.itersToCollision !== null) {
      return score + 30 / (c.collision.itersToCollision + 1);
    }
    return score;
  }, 0);
}

// ===== STRATEGIC DECISION HELPERS =====

/**
 * Calculate overall lane score
 */
export function calculateLaneScore(context: Context, lane: number): number {
  let score = 0;
  
  // Base safety score
  if (isLaneSafe(context, lane)) {
    score += 100;
  }
  
  // Bonus attraction
  score += getBonusScore(context, lane);
  
  // Coin attraction
  score += getCoinScore(context, lane);
  
  // Penalty for reversed bonuses
  const reversedBonuses = getBonusesInLane(context, lane).filter(b => b.isReversed);
  reversedBonuses.forEach(b => {
    if (b.collision.itersToCollision !== null) {
      let penalty = 30 / (b.collision.itersToCollision + 1);
      if (b.type === 'shield' && hasShieldProtection(context)) {
        penalty *= 3;
      }
      score -= penalty;
    }
  });
  
  // Prefer current lane if safe
  if (lane === getCurrentLane(context) && isLaneSafe(context, lane)) {
    score += 20;
  }
  
  return score;
}

/**
 * Get best lane considering all factors
 */
export function getBestLane(context: Context): number {
  const laneScores = Array.from({ length: context.gameState.laneCount }, (_, i) => 
    calculateLaneScore(context, i)
  );
  return laneScores.indexOf(Math.max(...laneScores));
}

/**
 * Compare two lanes
 */
export function compareLanes(context: Context, lane1: number, lane2: number): number {
  const score1 = calculateLaneScore(context, lane1);
  const score2 = calculateLaneScore(context, lane2);
  return score2 - score1; // Higher score first
}

/**
 * Get optimal movement direction
 */
export function getOptimalMove(context: Context): 'left' | 'right' | null {
  const bestLane = getBestLane(context);
  const currentLane = getCurrentLane(context);
  
  if (bestLane === currentLane) return null;
  
  // Check if path is safe
  if (!canMoveToLane(context, bestLane)) {
    // Try emergency options
    const emergency = getEmergencyOptions(context);
    if (emergency.length > 0) {
      return emergency[0].direction;
    }
    return null;
  }
  
  return getDirectionToLane(context, bestLane);
}

/**
 * Check if movement is safe
 */
export function isMovementSafe(context: Context, direction: 'left' | 'right'): boolean {
  const currentLane = getCurrentLane(context);
  const targetLane = direction === 'left' ? currentLane - 1 : currentLane + 1;
  
  if (targetLane < 0 || targetLane >= context.gameState.laneCount) {
    return false;
  }
  
  return isLaneSafe(context, targetLane);
}

/**
 * Get safest adjacent lane
 */
export function getSafestAdjacentLane(context: Context): number {
  const currentLane = getCurrentLane(context);
  const adjacentLanes = [];
  
  if (currentLane > 0) adjacentLanes.push(currentLane - 1);
  if (currentLane < context.gameState.laneCount - 1) adjacentLanes.push(currentLane + 1);
  
  if (adjacentLanes.length === 0) return currentLane;
  
  const adjacentDanger = adjacentLanes.map(lane => ({
    lane,
    danger: getLaneDanger(context, lane)
  }));
  
  adjacentDanger.sort((a, b) => a.danger - b.danger);
  return adjacentDanger[0].lane;
}

// ===== GAME STATE HELPERS =====

/**
 * Check if player is invincible
 */
export function isInvincible(context: Context): boolean {
  return context.player.invincibility.isActive;
}

/**
 * Get remaining invincibility time
 */
export function getInvincibilityTime(context: Context): number {
  return context.player.invincibility.itersLeft;
}

/**
 * Check if player has active bonuses
 */
export function hasActiveBonuses(context: Context): boolean {
  return context.userData.activeBonuses && 
    Object.keys(context.userData.activeBonuses).length > 0;
}

/**
 * Get current score
 */
export function getScore(context: Context): number {
  return context.gameState.score;
}

/**
 * Get remaining lives
 */
export function getLives(context: Context): number {
  return context.gameState.lives;
}

/**
 * Get game speed
 */
export function getGameSpeed(context: Context): number {
  return context.gameState.gameSpeed;
}

/**
 * Get total lane count
 */
export function getLaneCount(context: Context): number {
  return context.gameState.laneCount;
}

// ===== UTILITY HELPERS =====

/**
 * Calculate distance between lanes
 */
export function getLaneDistance(lane1: number, lane2: number): number {
  return Math.abs(lane1 - lane2);
}

/**
 * Check if value is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Get random number between range
 */
export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ===== DEBUGGING HELPERS =====

/**
 * Log game state for debugging
 */
export function logGameState(context: Context): void {
  console.log('=== GAME STATE ===');
  console.log(`Current Lane: ${getCurrentLane(context)}`);
  console.log(`Score: ${getScore(context)}`);
  console.log(`Lives: ${getLives(context)}`);
  console.log(`Game Speed: ${getGameSpeed(context)}`);
  console.log(`Invincible: ${isInvincible(context)}`);
  console.log(`In Danger: ${isInDanger(context)}`);
}

/**
 * Log lane analysis
 */
export function logLaneAnalysis(context: Context): void {
  console.log('=== LANE ANALYSIS ===');
  for (let lane = 0; lane < getLaneCount(context); lane++) {
    const safe = isLaneSafe(context, lane);
    const danger = getLaneDanger(context, lane);
    const bonusScore = getBonusScore(context, lane);
    const coinScore = getCoinScore(context, lane);
    const totalScore = calculateLaneScore(context, lane);
    
    console.log(`Lane ${lane}: Safe=${safe}, Danger=${danger.toFixed(2)}, Bonus=${bonusScore.toFixed(1)}, Coins=${coinScore.toFixed(1)}, Total=${totalScore.toFixed(1)}`);
  }
}

/**
 * Log decision reasoning
 */
export function logDecision(context: Context, reason: string): void {
  console.log(`Decision: ${reason}`);
  console.log(`Best Lane: ${getBestLane(context)}`);
  console.log(`Optimal Move: ${getOptimalMove(context)}`);
} 