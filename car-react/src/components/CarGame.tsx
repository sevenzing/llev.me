import React, { useEffect, useState, useRef } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameCanvas } from './GameCanvas';
import { GameHeader } from './GameHeader';
import { GameControls } from './GameControls';
import { CANVAS_CONFIG, DEFAULT_EDITOR_CONTENT, DEFAULT_EDITOR_FILE_NAME } from '../constants/gameConstants';
import styles from '../styles/Game.module.css';
import MonacoEditor from '@monaco-editor/react';

const MIN_GAME_WIDTH = 450;
const MIN_CODE_WIDTH = 450;
const DEFAULT_GAME_WIDTH = 600;

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

  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [userCode, setUserCode] = useState(DEFAULT_EDITOR_CONTENT);
  const [gamePaneWidth, setGamePaneWidth] = useState(DEFAULT_GAME_WIDTH);
  const dragging = useRef(false);

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
    const handleMouseUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isCodeOpen]);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
  };

  return (
    <div className={isCodeOpen ? styles.splitContainer : styles.carGame}>
      {isCodeOpen ? (
        <>
          <div
            className={styles.leftPane}
            style={{ width: gamePaneWidth, minWidth: MIN_GAME_WIDTH, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
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
              onCodeItClick={() => setIsCodeOpen((open) => !open)}
              isCodeOpen={isCodeOpen}
            />
          </div>
          <div
            className={styles.resizer}
            onMouseDown={startDrag}
            style={{ height: '100vh' }}
          />
          <div
            className={styles.rightPane}
            style={{ minWidth: MIN_CODE_WIDTH }}
          >
            <div className={styles.codeTabHeader}>{DEFAULT_EDITOR_FILE_NAME}</div>
            <MonacoEditor
              height="350px"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={userCode}
              onChange={value => setUserCode(value ?? '')}
              options={{
                fontSize: 16,
                minimap: { enabled: false },
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
            <button className={styles.runCodeButton}>Run</button>
          </div>
        </>
      ) : (
        <div>
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
            onCodeItClick={() => setIsCodeOpen((open) => !open)}
            isCodeOpen={isCodeOpen}
          />
        </div>
      )}
    </div>
  );
}; 