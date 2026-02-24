import React from "react";
import { GameControls } from "./GameControls";
import type { GameState, Difficulty } from "../types/game";
import styles from "../styles/GameControls.module.css";

interface GameAllControlsProps {
  gameState: GameState;
  selectedDifficulty: Difficulty;
  setSelectedDifficulty: (d: Difficulty) => void;
  handleStartGame: () => void;
  endGame: () => void;
  isCodeOpen: boolean;
  setIsCodeOpen: (open: boolean | ((open: boolean) => boolean)) => void;
  isSeedEnabled: boolean;
  setIsSeedEnabled: (v: boolean) => void;
  seed: number;
  setSeed: (v: number) => void;
  userCode: string;
  handleRunCode: () => void;
  isAutoModeEnabled: boolean;
}

export const GameAllControls: React.FC<GameAllControlsProps> = ({
  gameState,
  selectedDifficulty,
  setSelectedDifficulty,
  handleStartGame,
  endGame,
  isCodeOpen,
  setIsCodeOpen,
  isSeedEnabled,
  setIsSeedEnabled,
  seed,
  setSeed,
  handleRunCode,
  isAutoModeEnabled,
}) => {
  const codeItControls = (
    <div className={styles.seedControls}>
      <label className={styles.seedLabel}>
        <input
          type="checkbox"
          checked={isSeedEnabled}
          onChange={(e) => setIsSeedEnabled(e.target.checked)}
          className={styles.seedCheckbox}
        />
        Set Seed
      </label>
      <input
        type="number"
        value={seed}
        min={0}
        max={2 ** 32 - 1}
        onChange={(e) => setSeed(Number(e.target.value) || 0)}
        disabled={!isSeedEnabled}
        className={styles.seedInput}
      />

    </div>
  );
  return (
    <div className={styles.codeEditorControls}>
      {isCodeOpen && codeItControls}
      <GameControls
        gameState={gameState}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        onStartGame={handleStartGame}
        onRunCode={handleRunCode}
        onStopGame={endGame}
        onCodeItClick={() => setIsCodeOpen((open: boolean) => !open)}
        isCodeOpen={isCodeOpen}
        isAutoModeEnabled={isAutoModeEnabled}
      />
    </div>
  );
};
