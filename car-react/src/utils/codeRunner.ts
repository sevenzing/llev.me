import type { GameState } from "../types/game";
import { USER_CODE_CONFIG } from "../constants/gameConstants";

// Types for the code runner
export interface GameContext {
  player: {
    lane: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  obstacles: Array<{
    lane: number;
    x: number;
    y: number;
    width: number;
    height: number;
    movingSpeed: number;
  }>;
  bonuses: Array<{
    lane: number;
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
    isReversed: boolean;
  }>;
  gameState: {
    score: number;
    lives: number;
    gameSpeed: number;
    frameCount: number;
  };
}

export type MoveDirection = 'left' | 'right' | null;

export interface ExecutionResult {
  moveDirection: MoveDirection;
  executionTime: number;
  timedOut: boolean;
}

// Safe wrapper for user code execution
class SafeCodeRunner {
  private maxExecutionTime: number;

  constructor(timeoutMs?: number) {
    this.maxExecutionTime = timeoutMs ?? USER_CODE_CONFIG.maxExecutionTime;
  }

  // Update timeout dynamically
  public updateTimeout(timeoutMs: number): void {
    this.maxExecutionTime = timeoutMs;
  }

  // Create a safe context with only allowed functions
  private createSafeContext(): any {
    return {
      // Math functions (safe subset)
      Math: {
        abs: Math.abs,
        min: Math.min,
        max: Math.max,
        floor: Math.floor,
        ceil: Math.ceil,
        round: Math.round,
        sqrt: Math.sqrt,
        pow: Math.pow,
        PI: Math.PI,
      },
      // Array methods (safe subset)
      Array: {
        isArray: Array.isArray,
      },
      // Console for debugging (optional, can be removed for production)
      console: {
        log: console.log,
        warn: console.warn,
        error: console.error,
      },
    };
  }

  // Validate the return value
  private validateReturnValue(result: any): MoveDirection {
    if (result === null || result === undefined) {
      return null;
    }
    
    if (typeof result === 'string') {
      const direction = result.toLowerCase().trim();
      if (direction === 'left' || direction === 'right') {
        return direction as MoveDirection;
      }
    }
    
    // Invalid return value, return null
    console.warn('Invalid return value from user code:', result);
    return null;
  }

  // Execute user code safely
  public async executeCode(code: string, context: GameContext): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Create a new Function constructor with a safe context
      const safeContext = this.createSafeContext();
      
      // Create the function
      const userFunction = new Function(
        'context',
        'Math',
        'Array',
        'console',
        `
        "use strict";
        ${code}
        
        // Call the user's handleNextMove function
        if (typeof handleNextMove !== 'function') {
          throw new Error('handleNextMove function is required');
        }
        
        return handleNextMove(context.player, context.obstacles, context.bonuses);
        `
      );

      // Execute the function with timeout protection
      const executionPromise = new Promise<MoveDirection>((resolve, reject) => {
        try {
          const result = userFunction(context, safeContext.Math, safeContext.Array, safeContext.console);
          resolve(this.validateReturnValue(result));
        } catch (error) {
          reject(error);
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Execution timeout')), this.maxExecutionTime);
      });

      // Race between execution and timeout
      const moveDirection = await Promise.race([executionPromise, timeoutPromise]);
      const executionTime = Date.now() - startTime;
      
      return { 
        moveDirection, 
        executionTime, 
        timedOut: false 
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const isTimeout = error instanceof Error && error.message === 'Execution timeout';
      
      if (isTimeout) {
        console.warn(`User code execution timed out after ${executionTime}ms`);
      } else {
        console.error('Error executing user code:', error);
      }
      
      return { 
        moveDirection: null, 
        executionTime, 
        timedOut: true 
      };
    }
  }
}

// Export a singleton instance
export const codeRunner = new SafeCodeRunner(); // Will use configurable timeout

// Helper function to create game context from game state
export function createGameContext(gameState: GameState): GameContext {
  gameState = {...gameState};
  return {
    player: {
      lane: gameState.currentLane,
      x: gameState.carX,
      y: 0,
      width: 40,
      height: 70,
    },
    obstacles: gameState.obstacles.map((obstacle: any) => ({
      lane: obstacle.lane,
      x: obstacle.x,
      y: obstacle.y,
      width: obstacle.width,
      height: obstacle.height,
      movingSpeed: obstacle.movingSpeed,
    })),
    bonuses: gameState.bonuses.map((bonus: any) => ({
      lane: bonus.lane,
      x: bonus.x,
      y: bonus.y,
      width: bonus.width,
      height: bonus.height,
      type: bonus.type,
      isReversed: bonus.isReversed,
    })),
    gameState: {
      score: gameState.score,
      lives: gameState.lives,
      gameSpeed: gameState.gameSpeed,
      frameCount: gameState.frameCount,
    },
  };
} 