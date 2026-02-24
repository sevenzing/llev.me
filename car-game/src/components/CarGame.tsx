import React, { useEffect, useState, useRef, useCallback } from "react";
import { useGameLogic } from "../hooks/useGameLogic";
import type { GameCompleteData } from "../hooks/useGameLogic";
import { GameCanvas } from "./GameCanvas";
import { GameHeader } from "./GameHeader";
import { GameAllControls } from "./GameAllControls";
import { Leaderboard } from "./Leaderboard";
import {
  CANVAS_CONFIG,
  DEFAULT_EDITOR_FILE_NAME,
  USER_CODE_CONFIG,
} from "../constants/gameConstants";
import { loadUserCode, saveUserCode, shouldUpdateToNewVersion, getInitialCode, getSuperAICode } from "../utils/codePersistence";
import {
  loadLeaderboard,
  saveLeaderboard,
  clearLeaderboard,
} from "../utils/leaderboardPersistence";
import type { LeaderboardEntry } from "../utils/leaderboardPersistence";
import { generateName } from "../utils/nameGenerator";
import { getURLState, updateURLState } from "../utils/urlState";
import styles from "../styles/Game.module.css";
import { errorToast } from "./ErrorToast";
import { CustomTooltip } from "./CustomTooltip";
import { CodeEditor } from "./CodeEditor";
import { PerformanceIndicator } from "./PerformanceIndicator";

const MIN_GAME_WIDTH = 450;
const MIN_CODE_WIDTH = 530;
const DEFAULT_GAME_WIDTH = 600;
const LEADERBOARD_HIDDEN_KEY = "car-game:leaderboard:hidden";

