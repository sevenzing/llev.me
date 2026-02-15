declare type Context = {
  player: {
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
      itersToCollision: number | null;
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
    movingSpeed: number;
    collision: {
      pixelsToCollision: number | null;
      framesToCollision: number | null;
      itersToCollision: number | null;
    };
  }>;
  coins: Array<{
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
  }>;
  gameState: {
    score: number;
    lives: number;
    gameSpeed: number;
    frameCount: number;
    nextInterationInFrames: number;
    laneCount: number;
    coinsCollected: number;
  };
  userData: Record<string, any>;
}

declare type MoveDirection = "left" | "right" | null;

export type { Context, MoveDirection };
