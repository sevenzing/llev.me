import React, { useEffect, useState, useRef } from "react";
import { useGameLogic } from "../hooks/useGameLogic";
import { GameCanvas } from "./GameCanvas";
import { GameHeader } from "./GameHeader";
import { GameAllControls } from "./GameAllControls";
import {
  CANVAS_CONFIG,
  DEFAULT_EDITOR_CONTENT,
  DEFAULT_EDITOR_FILE_NAME,
} from "../constants/gameConstants";
import styles from "../styles/Game.module.css";
import MonacoEditor from "@monaco-editor/react";
import { errorToast } from "./ErrorToast";

const MIN_GAME_WIDTH = 450;
const MIN_CODE_WIDTH = 530;
const DEFAULT_GAME_WIDTH = 600;

export const CarGame: React.FC = () => {
  // Add seed state and checkbox state
  const [seed, setSeed] = useState<number>(0);
  const [isSeedEnabled, setIsSeedEnabled] = useState<boolean>(false);
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [userCode, setUserCode] = useState(DEFAULT_EDITOR_CONTENT);
  const [gamePaneWidth, setGamePaneWidth] = useState(DEFAULT_GAME_WIDTH);
  const dragging = useRef(false);

  const {
    gameState,
    selectedDifficulty,
    setSelectedDifficulty,
    userMovesCarLeft,
    userMovesCarRight,
    startGame,
    endGame,
    images,
    codeError,
  } = useGameLogic(seed, userCode);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!gameState.isRunning) return;

      switch (event.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          event.preventDefault();
          userMovesCarLeft();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          event.preventDefault();
          userMovesCarRight();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState.isRunning, userMovesCarLeft, userMovesCarRight]);

  // Handle canvas click: move to the lane that was clicked
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState.isRunning) return;
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const laneWidth = CANVAS_CONFIG.width / gameState.laneCount;
    const clickedLane = Math.floor(clickX / laneWidth);
    if (clickedLane < 0 || clickedLane >= gameState.laneCount) return;
    if (clickedLane === gameState.currentLane) return;
    if (clickedLane < gameState.currentLane) userMovesCarLeft();
    else userMovesCarRight();
  };

  // Touch swipe logic (anywhere on screen)
  const touchStartX = useRef<number | null>(null);
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (!gameState.isRunning) return;
      touchStartX.current = event.touches[0].clientX;
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (!gameState.isRunning) return;
      event.preventDefault(); // Prevent default touch behavior (scrolling)
    };
    const handleTouchEnd = (event: TouchEvent) => {
      if (!gameState.isRunning || touchStartX.current === null) return;
      const endX = event.changedTouches[0].clientX;
      const deltaX = endX - touchStartX.current;
      if (Math.abs(deltaX) > 30) {
        if (deltaX > 0) userMovesCarRight();
        else userMovesCarLeft();
      }
      touchStartX.current = null;
    };
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState.isRunning, userMovesCarLeft, userMovesCarRight]);

  // Drag handlers for resizer
  useEffect(() => {
    if (!isCodeOpen) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const minGame = MIN_GAME_WIDTH;
      const minCode = MIN_CODE_WIDTH;
      const total = window.innerWidth;
      let newGameWidth = e.clientX;
      if (newGameWidth < minGame) newGameWidth = minGame;
      if (total - newGameWidth < minCode) newGameWidth = total - minCode;
      setGamePaneWidth(newGameWidth);
    };
    const handleMouseUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isCodeOpen]);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
  };

  // Handle game start with seed logic (manual mode)
  const handleStartGame = () => {
    if (!isSeedEnabled) {
      // Generate random seed when checkbox is unchecked
      setSeed(Math.floor(Math.random() * (2 ** 32 - 2 ** 31) + 2 ** 31));
    }
    startGame(false); // false = manual mode
  };

  // Handle Run button click (auto mode with code execution)
  const handleRunCode = () => {
    if (!userCode.trim()) {
      console.log("Please write some code first!");
      return;
    }

    if (!isSeedEnabled) {
      // Generate random seed when checkbox is unchecked
      setSeed(Math.floor(Math.random() * (2 ** 32 - 2 ** 31) + 2 ** 31));
    }

    if (gameState.isRunning) {
      console.log("Game is already running!");
    } else {
      console.log("Starting game in auto mode with your code...");
      startGame(true); // true = auto mode
    }
  };

  const gameHeaderPlusCanvas = (
    <>
      <h1 className={styles.gameTitle}>
        🚗 LLev's Car <span className={styles.titleEmoji}>💥</span>
      </h1>
      <GameHeader gameState={gameState} />
      <div className={styles.gameCanvasContainer}>
        <GameCanvas
          gameState={gameState}
          images={images}
          onClick={handleCanvasClick}
        />
      </div>
    </>
  );

  // Show toast when codeError changes
  React.useEffect(() => {
    if (codeError) {
      errorToast("Runtime error", codeError);
    }
  }, [codeError]);

  return (
    <div className={isCodeOpen ? styles.splitContainer : styles.carGame}>
      {isCodeOpen ? (
        <>
          <div
            className={styles.leftPane}
            style={{
              width: gamePaneWidth,
              minWidth: MIN_GAME_WIDTH,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {gameHeaderPlusCanvas}
          </div>
          <div
            className={styles.resizer}
            onMouseDown={startDrag}
            style={{ minHeight: "100vh" }}
          />
          <div
            className={styles.rightPane}
            style={{ minWidth: MIN_CODE_WIDTH }}
          >
            <div className={styles.codeTabHeader}>
              {DEFAULT_EDITOR_FILE_NAME}
            </div>
            <MonacoEditor
              height="100%"
              defaultLanguage="typescript"
              theme="vs-dark"
              value={userCode}
              onChange={(value) => setUserCode(value ?? "")}
              options={{
                fontSize: 16,
                minimap: { enabled: false },
                wordWrap: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                readOnly: gameState.isRunning,
              }}
            />
            <GameAllControls
              gameState={gameState}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              handleStartGame={handleStartGame}
              endGame={endGame}
              isCodeOpen={isCodeOpen}
              setIsCodeOpen={setIsCodeOpen}
              isSeedEnabled={isSeedEnabled}
              setIsSeedEnabled={setIsSeedEnabled}
              seed={seed}
              setSeed={setSeed}
              userCode={userCode}
              handleRunCode={handleRunCode}
            />
          </div>
        </>
      ) : (
        <>
          {gameHeaderPlusCanvas}
          <GameAllControls
            gameState={gameState}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            handleStartGame={handleStartGame}
            endGame={endGame}
            isCodeOpen={isCodeOpen}
            setIsCodeOpen={setIsCodeOpen}
            isSeedEnabled={isSeedEnabled}
            setIsSeedEnabled={setIsSeedEnabled}
            seed={seed}
            setSeed={setSeed}
            userCode={userCode}
            handleRunCode={handleRunCode}
          />
        </>
      )}
    </div>
  );
};
