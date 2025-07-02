const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const images = {
    playerCar: new Image(),
    enemyCar: new Image(),
    heart: new Image(),
    shield: new Image(),
    speedup: new Image(),
};

images.playerCar.src = "static/green_car.png";
images.enemyCar.src = "static/red_car.png";
images.heart.src = "static/heart.png";
images.shield.src = "static/shield.png";
images.speedup.src = "static/speedup.png";

const DIFFICULTY_SETTINGS = {
    easy: {
        speed: 2,
        obstacleFrequency: 150,
    },
    normal: {
        speed: 4,
        obstacleFrequency: 90,
    },
    hard: {
        speed: 7,
        obstacleFrequency: 40,
    },
    insane: {
        speed: 10,
        obstacleFrequency: 20,
    },
};

const DEFAULT_WIDTH = 40;

const CAR_DIMENSIONS = {
    width: DEFAULT_WIDTH,
    height: 70,
};



const BONUS_CONFIG = {
    types: {
        speedup: {
            duration: 20000, // 20 seconds
            speedMultiplier: 2, // 100% speed increase
            movingSpeed: 0.5,
            image: images.speedup,
            width: DEFAULT_WIDTH,
            height: DEFAULT_WIDTH,
            glow: {
                color: '#3399ff',
                size: 15,
            },
        },
        shield: {
            duration: 10000, // 10 seconds
            image: images.shield,
            width: DEFAULT_WIDTH,
            height: DEFAULT_WIDTH,
            movingSpeed: 0.5,
            glow: {
                color: '#ffcc00',
                size: 15,
            },
        }
    },
    spawnFrequency: 300, // Spawn bonus every 300 frames
};

const GAME_CONFIG = {
    laneCount: 5,
    laneWidth: canvas.width / 5,
    carY: canvas.height - CAR_DIMENSIONS.height - 10,
    maxLives: 3,
    invincibilityDuration: 1000, // 1 second in milliseconds
    blinkInterval: 100, // Blink every 100ms
};

const UI_ELEMENTS = {
    scoreDisplay: document.getElementById('scoreDisplay'),
    heartDisplay: document.getElementById('heartDisplay'),
    bonusDisplay: document.getElementById('bonusDisplay'),
    speedupBonus: document.getElementById('speedupBonus'),
    shieldBonus: document.getElementById('shieldBonus'),
    startButton: document.getElementById('startBtn'),
    stopButton: document.getElementById('stopBtn'),
    watchButton: document.getElementById('watchBtn'),
    difficultyInputs: document.querySelectorAll('input[name="difficulty"]'),
};

const gameState = {
    currentLane: 2,
    carX: 0,
    targetX: 0,
    score: 0,
    lives: GAME_CONFIG.maxLives,
    gameSpeed: 4,
    baseGameSpeed: 4,
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
    bonusUpdateInterval: 500, // Update bonus display every 500ms
};



function calculateLaneX(lane) {
    return lane * GAME_CONFIG.laneWidth + (GAME_CONFIG.laneWidth - CAR_DIMENSIONS.width) / 2;
}

function drawRoadLines() {
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 20]);
    
    for (let i = 1; i < GAME_CONFIG.laneCount; i++) {
        const x = i * GAME_CONFIG.laneWidth;
        ctx.beginPath();
        ctx.moveTo(x, -40 + gameState.roadLineOffset);
        ctx.lineTo(x, canvas.height + 40);
        ctx.stroke();
    }
    
    ctx.setLineDash([]);
}

function drawPlayerCar() {
    gameState.carX += (gameState.targetX - gameState.carX) * 0.2;
    
    if (gameState.isVisible) {
        ctx.drawImage(images.playerCar, gameState.carX, GAME_CONFIG.carY, CAR_DIMENSIONS.width, CAR_DIMENSIONS.height);
    }
}

function drawInitialScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRoadLines();
    drawPlayerCar();
}

function updateScoreDisplay() {
    UI_ELEMENTS.scoreDisplay.textContent = `Score: ${gameState.score}`;
}

function updateHeartDisplay() {
    const heartIcons = UI_ELEMENTS.heartDisplay.querySelectorAll('.heart-icon');
    
    heartIcons.forEach((heart, index) => {
        if (index < gameState.lives) {
            heart.classList.remove('empty');
        } else {
            heart.classList.add('empty');
        }
    });
}

