import React from 'react';
import type { GameState, Difficulty } from '../types/game';
import styles from '../styles/Game.module.css';

interface GameControlsProps {
  gameState: GameState;
  selectedDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onStartGame: () => void;
  onStopGame: () => void;
  onWatchGame: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  selectedDifficulty,
  onDifficultyChange,
  onStartGame,
  onStopGame,
  onWatchGame,
}) => {
  return (
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
  );
}; 