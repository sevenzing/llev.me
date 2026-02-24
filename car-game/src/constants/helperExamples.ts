// 🎮 HELPER FUNCTIONS DOCUMENTATION & EXAMPLES 🎮
// This file shows how to use the game helper functions to write effective car control code

import type { Context, MoveDirection } from '@/types/public/game';
import {
  getCurrentLane,
  isLaneSafe,
  getSafeLanes,
  findSafestLane,
  canMoveToLane,
  getDirectionToLane,
  isPathSafe,
  findSafePath,
  getAlternativeDestinations,
  getObstaclesInLane,
  getObstaclesInRange,
  hasImmediateThreats,
  getClosestObstacle,
  getLaneDanger,
  isInDanger,
  getEmergencyOptions,
  shouldStayPut,
  getBonusesInLane,
  getValuableBonuses,
  hasGoodBonuses,
  getBonusScore,
  hasShieldProtection,
  hasReversedShield,
  shouldAvoidReversedShield,
  getCoinsInLane,
  getCoinTrails,
  hasCoins,
  getCoinScore,
  calculateLaneScore,
  getBestLane,
  compareLanes,
  getOptimalMove,
  isMovementSafe,
  getSafestAdjacentLane,
  isInvincible,
  getInvincibilityTime,
  hasActiveBonuses,
  getScore,
  getLives,
  getGameSpeed,
  getLaneCount,
  getLaneDistance,
  isInRange,
  random,
  logGameState,
  logLaneAnalysis,
  logDecision
} from '../utils/gameHelpers';

// ===== BASIC USAGE =====

// Simple example using helpers
function handleNextMove(context: Context): MoveDirection {
  // Check if we're in immediate danger
  if (isInDanger(context)) {
    const emergency = getEmergencyOptions(context);
    if (emergency.length > 0) {
      return emergency[0].direction;
    }
  }
  
  // Get the best lane and move there
  const bestLane = getBestLane(context);
  return getDirectionToLane(context, bestLane);
}

// ===== NAVIGATION EXAMPLES =====

// Example 1: Simple safety-first approach
function safetyFirst(context: Context): MoveDirection {
  const currentLane = getCurrentLane(context);
  
  // If current lane is safe, stay put
  if (isLaneSafe(context, currentLane)) {
    return null;
  }
  
  // Find safest adjacent lane
  const leftLane = currentLane - 1;
  const rightLane = currentLane + 1;
  
  const leftSafe = leftLane >= 0 && isLaneSafe(context, leftLane);
  const rightSafe = rightLane < getLaneCount(context) && isLaneSafe(context, rightLane);
  
  if (leftSafe && rightSafe) {
    // Both safe, choose the safer one
    const leftDanger = getLaneDanger(context, leftLane);
    const rightDanger = getLaneDanger(context, rightLane);
    return leftDanger < rightDanger ? 'left' : 'right';
  } else if (leftSafe) {
    return 'left';
  } else if (rightSafe) {
    return 'right';
  }
  
  return null; // No safe options
}

// Example 2: Bonus collector
function bonusCollector(context: Context): MoveDirection {
  const valuableBonuses = getValuableBonuses(context);
  
  if (valuableBonuses.length === 0) {
    return getOptimalMove(context); // Fall back to optimal move
  }
  
  // Find the closest valuable bonus
  const closestBonus = valuableBonuses.reduce((closest, bonus) => {
    if (bonus.collision.itersToCollision !== null) {
      if (!closest || bonus.collision.itersToCollision < closest.collision.itersToCollision!) {
        return bonus;
      }
    }
    return closest;
  }, null as any);
  
  if (closestBonus && canMoveToLane(context, closestBonus.lane)) {
    return getDirectionToLane(context, closestBonus.lane);
  }
  
  return getOptimalMove(context);
}