function updateBonusDisplay() {
    // Update speedup bonus
    const speedupBonus = gameState.activeBonuses.speedup;
    if (speedupBonus) {
        const remainingTime = Math.max(0, Math.ceil((speedupBonus.endTime - Date.now()) / 1000));
        UI_ELEMENTS.speedupBonus.querySelector('.bonus-time').textContent = `${remainingTime}s`;
        UI_ELEMENTS.speedupBonus.classList.remove('hidden');
    } else {
        UI_ELEMENTS.speedupBonus.classList.add('hidden');
    }
    
    // Update shield bonus
    const shieldBonus = gameState.activeBonuses.shield;
    if (shieldBonus) {
        const remainingTime = Math.max(0, Math.ceil((shieldBonus.endTime - Date.now()) / 1000));
        UI_ELEMENTS.shieldBonus.querySelector('.bonus-time').textContent = `${remainingTime}s`;
        UI_ELEMENTS.shieldBonus.classList.remove('hidden');
    } else {
        UI_ELEMENTS.shieldBonus.classList.add('hidden');
    }
}

function animateHeartLoss() {
    const heartIcons = UI_ELEMENTS.heartDisplay.querySelectorAll('.heart-icon');
    const lostHeartIndex = gameState.lives; // The heart that was just lost
    
    if (lostHeartIndex < heartIcons.length) {
        const lostHeart = heartIcons[lostHeartIndex];
        lostHeart.classList.add('lost');
        
        setTimeout(() => {
            lostHeart.classList.remove('lost');
        }, 500);
    }
}

function createBonus() {
    const bonusTypes = Object.keys(BONUS_CONFIG.types);
    const randomType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
    const randomLane = Math.floor(Math.random() * GAME_CONFIG.laneCount);
    const config = BONUS_CONFIG.types[randomType];

    const bonus = {
        type: randomType,
        lane: randomLane,
        movingSpeed: config.movingSpeed,
    };

    if (config.image) {
        bonus.width = config.width;
        bonus.height = config.height;
    } else {
        bonus.width = config.radius * 2;
        bonus.height = config.radius * 2;
    }

    bonus.x = calculateLaneX(randomLane);
    bonus.y = -bonus.height;
    
    gameState.bonuses.push(bonus);
}

function updateBonuses() {
    gameState.bonuses.forEach(bonus => {
        bonus.y += gameState.gameSpeed * bonus.movingSpeed;
    });
    
    gameState.bonuses = gameState.bonuses.filter(bonus => bonus.y < canvas.height);
    
    if (gameState.frameCount % BONUS_CONFIG.spawnFrequency === 0) {
        createBonus();
    }
}

function drawBonus(bonus, config, alpha = 1.0) {
    ctx.globalAlpha = alpha;
    
    if (config.image) {
        ctx.drawImage(config.image, bonus.x, bonus.y, bonus.width, bonus.height);
    } else if (config.color) {
        ctx.fillStyle = config.color;
        ctx.beginPath();
        const radius = bonus.width / 2;
        ctx.arc(bonus.x + radius, bonus.y + radius, radius, 0, 2 * Math.PI);
        ctx.fill();
    } else {
        console.log('Cannot draw bonus:', bonus);
    }
    
    ctx.globalAlpha = 1.0;
}

function drawBonuses() {
    gameState.bonuses.forEach(bonus => {
        const config = BONUS_CONFIG.types[bonus.type];
        if (config.glow) {
            ctx.shadowColor = config.glow.color;
            ctx.shadowBlur = config.glow.size;
        }
        drawBonus(bonus, config);
        if (config.glow) {
            ctx.shadowBlur = 0;
        }
    });
}

function checkBonusCollision(car, bonus) {
    // AABB collision detection
    return car.x < bonus.x + bonus.width &&
           car.x + car.width > bonus.x &&
           car.y < bonus.y + bonus.height &&
           car.y + car.height > bonus.y;
}

