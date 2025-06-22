import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, Difficulty, Obstacle, Bonus, ActiveBonus } from '../types/game';
import { DIFFICULTY_SETTINGS, GAME_CONFIG, BONUS_CONFIG, BONUS_SPAWN_FREQUENCY, CAR_DIMENSIONS, DEFAULT_WIDTH, CANVAS_CONFIG } from '../constants/gameConstants';
import { calculateLaneX } from '../utils/cords';

const initialGameState: GameState = {
  currentLane: 2,
  targetX: calculateLaneX(2),
  carX: calculateLaneX(2),
  score: 0,
  lives: GAME_CONFIG.maxLives,
  gameSpeed: 4,
  baseGameSpeed: 4,
  roadSpeedMultiplier: 0.5,
  isRunning: false,
  isAutoPlay: false,
  obstacles: [],
  bonuses: [],
  frameCount: 0,
  roadLineOffset: 0,
  obstacleFrequency: 90,
  isInvincible: false,
  invincibilityStartTime: 0,
  lastBlinkTime: 0,
  isVisible: true,
  activeBonuses: {
    speedup: null,
    shield: null,
  },
  lastBonusUpdateTime: 0,
  bonusUpdateInterval: 500,
};


export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');
  const [images, setImages] = useState<{ [key: string]: HTMLImageElement }>({});
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  // Load images
  useEffect(() => {
    const imageSources: { [key: string]: string } = {
      playerCar: '/static/green_car.png',
      enemyCar: '/static/red_car.png',
      heart: '/static/heart.png',
      shield: '/static/shield.png',
      speedup: '/static/speedup.png',
    };

    const loadedImages: { [key: string]: HTMLImageElement } = {};
    const imageKeys = Object.keys(imageSources);
    let loadedCount = 0;

    imageKeys.forEach(key => {
      const img = new Image();
      img.src = imageSources[key];
      img.onload = () => {
        loadedImages[key] = img;
        loadedCount++;
        if (loadedCount === imageKeys.length) {
          setImages(loadedImages);
        }
      };
    });
  }, []);

  

  const resetGameState = useCallback(() => {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    setGameState({
      ...initialGameState,
      gameSpeed: settings.speed,
      baseGameSpeed: settings.speed,
      obstacleFrequency: settings.obstacleFrequency,
      targetX: calculateLaneX(2),
      carX: calculateLaneX(2),
    });
  }, [difficulty, calculateLaneX]);

  const createObstacle = useCallback(() => {
    const lane = Math.floor(Math.random() * GAME_CONFIG.laneCount);
    const x = calculateLaneX(lane);
    return {
      x,
      y: -CAR_DIMENSIONS.height,
      width: CAR_DIMENSIONS.width,
      height: CAR_DIMENSIONS.height,
      lane,
    };
  }, [calculateLaneX]);

  const createBonus = useCallback(() => {
    const types = Object.keys(BONUS_CONFIG) as Array<keyof typeof BONUS_CONFIG>;
    const type = (types[Math.floor(Math.random() * types.length)]);
    const lane = Math.floor(Math.random() * GAME_CONFIG.laneCount);
    const x = calculateLaneX(lane);
    
    return {
      type: type as 'speedup' | 'shield',
      x,
      y: -DEFAULT_WIDTH,
      width: DEFAULT_WIDTH,
      height: DEFAULT_WIDTH,
      config: BONUS_CONFIG[type],
    };
  }, [calculateLaneX]);

  const checkCollision = useCallback((car: { x: number; y: number; width: number; height: number }, obstacle: Obstacle) => {
    return (
      car.x < obstacle.x + obstacle.width &&
      car.x + car.width > obstacle.x &&
      car.y < obstacle.y + obstacle.height &&
      car.y + car.height > obstacle.y
    );
  }, []);

  const checkBonusCollision = useCallback((car: { x: number; y: number; width: number; height: number }, bonus: Bonus) => {
    return (
      car.x < bonus.x + bonus.width &&
      car.x + car.width > bonus.x &&
      car.y < bonus.y + bonus.height &&
      car.y + car.height > bonus.y
    );
  }, []);

  const collectBonus = useCallback((bonus: Bonus) => {
    setGameState(prev => {
      const newActiveBonuses = { ...prev.activeBonuses };
      newActiveBonuses[bonus.type] = {
        type: bonus.type,
        endTime: Date.now() + bonus.config.duration,
      };

      // Apply speedup effect immediately
      if (bonus.type === 'speedup' && bonus.config.speedMultiplier) {
        return {
          ...prev,
          bonuses: prev.bonuses.filter(b => b !== bonus),
          activeBonuses: newActiveBonuses,
          gameSpeed: prev.baseGameSpeed * bonus.config.speedMultiplier,
        };
      }

      return {
        ...prev,
        bonuses: prev.bonuses.filter(b => b !== bonus),
        activeBonuses: newActiveBonuses,
      };
    });
  }, []);

  const updateActiveBonuses = useCallback(() => {
    setGameState(prev => {
      const now = Date.now();
      const newActiveBonuses = { ...prev.activeBonuses };
      let gameSpeedChanged = false;
      
      if (newActiveBonuses.speedup && now > newActiveBonuses.speedup.endTime) {
        newActiveBonuses.speedup = null;
        gameSpeedChanged = true;
      }
      if (newActiveBonuses.shield && now > newActiveBonuses.shield.endTime) {
        newActiveBonuses.shield = null;
      }

      // Reset speed when speedup bonus expires
      if (gameSpeedChanged) {
        return {
          ...prev,
          activeBonuses: newActiveBonuses,
          gameSpeed: prev.baseGameSpeed,
        };
      }

      return {
        ...prev,
        activeBonuses: newActiveBonuses,
      };
    });
  }, []);

  const handlePlayerHit = useCallback(() => {
    setGameState(prev => {
      // Check if player is invincible
      if (prev.isInvincible) {
        return prev;
      }

      // Check if shield is active
      if (prev.activeBonuses.shield) {
        // Remove shield after one hit
        const newActiveBonuses = { ...prev.activeBonuses };
        newActiveBonuses.shield = null;
        
        return {
          ...prev,
          activeBonuses: newActiveBonuses,
          isInvincible: true,
          invincibilityStartTime: Date.now(),
        };
      }

      // Normal hit - lose life and become invincible
      return {
        ...prev,
        lives: prev.lives - 1,
        isInvincible: true,
        invincibilityStartTime: Date.now(),
      };
    });
  }, []);

  const updateInvincibility = useCallback(() => {
    setGameState(prev => {
      if (!prev.isInvincible) return prev;

      const now = Date.now();
      const timeSinceInvincibility = now - prev.invincibilityStartTime;
      
      if (timeSinceInvincibility >= GAME_CONFIG.invincibilityDuration) {
        return {
          ...prev,
          isInvincible: false,
          isVisible: true,
        };
      }

      // Blink effect
      if (now - prev.lastBlinkTime >= GAME_CONFIG.blinkInterval) {
        return {
          ...prev,
          isVisible: !prev.isVisible,
          lastBlinkTime: now,
        };
      }

      return prev;
    });
  }, []);

  const moveCarToLane = useCallback((lane: number) => {
    if (lane >= 0 && lane < GAME_CONFIG.laneCount) {
      setGameState(prev => ({
        ...prev,
        currentLane: lane,
        targetX: calculateLaneX(lane),
      }));
    }
  }, [calculateLaneX]);

  const moveCarLeft = useCallback(() => {
    moveCarToLane(gameState.currentLane - 1);
  }, [gameState.currentLane, moveCarToLane]);

  const moveCarRight = useCallback(() => {
    moveCarToLane(gameState.currentLane + 1);
  }, [gameState.currentLane, moveCarToLane]);

  const startGame = useCallback((isAutoPlay = false) => {
    resetGameState();
    setGameState(prev => ({
      ...prev,
      isRunning: true,
      isAutoPlay,
    }));
    lastTimeRef.current = performance.now();
  }, [resetGameState]);

  const endGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isRunning: false,
      isAutoPlay: false,
    }));
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const gameLoop = useCallback((currentTime: number) => {
    if (!gameState.isRunning) return;

    lastTimeRef.current = currentTime;

    setGameState(prev => {
      const newState = { ...prev };
      
      // Update car position
      newState.carX += (newState.targetX - newState.carX) * 0.2;
      
      // Update road line offset with smooth movement
      newState.roadLineOffset = (newState.roadLineOffset + newState.gameSpeed * newState.roadSpeedMultiplier) % 35;
      
      // Update frame count
      newState.frameCount++;
      
      // Create obstacles
      if (newState.frameCount % newState.obstacleFrequency === 0) {
        newState.obstacles.push(createObstacle());
      }
      
      // Create bonuses
      if (newState.frameCount % BONUS_SPAWN_FREQUENCY === 0) {
        newState.bonuses.push(createBonus());
      }
      
      // Update obstacles with consistent speed
      newState.obstacles = newState.obstacles
        .map(obstacle => ({ ...obstacle, y: obstacle.y + newState.gameSpeed }))
        .filter(obstacle => obstacle.y < CANVAS_CONFIG.height);
      
      // Update bonuses with consistent speed
      newState.bonuses = newState.bonuses
        .map(bonus => ({ ...bonus, y: bonus.y + bonus.config.movingSpeed }))
        .filter(bonus => bonus.y < CANVAS_CONFIG.height);
      
      // Check collisions
      const playerCar = {
        x: newState.carX,
        y: GAME_CONFIG.carY,
        width: CAR_DIMENSIONS.width,
        height: CAR_DIMENSIONS.height,
      };
      
      // Check obstacle collisions
      newState.obstacles.forEach(obstacle => {
        if (checkCollision(playerCar, obstacle)) {
          handlePlayerHit();
        }
      });
      
      // Check bonus collisions
      newState.bonuses.forEach(bonus => {
        if (checkBonusCollision(playerCar, bonus)) {
          collectBonus(bonus);
        }
      });
      
      // Update score
      newState.score++;
      
      // Update active bonuses
      updateActiveBonuses();
      
      // Update invincibility
      updateInvincibility();
      
      // Check game over
      if (newState.lives <= 0) {
        endGame();
        return newState;
      }
      
      return newState;
    });
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isRunning, createObstacle, createBonus, checkCollision, checkBonusCollision, collectBonus, handlePlayerHit, updateActiveBonuses, updateInvincibility, endGame]);

  useEffect(() => {
    if (gameState.isRunning) {
      gameLoop(performance.now());
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.isRunning, gameLoop]);

  useEffect(() => {
    setDifficulty(selectedDifficulty);
  }, [selectedDifficulty]);

  return {
    gameState,
    difficulty,
    selectedDifficulty,
    setSelectedDifficulty,
    moveCarLeft,
    moveCarRight,
    startGame,
    endGame,
    images,
  };
}; 