// Example 3: Coin trail follower
function coinTrailer(context: Context): MoveDirection {
  const coinTrails = getCoinTrails(context);
  
  if (coinTrails.length === 0) {
    return getOptimalMove(context);
  }
  
  // Group coins by lane and find the lane with most coins
  const laneCoins: { [lane: number]: number } = {};
  coinTrails.forEach(coin => {
    laneCoins[coin.lane] = (laneCoins[coin.lane] || 0) + 1;
  });
  
  const bestCoinLane = Object.entries(laneCoins)
    .sort(([,a], [,b]) => b - a)[0][0];
  
  const targetLane = parseInt(bestCoinLane);
  
  if (canMoveToLane(context, targetLane)) {
    return getDirectionToLane(context, targetLane);
  }
  
  return getOptimalMove(context);
}

// Example 4: Shield protector
function shieldProtector(context: Context): MoveDirection {
  // If we have shield protection, be more careful
  if (hasShieldProtection(context)) {
    // Avoid lanes with reversed shields
    const currentLane = getCurrentLane(context);
    const safeLanes = getSafeLanes(context).filter(lane => 
      !shouldAvoidReversedShield(context, lane)
    );
    
    if (safeLanes.length === 0) {
      return null; // Stay put if no safe lanes
    }
    
    const bestSafeLane = safeLanes.reduce((best, lane) => {
      const bestScore = calculateLaneScore(context, best);
      const laneScore = calculateLaneScore(context, lane);
      return laneScore > bestScore ? lane : best;
    });
    
    return getDirectionToLane(context, bestSafeLane);
  }
  
  // No shield, use normal strategy
  return getOptimalMove(context);
}

// Example 5: Advanced pathfinder
function advancedPathfinder(context: Context): MoveDirection {
  const bestLane = getBestLane(context);
  const currentLane = getCurrentLane(context);
  
  if (bestLane === currentLane) {
    return null;
  }
  
  // Check if direct path is safe
  if (isPathSafe(context, bestLane)) {
    return getDirectionToLane(context, bestLane);
  }
  
  // Find alternative safe paths
  const alternatives = getAlternativeDestinations(context);
  
  if (alternatives.length > 0) {
    // Choose the best alternative
    const bestAlternative = alternatives.reduce((best, lane) => {
      const bestScore = calculateLaneScore(context, best);
      const laneScore = calculateLaneScore(context, lane);
      return laneScore > bestScore ? lane : best;
    });
    
    return getDirectionToLane(context, bestAlternative);
  }
  
  // Emergency escape
  const emergency = getEmergencyOptions(context);
  if (emergency.length > 0) {
    return emergency[0].direction;
  }
  
  return null;
}

// Example 6: Debug helper
function debugStrategy(context: Context): MoveDirection {
  // Log game state for debugging
  logGameState(context);
  logLaneAnalysis(context);
  
  const move = getOptimalMove(context);
  logDecision(context, `Optimal move: ${move}`);
  
  return move;
}

// Example 7: Adaptive strategy
function adaptiveStrategy(context: Context): MoveDirection {
  const lives = getLives(context);
  const score = getScore(context);
  const gameSpeed = getGameSpeed(context);
  
  // Adjust strategy based on game state
  if (lives <= 1) {
    // Very conservative when low on lives
    return safetyFirst(context);
  } else if (score > 1000 && gameSpeed > 6) {
    // Aggressive bonus collection when doing well
    return bonusCollector(context);
  } else if (hasShieldProtection(context)) {
    // Protect shield when we have it
    return shieldProtector(context);
  } else {
    // Balanced approach
    return advancedPathfinder(context);
  }
}

// Example 8: Lane scoring customizer
function customScorer(context: Context): MoveDirection {
  const currentLane = getCurrentLane(context);
  const laneCount = getLaneCount(context);
  
  // Custom lane scoring
  const customScores = Array.from({ length: laneCount }, (_, lane) => {
    let score = calculateLaneScore(context, lane);
    
    // Prefer center lanes (more escape options)
    const centerDistance = Math.abs(lane - (laneCount - 1) / 2);
    score -= centerDistance * 5;
    
    // Bonus for lanes with coins
    if (hasCoins(context, lane)) {
      score += 25;
    }
    
    // Heavy penalty for reversed bonuses
    const reversedBonuses = getBonusesInLane(context, lane).filter(b => b.isReversed);
    score -= reversedBonuses.length * 50;
    
    return score;
  });
  
  const bestLane = customScores.indexOf(Math.max(...customScores));
  
  if (bestLane === currentLane) {
    return null;
  }
  
  if (canMoveToLane(context, bestLane)) {
    return getDirectionToLane(context, bestLane);
  }
  
  return getOptimalMove(context);
}