function collectBonus(bonus) {
    const bonusType = bonus.type;
    const bonusConfig = BONUS_CONFIG.types[bonusType];
    
    // Remove the bonus from the game
    gameState.bonuses = gameState.bonuses.filter(b => b !== bonus);
    
    // Apply bonus effect
    if (bonusType === 'speedup') {
        gameState.activeBonuses.speedup = {
            endTime: Date.now() + bonusConfig.duration,
            speedMultiplier: bonusConfig.speedMultiplier,
        };
        gameState.gameSpeed = gameState.baseGameSpeed * bonusConfig.speedMultiplier;
    } else if (bonusType === 'shield') {
        gameState.activeBonuses.shield = {
            endTime: Date.now() + bonusConfig.duration,
        };
    } else {
        console.log('Unknown bonus type:', bonusType);
    }
    
    // Immediately update bonus display when bonus is collected
    updateBonusDisplay();
}

function updateActiveBonuses() {
    const currentTime = Date.now();
    
    Object.keys(gameState.activeBonuses).forEach(bonusType => {
        const bonus = gameState.activeBonuses[bonusType];
        if (bonus && currentTime >= bonus.endTime) {
            // Bonus expired
            if (bonusType === 'speedup') {
                gameState.gameSpeed = gameState.baseGameSpeed;
            }
            gameState.activeBonuses[bonusType] = null;
        }
    });
}

function createObstacle() {
    const randomLane = Math.floor(Math.random() * GAME_CONFIG.laneCount);
    const obstacle = {
        lane: randomLane,
        x: calculateLaneX(randomLane),
        y: -CAR_DIMENSIONS.height,
        height: CAR_DIMENSIONS.height,
        width: CAR_DIMENSIONS.width,
    };
    gameState.obstacles.push(obstacle);
}

function updateObstacles() {
    gameState.obstacles.forEach(obstacle => {
        obstacle.y += gameState.gameSpeed;
    });
    
    gameState.obstacles = gameState.obstacles.filter(obstacle => obstacle.y < canvas.height);
    
    if (++gameState.frameCount % gameState.obstacleFrequency === 0) {
        createObstacle();
    }
}

