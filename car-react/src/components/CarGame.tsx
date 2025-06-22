import React, { useEffect } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameCanvas } from './GameCanvas';
import { GameHeader } from './GameHeader';
import { GameControls } from './GameControls';
import { CANVAS_CONFIG } from '../constants/gameConstants';
import styles from '../styles/Game.module.css';

export const CarGame: React.FC = () => {
  const {
    gameState,
    selectedDifficulty,
    setSelectedDifficulty,
    moveCarLeft,
    moveCarRight,
    startGame,
    endGame,
    images,
  } = useGameLogic();

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!gameState.isRunning) return;

      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          moveCarLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          moveCarRight();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isRunning, moveCarLeft, moveCarRight]);

  // Handle canvas click for mobile
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState.isRunning) return;

    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const canvasCenter = CANVAS_CONFIG.width / 2;

    if (clickX < canvasCenter) {
      moveCarLeft();
    } else {
      moveCarRight();
    }
  };

  // Handle touch events for mobile
  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (!gameState.isRunning) return;

    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const touchX = event.touches[0].clientX - rect.left;
    const canvasCenter = CANVAS_CONFIG.width / 2;

    if (touchX < canvasCenter) {
      moveCarLeft();
    } else {
      moveCarRight();
    }
  };

  return (
    <div className={styles.carGame}>
      <h1 className={styles.gameTitle}>
        🚗 LLev's Car <span className={styles.titleEmoji}>💥</span>
      </h1>

      <GameHeader gameState={gameState} />

      <div className={styles.gameCanvasContainer}>
        <GameCanvas
          gameState={gameState}
          images={images}
          onClick={handleCanvasClick}
          onTouchStart={handleTouchStart}
        />
      </div>

      <GameControls
        gameState={gameState}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        onStartGame={() => startGame(false)}
        onStopGame={endGame}
        onWatchGame={() => startGame(true)}
      />
    </div>
  );
}; 