// ===== QUICK REFERENCE =====

/*
NAVIGATION HELPERS:
- getCurrentLane(context) - Get current lane number
- isLaneSafe(context, lane, iterations) - Check if lane is safe
- getSafeLanes(context, iterations) - Get all safe lanes
- findSafestLane(context) - Find the safest lane
- canMoveToLane(context, targetLane) - Check if path is safe
- getDirectionToLane(context, targetLane) - Get movement direction
- isPathSafe(context, targetLane) - Check if path is safe
- findSafePath(context, targetLane) - Find safe path to target
- getAlternativeDestinations(context) - Get alternative safe lanes

OBSTACLE HELPERS:
- getObstaclesInLane(context, lane) - Get obstacles in lane
- getObstaclesInRange(context, iterations) - Get nearby obstacles
- hasImmediateThreats(context, lane) - Check for immediate threats
- getClosestObstacle(context, lane) - Get closest obstacle
- getLaneDanger(context, lane) - Calculate lane danger level
- isInDanger(context) - Check if player is in danger
- getEmergencyOptions(context) - Get emergency escape options
- shouldStayPut(context) - Check if should stay put

BONUS HELPERS:
- getBonusesInLane(context, lane) - Get bonuses in lane
- getValuableBonuses(context) - Get non-reversed bonuses
- hasGoodBonuses(context, lane) - Check for good bonuses
- getBonusScore(context, lane) - Calculate bonus score
- hasShieldProtection(context) - Check for shield protection
- hasReversedShield(context, lane) - Check for reversed shield
- shouldAvoidReversedShield(context, lane) - Should avoid lane

COIN HELPERS:
- getCoinsInLane(context, lane) - Get coins in lane
- getCoinTrails(context) - Get coin trails
- hasCoins(context, lane) - Check for coins
- getCoinScore(context, lane) - Calculate coin score

STRATEGIC HELPERS:
- calculateLaneScore(context, lane) - Calculate overall lane score
- getBestLane(context) - Get best lane
- compareLanes(context, lane1, lane2) - Compare lanes
- getOptimalMove(context) - Get optimal movement
- isMovementSafe(context, direction) - Check if movement is safe
- getSafestAdjacentLane(context) - Get safest adjacent lane

GAME STATE HELPERS:
- isInvincible(context) - Check if invincible
- getInvincibilityTime(context) - Get invincibility time
- hasActiveBonuses(context) - Check for active bonuses
- getScore(context) - Get current score
- getLives(context) - Get remaining lives
- getGameSpeed(context) - Get game speed
- getLaneCount(context) - Get total lanes

UTILITY HELPERS:
- getLaneDistance(lane1, lane2) - Calculate lane distance
- isInRange(value, min, max) - Check if in range
- random(min, max) - Get random number

DEBUG HELPERS:
- logGameState(context) - Log game state
- logLaneAnalysis(context) - Log lane analysis
- logDecision(context, reason) - Log decision
*/

// ===== TIPS & BEST PRACTICES =====

/*
1. ALWAYS check if movement is safe before moving
2. Use getOptimalMove() as a fallback for complex strategies
3. Consider shield protection when making decisions
4. Avoid reversed bonuses, especially shields when protected
5. Use emergency options when in immediate danger
6. Prefer current lane if it's safe (reduces unnecessary movement)
7. Consider coin trails for score optimization
8. Use debugging helpers to understand AI decisions
9. Combine multiple strategies for adaptive behavior
10. Test your code with different game scenarios
*/ 