function drawObstacles() {
    gameState.obstacles.forEach(obstacle => {
        ctx.drawImage(images.enemyCar, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function checkCollision(car, obstacle) {
    return car.x < obstacle.x + obstacle.width &&
           car.x + car.width > obstacle.x &&
           car.y < obstacle.y + obstacle.height &&
           car.y + car.height > obstacle.y;
}

function getPlayerCarBounds() {
    return {
        x: gameState.carX,
        y: GAME_CONFIG.carY,
        width: CAR_DIMENSIONS.width,
        height: CAR_DIMENSIONS.height,
    };
}

function updateInvincibility() {
    if (gameState.isInvincible) {
        const currentTime = Date.now();
        const timeSinceInvincibilityStart = currentTime - gameState.invincibilityStartTime;
        
        if (timeSinceInvincibilityStart >= GAME_CONFIG.invincibilityDuration) {
            gameState.isInvincible = false;
            gameState.isVisible = true;
        } else {
            if (currentTime - gameState.lastBlinkTime >= GAME_CONFIG.blinkInterval) {
                gameState.isVisible = !gameState.isVisible;
                gameState.lastBlinkTime = currentTime;
            }
        }
    }
}

function handlePlayerHit() {
    // Check if shield is active
    if (gameState.activeBonuses.shield) {
        // Use shield instead of losing life
        gameState.activeBonuses.shield = null;
    } else {
        gameState.lives--;
        animateHeartLoss();
    }
    
    gameState.isInvincible = true;
    gameState.invincibilityStartTime = Date.now();
    gameState.lastBlinkTime = Date.now();
    gameState.isVisible = false;
    
    updateScoreDisplay();
    updateHeartDisplay();
    
    if (gameState.lives <= 0) {
        endGame();
    }
}

function detectCollisions() {
    if (gameState.isInvincible) return false;
    
    const playerCar = getPlayerCarBounds();
    
    // Check bonus collisions
    gameState.bonuses.forEach(bonus => {
        if (checkBonusCollision(playerCar, bonus)) {
            collectBonus(bonus);
        }
    });
    
    // Check obstacle collisions
    for (let obstacle of gameState.obstacles) {
        if (checkCollision(playerCar, obstacle)) {
            handlePlayerHit();
            return true;
        }
    }
    return false;
}

function getUpcomingObstacles() {
    const detectionThreshold = 120;
    const playerCar = getPlayerCarBounds();
    
    return gameState.obstacles.filter(obstacle => {
        const extendedObstacle = {
            ...obstacle,
            height: obstacle.height + detectionThreshold,
        };
        
        const testCar = {
            x: calculateLaneX(obstacle.lane),
            y: GAME_CONFIG.carY,
            width: CAR_DIMENSIONS.width,
            height: CAR_DIMENSIONS.height,
        };
        
        return checkCollision(testCar, extendedObstacle);
    });
}

function isLaneSafe(lane) {
    const upcomingObstacles = getUpcomingObstacles();
    return !upcomingObstacles.some(obstacle => obstacle.lane === lane);
}

function moveCarToLane(lane) {
    gameState.currentLane = lane;
    gameState.targetX = calculateLaneX(lane);
}

function getAdjacentLanes() {
    const adjacentLanes = [];
    
    if (gameState.currentLane > 0) {
        adjacentLanes.push(gameState.currentLane - 1);
    }
    if (gameState.currentLane < GAME_CONFIG.laneCount - 1) {
        adjacentLanes.push(gameState.currentLane + 1);
    }
    
    return adjacentLanes;
}

function findSafestLane() {
    const upcomingObstacles = getUpcomingObstacles();
    const adjacentLanes = getAdjacentLanes();
    
    const safeAdjacentLanes = adjacentLanes.filter(lane => 
        !upcomingObstacles.some(obstacle => obstacle.lane === lane)
    );
    
    if (safeAdjacentLanes.length > 0) {
        const centerLane = Math.floor(GAME_CONFIG.laneCount / 2);
        safeAdjacentLanes.sort((a, b) => Math.abs(a - centerLane) - Math.abs(b - centerLane));
        return safeAdjacentLanes[0];
    }
    
    const laneSafetyScores = [];
    
    for (const lane of adjacentLanes) {
        const obstaclesInLane = upcomingObstacles.filter(obstacle => obstacle.lane === lane);
        
        if (obstaclesInLane.length === 0) {
            laneSafetyScores.push({ lane, score: Infinity });
        } else {
            const closestObstacle = obstaclesInLane.reduce((closest, obstacle) => 
                obstacle.y < closest.y ? obstacle : closest
            );
            const safetyScore = canvas.height - closestObstacle.y;
            laneSafetyScores.push({ lane, score: safetyScore });
        }
    }
    
    const currentLaneObstacles = upcomingObstacles.filter(obstacle => obstacle.lane === gameState.currentLane);
    if (currentLaneObstacles.length > 0) {
        const closestObstacle = currentLaneObstacles.reduce((closest, obstacle) => 
            obstacle.y < closest.y ? obstacle : closest
        );
        const safetyScore = canvas.height - closestObstacle.y;
        laneSafetyScores.push({ lane: gameState.currentLane, score: safetyScore });
    }
    
    laneSafetyScores.sort((a, b) => b.score - a.score);
    return laneSafetyScores[0].lane;
}

function executeBotMovement() {
    const upcomingObstacles = getUpcomingObstacles();
    
    if (!upcomingObstacles.some(obstacle => obstacle.lane === gameState.currentLane)) {
        if (gameState.currentLane === 0) {
            const targetLane = gameState.currentLane + 1;
            if (isLaneSafe(targetLane)) {
                moveCarToLane(targetLane);
                return;
            }
        } else if (gameState.currentLane === GAME_CONFIG.laneCount - 1) {
            const targetLane = gameState.currentLane - 1;
            if (isLaneSafe(targetLane)) {
                moveCarToLane(targetLane);
                return;
            }
        }
        return;
    }
    
    const safestLane = findSafestLane();
    if (safestLane !== gameState.currentLane) {
        moveCarToLane(safestLane);
    }
}

function runGameLoop() {
    if (!gameState.isRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameState.roadLineOffset = (gameState.roadLineOffset + gameState.gameSpeed / 2) % 35;
    
    drawRoadLines();
    drawPlayerCar();
    updateBonuses();
    drawBonuses();
    updateObstacles();
    drawObstacles();
    
    updateInvincibility();
    updateActiveBonuses();
    detectCollisions();
    
    gameState.score++;
    updateScoreDisplay();
    
    // Update bonus display every 500ms instead of every frame
    const currentTime = Date.now();
    if (currentTime - gameState.lastBonusUpdateTime >= gameState.bonusUpdateInterval) {
        updateBonusDisplay();
        gameState.lastBonusUpdateTime = currentTime;
    }
    
    if (gameState.isAutoPlay) {
        executeBotMovement();
    }
    
    requestAnimationFrame(runGameLoop);
}

function disableControls() {
    UI_ELEMENTS.startButton.disabled = true;
    UI_ELEMENTS.watchButton.disabled = true;
    UI_ELEMENTS.stopButton.disabled = false;
    
    UI_ELEMENTS.difficultyInputs.forEach(input => {
        input.disabled = true;
    });
}

function enableControls() {
    UI_ELEMENTS.startButton.disabled = false;
    UI_ELEMENTS.watchButton.disabled = false;
    UI_ELEMENTS.stopButton.disabled = true;
    
    UI_ELEMENTS.difficultyInputs.forEach(input => {
        input.disabled = false;
    });
}

function resetGameState() {
    gameState.score = 0;
    gameState.lives = GAME_CONFIG.maxLives;
    gameState.frameCount = 0;
    gameState.obstacles = [];
    gameState.bonuses = [];
    gameState.roadLineOffset = 0;
    gameState.currentLane = 2;
    gameState.carX = calculateLaneX(2);
    gameState.targetX = gameState.carX;
    gameState.isInvincible = false;
    gameState.isVisible = true;
    gameState.activeBonuses = {
        speedup: null,
        shield: null,
    };
    gameState.lastBonusUpdateTime = 0;
}

function getSelectedDifficulty() {
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
    
    if (!DIFFICULTY_SETTINGS[selectedDifficulty]) {
        alert("Invalid difficulty level");
        return null;
    }
    
    return selectedDifficulty;
}

function startGame(isAutoPlay = false) {
    const difficulty = getSelectedDifficulty();
    if (!difficulty) return;
    
    gameState.isRunning = true;
    gameState.isAutoPlay = isAutoPlay;
    
    const settings = DIFFICULTY_SETTINGS[difficulty];
    gameState.baseGameSpeed = settings.speed;
    gameState.gameSpeed = settings.speed;
    gameState.obstacleFrequency = settings.obstacleFrequency;
    
    resetGameState();
    updateScoreDisplay();
    updateHeartDisplay();
    updateBonusDisplay();
    disableControls();
    runGameLoop();
}

function endGame() {
    gameState.isRunning = false;    
    enableControls();
    updateBonusDisplay();
}

function moveCarLeft() {
    if (!gameState.isAutoPlay) {
        const newLane = Math.max(0, gameState.currentLane - 1);
        moveCarToLane(newLane);
    }
}

function moveCarRight() {
    if (!gameState.isAutoPlay) {
        const newLane = Math.min(GAME_CONFIG.laneCount - 1, gameState.currentLane + 1);
        moveCarToLane(newLane);
    }
}

function handleCanvasClick(event) {
    if (gameState.isAutoPlay) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const carCenterX = gameState.carX + CAR_DIMENSIONS.width / 2;
    
    if (clickX < carCenterX) {
        moveCarLeft();
    } else {
        moveCarRight();
    }
}

let touchStartX = null;

function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].clientX;
}

function handleTouchEnd(event) {
    if (gameState.isAutoPlay || touchStartX === null) return;
    
    const touchEndX = event.changedTouches[0].clientX;
    const touchDelta = touchEndX - touchStartX;
    const minSwipeDistance = 30;
    
    if (Math.abs(touchDelta) > minSwipeDistance) {
        if (touchDelta < 0) {
            moveCarLeft();
        } else {
            moveCarRight();
        }
    }
    
    touchStartX = null;
}

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') moveCarLeft();
    if (event.key === 'ArrowRight') moveCarRight();
});

canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchend', handleTouchEnd);

UI_ELEMENTS.startButton.addEventListener('click', () => startGame(false));
UI_ELEMENTS.watchButton.addEventListener('click', () => startGame(true));
UI_ELEMENTS.stopButton.addEventListener('click', endGame);

addEventListener('load', () => {
    init();
});

function init() {
    resetGameState();
    updateHeartDisplay();
    updateBonusDisplay();
    drawInitialScreen();
}