export const CarGame: React.FC = () => {
  // Initialize from URL state
  const initialURLState = getURLState();

  // Add seed state and checkbox state
  const [seed, setSeed] = useState<number>(initialURLState.seed || 0);
  const [isSeedEnabled, setIsSeedEnabled] = useState<boolean>(initialURLState.seed !== null);
  const [isCodeOpen, setIsCodeOpen] = useState(initialURLState.codeOpen || false);
  const [userCode, setUserCode] = useState(getInitialCode());
  const [isInitialCode, setIsInitialCode] = useState(true);
  const [gamePaneWidth, setGamePaneWidth] = useState(DEFAULT_GAME_WIDTH);
  const dragging = useRef(false);
  const [isAutoModeEnabled, setIsAutoModeEnabled] = useState(false);
  const autoRestartTimeoutRef = useRef<number | null>(null);

  // Leaderboard state
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>(() => loadLeaderboard());
  const [leaderboardSortBy, setLeaderboardSortBy] = useState<"meters" | "coins">("meters");
  const [isLeaderboardHidden, setIsLeaderboardHidden] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LEADERBOARD_HIDDEN_KEY) === "true";
    } catch {
      return false;
    }
  });

  const handleGameComplete = useCallback((data: GameCompleteData) => {
    const entry: LeaderboardEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: generateName(),
      difficulty: data.difficulty,
      meters: data.meters,
      coins: data.coins,
      mode: data.mode,
      createdAt: Date.now(),
    };
    setLeaderboardEntries((prev) => {
      const updated = [...prev, entry];
      saveLeaderboard(updated);
      return updated;
    });
  }, []);

  const handleLeaderboardRename = useCallback((id: string, newName: string) => {
    setLeaderboardEntries((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, name: newName } : e));
      saveLeaderboard(updated);
      return updated;
    });
  }, []);

  const handleLeaderboardDelete = useCallback((id: string) => {
    setLeaderboardEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveLeaderboard(updated);
      return updated;
    });
  }, []);

  const handleLeaderboardClear = useCallback(() => {
    clearLeaderboard();
    setLeaderboardEntries([]);
  }, []);

  const handleToggleLeaderboardHidden = useCallback(() => {
    setIsLeaderboardHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(LEADERBOARD_HIDDEN_KEY, String(next));
      } catch { }
      return next;
    });
  }, []);

  const [secretClickCount, setSecretClickCount] = useState(0);
  const [lastSecretClickTime, setLastSecretClickTime] = useState(0);
  const SECRET_CLICK_TIMEOUT = 500; // 500ms between clicks
  const SECRET_CLICKS_NEEDED = 10;

  // Load saved code on component mount
  useEffect(() => {
    const savedData = loadUserCode();

    if (savedData) {
      // Check if we need to update to a new version
      if (savedData.isInitial && shouldUpdateToNewVersion(savedData.version)) {
        // Update to new initial code
        const newInitialCode = getInitialCode();
        setUserCode(newInitialCode);
        setIsInitialCode(true);
        saveUserCode({ code: newInitialCode, isInitial: true });
      } else {
        // Load saved code
        setUserCode(savedData.code);
        setIsInitialCode(savedData.isInitial);
      }
    } else {
      // First time loading - save initial code
      saveUserCode({ code: getInitialCode(), isInitial: true });
    }
  }, []);

  // Save code changes to localStorage
  const handleCodeChange = (value: string | undefined) => {
    const newCode = value ?? "";
    setUserCode(newCode);

    // Check if this is still the initial code
    const isStillInitial = newCode === getInitialCode();
    setIsInitialCode(isStillInitial);

    // Save to localStorage
    saveUserCode({ code: newCode, isInitial: isStillInitial });
  };

  // Reset code to initial
  const handleResetCode = () => {
    const confirmed = window.confirm("Are you sure? This will reset your code to the initial version and you'll lose any changes.");
    if (confirmed) {
      const initialCode = getInitialCode();
      setUserCode(initialCode);
      setIsInitialCode(true);
      saveUserCode({ code: initialCode, isInitial: true });
    }
  };

  // Handle code section toggle with URL state update
  const handleCodeSectionToggle = (open: boolean | ((open: boolean) => boolean)) => {
    const newState = typeof open === 'function' ? open(isCodeOpen) : open;
    setIsCodeOpen(newState);
    updateURLState({ codeOpen: newState });
  };

  // Handle seed enabled toggle with URL state update
  const handleSeedEnabledToggle = (enabled: boolean) => {
    setIsSeedEnabled(enabled);
    updateURLState({ seed: enabled ? seed : null });
  };

  // Handle seed value change with URL state update
  const handleSeedChange = (newSeed: number) => {
    setSeed(newSeed);
    if (isSeedEnabled) {
      updateURLState({ seed: newSeed });
    }
  };

  // Handle secret click
  const handleSecretClick = () => {
    const now = Date.now();

    // Reset count if too much time has passed
    if (now - lastSecretClickTime > SECRET_CLICK_TIMEOUT) {
      setSecretClickCount(1);
      setLastSecretClickTime(now);
      return;
    }

    const newCount = secretClickCount + 1;
    setSecretClickCount(newCount);
    setLastSecretClickTime(now);

    // Check if secret is unlocked
    if (newCount >= SECRET_CLICKS_NEEDED) {
      // Only activate if current code is initial
      if (isInitialCode) {
        setUserCode(getSuperAICode());
        setIsInitialCode(false);
        saveUserCode({ code: getSuperAICode(), isInitial: false });

        // Show secret unlocked message
        setTimeout(() => {
          alert("🎉 SECRET UNLOCKED! 🎉\n\nYou've discovered the Super AI code!\nThis advanced AI will help you achieve incredible scores.\n\nTry running it now!");
        }, 100);
      }

      // Reset secret count
      setSecretClickCount(0);
    }
  };

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
  } = useGameLogic(seed, userCode, handleGameComplete);

  useEffect(() => {
    // If auto mode is enabled and game is not running, start after delay
    if (isAutoModeEnabled && !gameState.isRunning && userCode.trim()) {
      autoRestartTimeoutRef.current = window.setTimeout(() => {
        if (!isSeedEnabled) {
          setSeed(Math.floor(Math.random() * (2 ** 32 - 2 ** 31) + 2 ** 31));
        }
        startGame(true);
      }, USER_CODE_CONFIG.autoRestartDelay || 2000);
    }

    return () => {
      if (autoRestartTimeoutRef.current !== null) {
        window.clearTimeout(autoRestartTimeoutRef.current);
        autoRestartTimeoutRef.current = null;
      }
    };
  }, [gameState.isRunning, isAutoModeEnabled, isSeedEnabled, startGame, userCode]);

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

    if (isAutoModeEnabled) {
      setIsAutoModeEnabled(false);
      if (autoRestartTimeoutRef.current !== null) {
        clearTimeout(autoRestartTimeoutRef.current);
        autoRestartTimeoutRef.current = null;
      }
    } else {
      setIsAutoModeEnabled(true);
      if (!isSeedEnabled) {
        setSeed(Math.floor(Math.random() * (2 ** 32 - 2 ** 31) + 2 ** 31));
      }
      if (!gameState.isRunning) {
        startGame(true); // true = auto mode
      }
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
        <PerformanceIndicator gameState={gameState} />
      </div>
    </>
  );

  // Show toast when codeError changes
  React.useEffect(() => {
    if (codeError) {
      errorToast("Runtime error", codeError);
    }
  }, [codeError]);

  // Apply Twitch stream styles
  useEffect(() => {
    if (initialURLState.background === 'transparent') {
      document.body.style.backgroundColor = 'transparent';
      document.documentElement.style.backgroundColor = 'transparent';
      // Add a global class for more complex overrides
      document.body.classList.add('twitch-stream-mode');

      // Inject transparency styles
      const style = document.createElement('style');
      style.id = 'twitch-transparency-styles';
      style.innerHTML = `
        html, body, #root, .App,
        .${styles.carGame}, .${styles.splitContainer}, .${styles.leftPane} {
          background-color: transparent !important;
          background: transparent !important;
        }
        canvas {
          background-color: var(--road-color) !important;
        }
        :root {
          --panel-bg: transparent !important;
          --panel-bg-header: rgba(0, 0, 0, 0.15) !important;
          --panel-bg-row-hover: rgba(255, 255, 255, 0.05) !important;
          --panel-border: rgba(255, 255, 255, 0.1) !important;
        }
      `;
      document.head.appendChild(style);
    }

    if (initialURLState.mainColor || initialURLState.roadColor) {
      const color = initialURLState.mainColor;
      const roadColor = initialURLState.roadColor;

      // Calculate a darker version for hover (simple darkening)
      let darker = color;
      if (color && color.startsWith('#') && (color.length === 7 || color.length === 4)) {
        const r = parseInt(color.length === 7 ? color.slice(1, 3) : color[1] + color[1], 16);
        const g = parseInt(color.length === 7 ? color.slice(3, 5) : color[2] + color[2], 16);
        const b = parseInt(color.length === 7 ? color.slice(5, 7) : color[3] + color[3], 16);
        darker = `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`;
      }

      const colorStyle = document.createElement('style');
      colorStyle.id = 'twitch-color-styles';
      let styleContent = ':root {';
      if (color) {
        styleContent += `
          --primary-color: ${color} !important;
          --primary-color-hover: ${darker} !important;
          --primary: ${color} !important;
          --primary-foreground: #ffffff !important;
        `;
      }
      if (roadColor) {
        styleContent += `
          --road-color: ${roadColor} !important;
        `;
      }
      styleContent += '}';
      colorStyle.innerHTML = styleContent;
      document.head.appendChild(colorStyle);
    }

    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
      document.body.classList.remove('twitch-stream-mode');
      document.getElementById('twitch-transparency-styles')?.remove();
      document.getElementById('twitch-color-styles')?.remove();
    };
  }, [initialURLState.background, initialURLState.mainColor, initialURLState.roadColor]);

  const leaderboardPanel = (
    <Leaderboard
      entries={leaderboardEntries}
      onRename={handleLeaderboardRename}
      onDelete={handleLeaderboardDelete}
      onClear={handleLeaderboardClear}
      sortBy={leaderboardSortBy}
      onSortChange={setLeaderboardSortBy}
      hidden={isLeaderboardHidden}
      onToggleHidden={handleToggleLeaderboardHidden}
    />
  );

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
              <div className={styles.fileNameContainer}>
                <span>{DEFAULT_EDITOR_FILE_NAME}</span>
                <div
                  className={styles.secretAnimation}
                  onClick={handleSecretClick}
                  title="Just a cute animation... or is it? 🤔"
                >
                  <img
                    src="/notepad.gif"
                    alt="Notepad and pencil animation"
                  />
                </div>
              </div>
              <CustomTooltip
                content={"Reset code to initial version"}
                position="left"
                delay={0}
              >
                <button
                  className={styles.resetButton}
                  onClick={handleResetCode}
                  disabled={isInitialCode}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M3 21v-5h5" />
                  </svg>
                </button>
              </CustomTooltip>
            </div>
            <CodeEditor
              userCode={userCode}
              handleCodeChange={handleCodeChange}
              gameState={gameState}
            />


            <GameAllControls
              gameState={gameState}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              handleStartGame={handleStartGame}
              endGame={endGame}
              isCodeOpen={isCodeOpen}
              setIsCodeOpen={handleCodeSectionToggle}
              isSeedEnabled={isSeedEnabled}
              setIsSeedEnabled={handleSeedEnabledToggle}
              seed={seed}
              setSeed={handleSeedChange}
              userCode={userCode}
              handleRunCode={handleRunCode}
              isAutoModeEnabled={isAutoModeEnabled}
            />
          </div>
        </>
      ) : (
        <>
          {leaderboardPanel}
          {gameHeaderPlusCanvas}
          <GameAllControls
            gameState={gameState}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            handleStartGame={handleStartGame}
            endGame={endGame}
            isCodeOpen={isCodeOpen}
            setIsCodeOpen={handleCodeSectionToggle}
            isSeedEnabled={isSeedEnabled}
            setIsSeedEnabled={handleSeedEnabledToggle}
            seed={seed}
            setSeed={handleSeedChange}
            userCode={userCode}
            handleRunCode={handleRunCode}
            isAutoModeEnabled={isAutoModeEnabled}
          />
        </>
      )}
    </div>
  );
};
