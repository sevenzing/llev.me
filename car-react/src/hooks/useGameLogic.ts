import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, Difficulty, Obstacle, Bonus, BonusType } from '../types/game';
import { DIFFICULTY_SETTINGS, GAME_CONFIG, BONUSES_CONFIG, CAR_DIMENSIONS, CANVAS_CONFIG, OBSTACLE_CONFIG, FADE_OUT_DURATION, USER_CODE_CONFIG } from '../constants/gameConstants';
import { calculateLaneX, calculateLaneXForCar } from '../utils/cords';
import { createNegativeImage } from '../utils/image';
import { mulberry32 } from '../utils/random';
import { codeRunner, createGameContext } from '../utils/codeRunner';

const initialGameState: GameState = {
  currentLane: 2,
  targetX: calculateLaneXForCar(2),
  carX: calculateLaneXForCar(2),
  score: 0,
  publicScore: 0,
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
  activeBonuses: {},
  lastBonusUpdateTime: 0,
  bonusUpdateInterval: 500,
  nextObstacleSpawn: 100,
  nextBonusSpawn: 300,
};


export const useGameLogic = (seed?: number, userCode?: string) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');
  const [images, setImages] = useState<{ [key: string]: HTMLImageElement }>({});
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const randomRef = useRef<() => number>(() => Math.random());
  const gameStateRef = useRef(gameState);
  const userCodeFrameCounterRef = useRef<number>(0);
  const autoPlayLoopCounterRef = useRef<number>(0);

  const resetRandomGenerator = useCallback(() => {
    randomRef.current = mulberry32(seed ?? Date.now());
  }, [seed]);

  useEffect(() => {
    resetRandomGenerator();
  }, [resetRandomGenerator]);

  // Load images
  useEffect(() => {
    const imageSources: { [key: string]: string } = {
      playerCar: '/static/green_car.png',
      enemyCar: '/static/red_car.png',
      heart: '/static/heart.png',
      shield: '/static/shield.png',
      speedup: '/static/speedup.png',
      vortex: '/static/vortex.png',
    };

    const loadedImages: { [key: string]: HTMLImageElement } = {};
    const imageKeys = Object.keys(imageSources);
    let loadedCount = 0;

    const onImageLoad = (img: HTMLImageElement, key: string, isNegative = false) => {
      loadedImages[key] = img;
      loadedCount++;

      // If it's a primary bonus image, create its negative version
      if (!isNegative && BONUSES_CONFIG.isReverseBonusEnabled) {
        const bonusConfig = BONUSES_CONFIG.items[key as BonusType];
        if (bonusConfig) {
          createNegativeImage(img, bonusConfig.width, bonusConfig.height)
            .then(negativeImg => {
              onImageLoad(negativeImg, `${key}-negative`, true);
            });
        }
      }
      
      // Check if all images (including negatives) are loaded
      const totalImagesToLoad = imageKeys.length + (BONUSES_CONFIG.isReverseBonusEnabled ? 
        Object.values(BONUSES_CONFIG.items).length : 0);
      if (loadedCount === totalImagesToLoad) {
        setImages(loadedImages);
      }
    };

    imageKeys.forEach(key => {
      const img = new Image();
      img.src = imageSources[key];
      img.onload = () => onImageLoad(img, key);
    });
  }, []);

  const resetGameState = useCallback(() => {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    setGameState({
      ...initialGameState,
      gameSpeed: settings.speed,
      baseGameSpeed: settings.speed,
      obstacleFrequency: settings.obstacleFrequency,
      targetX: calculateLaneXForCar(2),
      carX: calculateLaneXForCar(2),
      nextObstacleSpawn: 100,
      nextBonusSpawn: 300,
    });
  }, [difficulty]);

  const createObstacles = useCallback((existingObstacles: Obstacle[]): Obstacle[] => {
    // Determine which lanes are "unsafe" to spawn in
    const unsafeLanes = new Set<number>();
    existingObstacles.forEach(obstacle => {
        // If an obstacle is too close to the top, mark its lane as unsafe
        if (obstacle.y < CAR_DIMENSIONS.height * 2.5) {
            unsafeLanes.add(obstacle.lane);
        }
    });

    // Filter for lanes that are safe to spawn in
    const availableLanes = Array.from({ length: GAME_CONFIG.laneCount }, (_, i) => i)
        .filter(lane => !unsafeLanes.has(lane));

    if (availableLanes.length === 0) {
        return []; // No safe lanes, so don't spawn any obstacles
    }

    const numberOfObstaclesToSpawn = (() => {
      const rand = randomRef.current();
      // Adjust spawn count based on how many lanes are free
      const maxSpawns = Math.min(availableLanes.length, 3);
      
      if (maxSpawns === 1) return 1;

      if (rand < 0.7) { 
        return 1;
      } else if (rand < 0.9) { 
        return Math.min(2, maxSpawns);
      } else { 
        return maxSpawns;
      }
    })();

    const newObstacles: Obstacle[] = [];
    
    for (let i = 0; i < numberOfObstaclesToSpawn; i++) {
        const laneIndex = Math.floor(randomRef.current() * availableLanes.length);
        const lane = availableLanes.splice(laneIndex, 1)[0]; // Remove to ensure unique lanes per batch
        
        const lastObstacleInLane = existingObstacles
            .filter(o => o.lane === lane)
            .sort((a, b) => b.y - a.y)[0];
        
        let maxSpeed = OBSTACLE_CONFIG.maxSpeed;
        if (lastObstacleInLane && lastObstacleInLane.y < CAR_DIMENSIONS.height * 2) {
            maxSpeed = lastObstacleInLane.movingSpeed;
        }
        
        const x = calculateLaneX(lane, CAR_DIMENSIONS.width);
        const speed = OBSTACLE_CONFIG.minSpeed + randomRef.current() * (maxSpeed - OBSTACLE_CONFIG.minSpeed);

        newObstacles.push({
            x,
            y: -CAR_DIMENSIONS.height,
            width: CAR_DIMENSIONS.width,
            height: CAR_DIMENSIONS.height,
            lane,
            movingSpeed: speed,
        });
    }

    return newObstacles;
  }, [randomRef]);

  const createBonus = useCallback((existingBonuses: Bonus[], activeBonuses: GameState['activeBonuses']): Bonus | null => {
    const types = Object.keys(BONUSES_CONFIG.items) as Array<BonusType>;
    const type = (types[Math.floor(randomRef.current() * types.length)]);
    const config = BONUSES_CONFIG.items[type];
    const isReversed = BONUSES_CONFIG.isReverseBonusEnabled && !!activeBonuses[type];
    const imageKey = isReversed ? `${type}-negative` : type;
    const image = images[imageKey];

    if (!image) {
      console.error(`No image found for bonus type: ${imageKey}`);
      return null;
    }

    const availableLanes = Array.from({ length: GAME_CONFIG.laneCount }, (_, i) => i);
    existingBonuses.forEach(existingBonus => {
        if (existingBonus.y < config.height * 2) { 
            const index = availableLanes.indexOf(existingBonus.lane);
            if (index > -1) {
                availableLanes.splice(index, 1);
            }
        }
    });

    if (availableLanes.length === 0) {
        return null;
    }

    const lane = availableLanes[Math.floor(randomRef.current() * availableLanes.length)];
    const x = calculateLaneX(lane, config.width);

    return {
      type,
      x,
      y: -config.height,
      width: config.width,
      height: config.height,
      config,
      image,
      lane,
      isReversed: isReversed || false,
    };
  }, [images, randomRef]);

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
      let newGameSpeed = prev.gameSpeed;

      if (bonus.isReversed) {
        // If a reversed bonus is collected, end the active bonus effect
        if (bonus.type === 'speedup') {
          newGameSpeed = prev.baseGameSpeed;
        }
        if (bonus.type === 'vortex') {
            // Spawn a new wave of obstacles
            const newObstacles = createObstacles(prev.obstacles);
            return {
                ...prev,
                bonuses: prev.bonuses.filter(b => b !== bonus),
                obstacles: [...prev.obstacles, ...newObstacles],
            };
        }
        delete newActiveBonuses[bonus.type];
      } else {
        // If a normal bonus is collected, activate it
        if (bonus.type === 'vortex') {
            const now = Date.now();
            const updatedObstacles = prev.obstacles.map(o => ({
                ...o,
                isFadingOut: true,
                fadeStartTime: now,
            }));
            return { ...prev, obstacles: updatedObstacles, bonuses: prev.bonuses.filter(b => b !== bonus) };
        }
        
        newActiveBonuses[bonus.type] = {
          type: bonus.type,
          endTime: Date.now() + bonus.config.duration,
        };
        if (bonus.type === 'speedup' && bonus.config.speedMultiplier) {
          newGameSpeed = prev.baseGameSpeed * bonus.config.speedMultiplier;
        }
      }
      
      return {
        ...prev,
        bonuses: prev.bonuses.filter(b => b !== bonus),
        activeBonuses: newActiveBonuses,
        gameSpeed: newGameSpeed,
      };
    });
  }, []);

  const updateActiveBonuses = useCallback(() => {
    setGameState(prev => {
      const now = Date.now();
      const newActiveBonuses = { ...prev.activeBonuses };
      let gameSpeedChanged = false;
      
      if (newActiveBonuses.speedup && now > newActiveBonuses.speedup.endTime) {
        delete newActiveBonuses.speedup;
        gameSpeedChanged = true;
      }
      if (newActiveBonuses.shield && now > newActiveBonuses.shield.endTime) {
        delete newActiveBonuses.shield;
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
        delete newActiveBonuses.shield;
        
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
        targetX: calculateLaneXForCar(lane),
      }));
    }
  }, [calculateLaneX]);

  const moveCarLeft = useCallback(() => {
    moveCarToLane(gameState.currentLane - 1);
  }, [gameState.currentLane, moveCarToLane]);

  const moveCarRight = useCallback(() => {
    moveCarToLane(gameState.currentLane + 1);
  }, [gameState.currentLane, moveCarToLane]);


  const executeUserCode = useCallback(() => {
    if (!userCode || !gameStateRef.current.isAutoPlay) return;
    console.log('Executing user code, loop counter:', autoPlayLoopCounterRef.current);
    autoPlayLoopCounterRef.current++;
    try {
      const clonedGameState = {...gameStateRef.current};
      const context = createGameContext(clonedGameState);
      
      // Execute code asynchronously
      codeRunner.executeCode(userCode, context).then(executionResult => {
        if (executionResult.timedOut) {
          console.warn(`User code execution timed out after ${executionResult.executionTime}ms`);
        }
        
        if (executionResult.moveDirection === 'left') {
          moveCarLeft();
        } else if (executionResult.moveDirection === 'right') {
          moveCarRight();
        }
      }).catch(error => {
        console.error('Error executing user code:', error);
      });
    } catch (error) {
      console.error('Error setting up user code execution:', error);
    }
  }, [userCode, moveCarLeft, moveCarRight]);

  const startGame = useCallback((isAutoPlay = false) => {
    // Reset the random generator to ensure deterministic behavior
    resetRandomGenerator();
    
    // Reset user code frame counter
    userCodeFrameCounterRef.current = 0;
    
    resetGameState();
    setGameState(prev => ({
      ...prev,
      isRunning: true,
      isAutoPlay,
    }));
    lastTimeRef.current = performance.now();
  }, [resetGameState, resetRandomGenerator]);

  const endGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isRunning: false,
      isAutoPlay: false,
      isVisible: true,
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
      const laneSegmentHeight = GAME_CONFIG.laneDashLength + GAME_CONFIG.laneDashGap;
      newState.roadLineOffset = (newState.roadLineOffset + newState.gameSpeed * newState.roadSpeedMultiplier) % laneSegmentHeight;
      
      // Update frame count
      newState.frameCount++;
      
      // Create obstacles
      if (newState.frameCount >= newState.nextObstacleSpawn) {
        const newObstacles = createObstacles(newState.obstacles);
        if (newObstacles && newObstacles.length > 0) {
          newState.obstacles = [...newState.obstacles, ...newObstacles];
        }
        const newFrequency = newState.obstacleFrequency + (randomRef.current() * 40 - 20);
        newState.nextObstacleSpawn = newState.frameCount + newFrequency;
      }
      
      // Create bonuses
      if (newState.frameCount >= newState.nextBonusSpawn) {
        const newBonus = createBonus(newState.bonuses, newState.activeBonuses);
        if (newBonus) {
          newState.bonuses = [...newState.bonuses, newBonus];
        }
        const newFrequency = BONUSES_CONFIG.spawnFrequency + (randomRef.current() * 100 - 50);
        newState.nextBonusSpawn = newState.frameCount + newFrequency;
      }
      
      // Update obstacles with consistent speed
      newState.obstacles = newState.obstacles
        .map(obstacle => ({ ...obstacle, y: obstacle.y + newState.gameSpeed * obstacle.movingSpeed }))
        // .filter(obstacle => obstacle.y < CANVAS_CONFIG.height)
        .filter(obstacle => {
            // Keep obstacles that are not fading or have not finished fading
            const isFadingOut = obstacle.isFadingOut && (Date.now() - (obstacle.fadeStartTime || 0)) >= FADE_OUT_DURATION;
            return !isFadingOut;
        });
      
      // Update bonuses with consistent speed
      newState.bonuses = newState.bonuses
        .map(bonus => ({ ...bonus, y: bonus.y + newState.gameSpeed * bonus.config.movingSpeed }))
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
      newState.score += newState.gameSpeed;
      newState.publicScore = newState.score / 100;
      
      // Update active bonuses
      updateActiveBonuses();
      
      // Update invincibility
      updateInvincibility();
      
      // Check game over
      if (newState.lives <= 0) {
        endGame();
        return newState;
      }
      
      gameStateRef.current = newState;
      return newState;
    });

     // Execute user code if in auto mode (outside of state update to prevent timing issues)
     if (userCode && gameStateRef.current.isAutoPlay) {
        // Only execute user code every N frames to reduce performance impact
        userCodeFrameCounterRef.current++;
        if (userCodeFrameCounterRef.current >= USER_CODE_CONFIG.executionFrequency) {
          userCodeFrameCounterRef.current = 0; // Reset counter
          executeUserCode();
        }
      }
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isRunning, createObstacles, createBonus, checkCollision, checkBonusCollision, collectBonus, handlePlayerHit, updateActiveBonuses, updateInvincibility, endGame, userCode, executeUserCode]);

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