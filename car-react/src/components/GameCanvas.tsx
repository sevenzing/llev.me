import { useRef, useEffect } from 'react';
import type { GameState } from '../types/game';
import { GAME_CONFIG, CAR_DIMENSIONS, CANVAS_CONFIG, BONUSES_CONFIG } from '../constants/gameConstants';
import styles from '../styles/Game.module.css';

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
  onTouchStart 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw road lines
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 20]);
    
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
        GAME_CONFIG.carY,
        CAR_DIMENSIONS.width,
        CAR_DIMENSIONS.height
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
        ctx.drawImage(
          images.shield,
          shieldX,
          shieldY,
          w,
          h
        );
        ctx.restore();
      }
    }

    // Draw bonuses
    gameState.bonuses.forEach(bonus => {
      if (bonus.image) {
        // Add glow effect
        ctx.save();
        ctx.shadowColor = bonus.config.glow.color;
        ctx.shadowBlur = bonus.config.glow.size;
        ctx.drawImage(
          bonus.image,
          bonus.x,
          bonus.y,
          bonus.width,
          bonus.height
        );
        ctx.restore();
      }
    });

    // Draw obstacles
    gameState.obstacles.forEach(obstacle => {
      if (images.enemyCar) {
        ctx.drawImage(
          images.enemyCar,
          obstacle.x,
          obstacle.y,
          obstacle.width,
          obstacle.height
        );
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
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    />
  );
}; 