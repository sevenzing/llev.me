import { useRef, useEffect } from "react";
import type { GameState } from "../types/game";
import {
  GAME_CONFIG,
  CAR_DIMENSIONS,
  CANVAS_CONFIG,
  BONUSES_CONFIG,
  FADE_OUT_DURATION,
} from "../constants/gameConstants";
import styles from "../styles/GameCanvas.module.css";

interface GameCanvasProps {
  gameState: GameState;
  images: { [key: string]: HTMLImageElement };
  onClick?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onTouchStart?: (event: React.TouchEvent<HTMLCanvasElement>) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  images,
  onClick,
  onTouchStart,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw road lines
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 2;
    ctx.setLineDash([GAME_CONFIG.laneDashLength, GAME_CONFIG.laneDashGap]);

    for (let i = 1; i < GAME_CONFIG.laneCount; i++) {
      const x = i * GAME_CONFIG.laneWidth;
      ctx.beginPath();
      ctx.moveTo(x, -40 + gameState.roadLineOffset);
      ctx.lineTo(x, canvas.height + 40);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw player car
    if (gameState.isVisible && images.playerCar) {
      ctx.drawImage(
        images.playerCar,
        gameState.carX,
        gameState.carY,
        CAR_DIMENSIONS.width,
        CAR_DIMENSIONS.height,
      );

      // Draw shield over the car if active
      if (gameState.activeBonuses.shield && images.shield) {
        const shieldConfig = BONUSES_CONFIG.items.shield;
        const w = shieldConfig.width * (shieldConfig.spriteOnPlayerScale || 1);
        const h = shieldConfig.height * (shieldConfig.spriteOnPlayerScale || 1);
        const shieldX = gameState.carX + CAR_DIMENSIONS.width / 2 - w / 2;
        const shieldY = GAME_CONFIG.carY + CAR_DIMENSIONS.height / 2 - h / 2;

        ctx.save();
        ctx.shadowColor = shieldConfig.glow.color;
        ctx.shadowBlur = shieldConfig.glow.size;
        ctx.drawImage(images.shield, shieldX, shieldY, w, h);
        ctx.restore();
      }
    }

    // Draw coins
    gameState.coins.forEach((coin) => {
      if (
        coin.y + coin.height > 0 &&
        coin.y < CANVAS_CONFIG.height
      ) {
        ctx.drawImage(images.coin, coin.x, coin.y, coin.width, coin.height);
      }
    });

    // Draw bonuses
    gameState.bonuses.forEach((bonus) => {
      if (bonus.image) {
        // Add glow effect
        ctx.save();
        ctx.shadowColor = bonus.config.glow.color;
        ctx.shadowBlur = bonus.config.glow.size;
        ctx.drawImage(bonus.image, bonus.x, bonus.y, bonus.width, bonus.height);
        ctx.restore();
      }
    });

    // Draw obstacles
    gameState.obstacles.forEach((obstacle) => {
      if (images.enemyCar) {
        let alpha = 1.0;
        let width = obstacle.width;
        let height = obstacle.height;
        let x = obstacle.x;
        let rotation = obstacle.rotation || 0;

        if (obstacle.isFadingOut) {
          const elapsedTime = Date.now() - (obstacle.fadeStartTime || 0);
          const progress = Math.min(elapsedTime / FADE_OUT_DURATION, 1);

          alpha = 1 - progress;
          width = obstacle.width * (1 - progress);
          height = obstacle.height * (1 - progress);
          x = obstacle.x + (obstacle.width - width) / 2;
          rotation += progress * Math.PI * 2; // Spin it!
        }

        ctx.save();
        ctx.globalAlpha = alpha;

        // Translate and rotate for spinning effect
        ctx.translate(x + width / 2, obstacle.y + height / 2);
        ctx.rotate(rotation);
        ctx.translate(-(x + width / 2), -(obstacle.y + height / 2));

        ctx.drawImage(images.enemyCar, x, obstacle.y, width, height);
        ctx.restore();
      }
    });
  }, [gameState, images]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_CONFIG.width}
      height={CANVAS_CONFIG.height}
      className={styles.gameCanvas}
      onClick={onClick}
      onTouchStart={onTouchStart}
      style={{ cursor: onClick ? "pointer" : "default" }}
    />
  );
};
