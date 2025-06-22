import React from 'react';
import type { GameState, Difficulty } from '../types/game';
import { GAME_CONFIG } from '../constants/gameConstants';
import styles from '../styles/Game.module.css';

interface GameUIProps {
  gameState: GameState;
  selectedDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onStartGame: () => void;
  onStopGame: () => void;
  onWatchGame: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  gameState,
  selectedDifficulty,
  onDifficultyChange,
  onStartGame,
  onStopGame,
  onWatchGame,
}) => {
  const getRemainingTime = (bonus: { endTime: number } | null) => {
    if (!bonus) return 0;
    return Math.max(0, Math.ceil((bonus.endTime - Date.now()) / 1000));
  };

  return (
    <div className={styles.gameUI}>
      {/* Score Display */}
      <div className={styles.scoreDisplay}>Score: {gameState.score}</div>
      
      {/* Heart Display */}
      <div className={styles.heartDisplay}>
        {Array.from({ length: GAME_CONFIG.maxLives }, (_, index) => (
          <img
            key={index}
            src="/static/heart.png"
            alt="Heart"
            className={`${styles.heartIcon} ${index >= gameState.lives ? styles.empty : ''}`}
          />
        ))}
      </div>

      {/* Game Controls */}
      <div className={styles.gameControls}>
        <fieldset className={styles.difficultySelector}>
          {(['easy', 'normal', 'hard', 'insane'] as const).map((difficulty) => (
            <label key={difficulty} className={styles.difficultyOption}>
              <input
                type="radio"
                name="difficulty"
                value={difficulty}
                checked={selectedDifficulty === difficulty}
                onChange={() => onDifficultyChange(difficulty)}
                disabled={gameState.isRunning}
                className={styles.difficultyRadio}
              />
              <span className={styles.difficultyLabel}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
            </label>
          ))}
        </fieldset>

        <div className={styles.buttonContainer}>
          <button
            className={`${styles.gameButton} ${styles.startButton}`}
            onClick={onStartGame}
            disabled={gameState.isRunning}
          >
            Start
          </button>
          <button
            className={`${styles.gameButton} ${styles.stopButton}`}
            onClick={onStopGame}
            disabled={!gameState.isRunning}
          >
            Stop
          </button>
          <button
            className={`${styles.gameButton} ${styles.watchButton}`}
            onClick={onWatchGame}
            disabled={gameState.isRunning}
          >
            Just Watch
          </button>
        </div>
      </div>

      {/* Bonus Display */}
      <div className={styles.bonusDisplay}>
        <div className={`${styles.activeBonus} ${gameState.activeBonuses.speedup ? '' : styles.hidden}`}>
          <div className={styles.bonusContainer}>
            <img src="/static/speedup.png" className={`${styles.bonusIcon} ${styles.speedup}`} alt="Speedup" />
            <span className={styles.bonusTime}>{getRemainingTime(gameState.activeBonuses.speedup)}s</span>
          </div>
        </div>
        <div className={`${styles.activeBonus} ${gameState.activeBonuses.shield ? '' : styles.hidden}`}>
          <div className={styles.bonusContainer}>
            <img src="/static/shield.png" className={`${styles.bonusIcon} ${styles.shield}`} alt="Shield" />
            <span className={styles.bonusTime}>{getRemainingTime(gameState.activeBonuses.shield)}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 