import type { GameState } from '../types/game';
import { CAR_DIMENSIONS, USER_CODE_CONFIG } from '../constants/gameConstants';
import * as ts from 'typescript';

// Types for the code runner
export interface Context {
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
    collision: {
      pixelsToCollision: number | null;
      framesToCollision: number | null;
      iterationsToCollision: number | null;
    };
  }>;
  bonuses: Array<{
    lane: number;
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
    isReversed: boolean;
    collision: {
      pixelsToCollision: number | null;
      framesToCollision: number | null;
      iterationsToCollision: number | null;
    };
  }>;
  gameState: {
    score: number;
    lives: number;
    gameSpeed: number;
    frameCount: number;
    nextInterationInFrames: number;
    laneCount: number;
  };
  userData: Record<string, any>;
}

export type MoveDirection = 'left' | 'right' | null;

export type ExecutionResult =
  | {
      result: 'success';
      moveDirection: MoveDirection;
      executionTime: number;
    }
  | {
      result: 'error';
      error: string | null;
      executionTime: number;
      isTimeout: boolean;
    };

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
    } else if (typeof result === 'string') {
      const direction = result.toLowerCase().trim();
      if (['left', 'l'].includes(direction)) {
        return 'left';
      } else if (['right', 'r'].includes(direction)) {
        return 'right';
      } else {
        throw new Error(`Invalid return value from user code: ${result}`);
      }
    } else {
      throw new Error(
        `Invalid return value from user code: ${result}. Expected 'left', 'right', or null.`
      );
    }
  }

  // Execute user code safely
  public async executeCode(code: string, context: Context): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      // Create a new Function constructor with a safe context
      const safeContext = this.createSafeContext();

      const transpiledCode = transpileTypeScript(code);

      // Create the function
      const userFunction = new Function(
        'context',
        'Math',
        'Array',
        'console',
        `
        "use strict";
        ${transpiledCode}

        // Call the user's handleNextMove function
        if (typeof handleNextMove !== 'function') {
          throw new Error('handleNextMove function is required. Please define a function named handleNextMove.');
        }
        
        const result = handleNextMove(context);
        
        // Validate return value
        if (result !== null && result !== 'left' && result !== 'right') {
          throw new Error('handleNextMove must return "left", "right", or null. Got: ' + JSON.stringify(result));
        }
        
        return result;
        `
      );

      // Execute the function with timeout protection
      const executionPromise = new Promise<MoveDirection>((resolve, reject) => {
        try {
          const result = userFunction(
            context,
            safeContext.Math,
            safeContext.Array,
            safeContext.console
          );
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
        result: 'success',
        moveDirection,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const isTimeout = error instanceof Error && error.message === 'Execution timeout';

      // Provide more specific error messages
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        if (isTimeout) {
          errorMessage = `Execution timed out after ${executionTime}ms`;
        } else if (error.message.includes('Unexpected token')) {
          errorMessage = `Syntax error: ${error.message}. Please check your TypeScript/JavaScript syntax.`;
        } else if (error.message.includes('is not defined')) {
          errorMessage = `Reference error: ${error.message}. Make sure all variables are properly declared.`;
        } else if (error.message.includes('Cannot read property')) {
          errorMessage = `Property access error: ${error.message}. Check that objects exist before accessing their properties.`;
        } else {
          errorMessage = error.message;
        }
      }

      return {
        result: 'error',
        error: errorMessage,
        executionTime,
        isTimeout,
      };
    }
  }
}

// Export a singleton instance
export const codeRunner = new SafeCodeRunner(); // Will use configurable timeout

// Persistent userData object for user code
let userData: Record<string, any> = {};

export function createGameContext(gameState: GameState): Context {
  const carY = gameState.carY;
  const carHeight = CAR_DIMENSIONS.height;
  const carWidth = CAR_DIMENSIONS.width;
  const carLane = gameState.currentLane;
  const carX = gameState.carX;
  const gameSpeed = gameState.gameSpeed;
  const execFreq = gameState.executionFrequency || 1;

  function getCollisionInfo(obj: {
    y: number;
    height: number;
    lane: number;
    movingSpeed?: number;
  }) {
    // Only relevant if in the same lane
    const pixelsToCollision = carY - obj.y - carHeight;
    // Calculate frames to collision (if in same lane)
    const speed = (obj.movingSpeed ?? 1) * gameSpeed;
    const framesToCollision = speed > 0 ? Math.max(0, Math.floor(pixelsToCollision / speed)) : null;
    // Calculate iterations to collision
    const iterationsToCollision =
      framesToCollision !== null ? Math.floor(framesToCollision / execFreq) : null;
    return {
      pixelsToCollision,
      framesToCollision,
      iterationsToCollision,
    };
  }

  return {
    player: {
      lane: carLane,
      x: carX,
      y: carY,
      width: carWidth,
      height: carHeight,
    },
    obstacles: gameState.obstacles.map((obstacle) => ({
      lane: obstacle.lane,
      x: obstacle.x,
      y: obstacle.y,
      width: obstacle.width,
      height: obstacle.height,
      movingSpeed: obstacle.movingSpeed,
      collision: getCollisionInfo(obstacle),
    })),
    bonuses: gameState.bonuses.map((bonus) => ({
      lane: bonus.lane,
      x: bonus.x,
      y: bonus.y,
      width: bonus.width,
      height: bonus.height,
      type: bonus.type,
      isReversed: bonus.isReversed,
      collision: getCollisionInfo(bonus),
    })),
    gameState: {
      score: Math.floor(gameState.publicScore),
      lives: gameState.lives,
      gameSpeed: gameState.gameSpeed,
      frameCount: gameState.frameCount,
      nextInterationInFrames: gameState.executionFrequency,
      laneCount: gameState.laneCount,
    },
    userData,
  };
}

// Allow user code to mutate userData
export function resetUserData() {
  userData = {};
}

function transpileTypeScript(tsCode: string): string {
  const result = ts.transpileModule(tsCode, { compilerOptions: { module: ts.ModuleKind.ESNext } });
  return result.outputText;
}
