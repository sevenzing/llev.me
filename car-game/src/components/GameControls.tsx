import React from "react";
import type { GameState, Difficulty } from "../types/game";
import styles from "../styles/GameControls.module.css";
import { MovingBorderButton } from "./ui/moving-border";

interface GameControlsProps {
  gameState: GameState;
  selectedDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onStartGame: () => void;
  onRunCode: () => void;
  onStopGame: () => void;
  onCodeItClick: () => void;
  isCodeOpen: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  selectedDifficulty,
  onDifficultyChange,
  onStartGame,
  onRunCode,
  onStopGame,
  onCodeItClick,
  isCodeOpen,
}) => {
  return (
    <div className={styles.gameControls}>
      <fieldset className={styles.difficultySelector}>
        {(["easy", "normal", "hard", "insane"] as const).map((difficulty) => (
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
          PLAY
        </button>

        <MovingBorderButton
          className={`${styles.gameButton} ${styles.runCodeButton} p-3`}
          onClick={onRunCode}
          disabled={gameState.isRunning}
          as={"button"}
          borderRadius="var(--radius)"
        >
          AUTO
        </MovingBorderButton>

        <button
          className={`${styles.gameButton} ${styles.stopButton}`}
          onClick={onStopGame}
          disabled={!gameState.isRunning}
        >
          STOP
        </button>
        <button
          className={`${styles.gameButton} ${styles.codeItButton}`}
          onClick={onCodeItClick}
        >
          {isCodeOpen ? "CLOSE" : "CODE"}
        </button>
      </div>
    </div>
  );
};
