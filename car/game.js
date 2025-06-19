const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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

const CAR_DIMENSIONS = {
    width: 40,
    height: 70,
};

const GAME_CONFIG = {
    laneCount: 5,
    laneWidth: canvas.width / 5,
    carY: canvas.height - CAR_DIMENSIONS.height - 10,
};

const UI_ELEMENTS = {
    scoreDisplay: document.getElementById('scoreDisplay'),
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
    gameSpeed: 4,
    isRunning: false,
    isAutoPlay: false,
    obstacles: [],
    frameCount: 0,
    roadLineOffset: 0,
    obstacleFrequency: 90,
};

const images = {
    playerCar: new Image(),
    enemyCar: new Image(),
};

images.playerCar.src = "static/green_car.png";
images.enemyCar.src = "static/red_car.png";


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
    ctx.drawImage(images.playerCar, gameState.carX, GAME_CONFIG.carY, CAR_DIMENSIONS.width, CAR_DIMENSIONS.height);
}

function drawInitialScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRoadLines();
    drawPlayerCar();
}

function updateScoreDisplay() {
    UI_ELEMENTS.scoreDisplay.textContent = `Score: ${gameState.score}`;
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

function detectCollisions() {
    const playerCar = getPlayerCarBounds();
    
    for (let obstacle of gameState.obstacles) {
        if (checkCollision(playerCar, obstacle)) {
            endGame();
            alert(`💥 Crash! Score: ${gameState.score}`);
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
    updateObstacles();
    drawObstacles();
    
    if (detectCollisions()) return;
    
    gameState.score++;
    updateScoreDisplay();
    
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
    gameState.frameCount = 0;
    gameState.obstacles = [];
    gameState.roadLineOffset = 0;
    gameState.currentLane = 2;
    gameState.carX = calculateLaneX(2);
    gameState.targetX = gameState.carX;
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
    gameState.gameSpeed = settings.speed;
    gameState.obstacleFrequency = settings.obstacleFrequency;
    
    resetGameState();
    updateScoreDisplay();
    disableControls();
    runGameLoop();
}

function endGame() {
    gameState.isRunning = false;
    enableControls();
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
    drawInitialScreen();
}