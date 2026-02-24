import type { Context } from '@/types/public/game';
/**
 * Get current lane
 */
export declare function getCurrentLane(context: Context): number;
/**
 * Check if lane is safe (no immediate obstacles)
 */
export declare function isLaneSafe(context: Context, lane: number, iterations?: number): boolean;
/**
 * Get all safe lanes within range
 */
export declare function getSafeLanes(context: Context, iterations?: number): number[];
/**
 * Find the safest lane
 */
export declare function findSafestLane(context: Context): number;
/**
 * Check if we can move to a lane safely
 */
export declare function canMoveToLane(context: Context, targetLane: number): boolean;
/**
 * Get direction to move to target lane
 */
export declare function getDirectionToLane(context: Context, targetLane: number): 'left' | 'right' | null;
/**
 * Check if path to target lane is safe
 */
export declare function isPathSafe(context: Context, targetLane: number): boolean;
/**
 * Find best safe path to target
 */
export declare function findSafePath(context: Context, targetLane: number): number[] | null;
/**
 * Get alternative safe destinations
 */
export declare function getAlternativeDestinations(context: Context): number[];
/**
 * Get obstacles in specific lane
 */
export declare function getObstaclesInLane(context: Context, lane: number): {
    lane: number;
    x: number;
    y: number;
    width: number;
    height: number;
    movingSpeed: number;
    collision: {
        pixelsToCollision: number | null;
        framesToCollision: number | null;
        itersToCollision: number | null;
    };
}[];
/**
 * Get obstacles within range
 */
export declare function getObstaclesInRange(context: Context, iterations?: number): {
    lane: number;
    x: number;
    y: number;
    width: number;
    height: number;
    movingSpeed: number;
    collision: {
        pixelsToCollision: number | null;
        framesToCollision: number | null;
        itersToCollision: number | null;
    };
}[];
/**
 * Check if lane has immediate threats
 */
export declare function hasImmediateThreats(context: Context, lane: number): boolean;
/**
 * Get closest obstacle in lane
 */
export declare function getClosestObstacle(context: Context, lane: number): {
    lane: number;
    x: number;
    y: number;
    width: number;
    height: number;
    movingSpeed: number;
    collision: {
        pixelsToCollision: number | null;
        framesToCollision: number | null;
        itersToCollision: number | null;
    };
};
/**
 * Calculate danger level of lane
 */
export declare function getLaneDanger(context: Context, lane: number): number;
/**
 * Check if we're in immediate danger
 */
export declare function isInDanger(context: Context): boolean;
/**
 * Get emergency escape options
 */
export declare function getEmergencyOptions(context: Context): Array<{
    lane: number;
    direction: 'left' | 'right';
}>;
/**
 * Check if we should stay put
 */
export declare function shouldStayPut(context: Context): boolean;
/**
 * Get bonuses in specific lane
 */
export declare function getBonusesInLane(context: Context, lane: number): {
    lane: number;
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
    isReversed: boolean;
    movingSpeed: number;
    collision: {
        pixelsToCollision: number | null;
        framesToCollision: number | null;
        itersToCollision: number | null;
    };
}[];
/**
 * Get valuable bonuses (non-reversed)
 */
export declare function getValuableBonuses(context: Context): {
    lane: number;
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
    isReversed: boolean;
    movingSpeed: number;
    collision: {
        pixelsToCollision: number | null;
        framesToCollision: number | null;
        itersToCollision: number | null;
    };
}[];
/**
 * Check if lane has good bonuses
 */
export declare function hasGoodBonuses(context: Context, lane: number): boolean;
/**
 * Get bonus score for lane
 */
export declare function getBonusScore(context: Context, lane: number): number;
/**
 * Check if we have shield protection
 */
export declare function hasShieldProtection(context: Context): boolean;
/**
 * Check if lane has dangerous reversed shield
 */
export declare function hasReversedShield(context: Context, lane: number): boolean;
/**
 * Should avoid lane due to reversed shield
 */
export declare function shouldAvoidReversedShield(context: Context, lane: number): boolean;
/**
 * Get coins in specific lane
 */
export declare function getCoinsInLane(context: Context, lane: number): {
    lane: number;
    x: number;
    y: number;
    width: number;
    height: number;
    movingSpeed: number;
    trailId: string;
    collision: {
        pixelsToCollision: number | null;
        framesToCollision: number | null;
        itersToCollision: number | null;
    };
}[];
/**
 * Get coin trails
 */
export declare function getCoinTrails(context: Context): {
    lane: number;
    x: number;
    y: number;
    width: number;
    height: number;
    movingSpeed: number;
    trailId: string;
    collision: {
        pixelsToCollision: number | null;
        framesToCollision: number | null;
        itersToCollision: number | null;
    };
}[];
/**
 * Check if lane has coins
 */
export declare function hasCoins(context: Context, lane: number): boolean;
/**
 * Get coin score for lane
 */
export declare function getCoinScore(context: Context, lane: number): number;
/**
 * Calculate overall lane score
 */
export declare function calculateLaneScore(context: Context, lane: number): number;
/**
 * Get best lane considering all factors
 */
export declare function getBestLane(context: Context): number;
/**
 * Compare two lanes
 */
export declare function compareLanes(context: Context, lane1: number, lane2: number): number;
/**
 * Get optimal movement direction
 */
export declare function getOptimalMove(context: Context): 'left' | 'right' | null;
/**
 * Check if movement is safe
 */
export declare function isMovementSafe(context: Context, direction: 'left' | 'right'): boolean;
/**
 * Get safest adjacent lane
 */
export declare function getSafestAdjacentLane(context: Context): number;
/**
 * Check if player is invincible
 */
export declare function isInvincible(context: Context): boolean;
/**
 * Get remaining invincibility time
 */
export declare function getInvincibilityTime(context: Context): number;
/**
 * Check if player has active bonuses
 */
export declare function hasActiveBonuses(context: Context): boolean;
/**
 * Get current score
 */
export declare function getScore(context: Context): number;
/**
 * Get remaining lives
 */
export declare function getLives(context: Context): number;
/**
 * Get game speed
 */
export declare function getGameSpeed(context: Context): number;
/**
 * Get total lane count
 */
export declare function getLaneCount(context: Context): number;
/**
 * Calculate distance between lanes
 */
export declare function getLaneDistance(lane1: number, lane2: number): number;
/**
 * Check if value is within range
 */
export declare function isInRange(value: number, min: number, max: number): boolean;
/**
 * Get random number between range
 */
export declare function random(min: number, max: number): number;
/**
 * Log game state for debugging
 */
export declare function logGameState(context: Context): void;
/**
 * Log lane analysis
 */
export declare function logLaneAnalysis(context: Context): void;
/**
 * Log decision reasoning
 */
export declare function logDecision(context: Context, reason: string): void;
