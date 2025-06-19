const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


const difficultyConfig = {
    "easy": {
        "speed": 2,
        "obstacleFrequency": 150,
    },
    "normal": {
        "speed": 4,
        "obstacleFrequency": 90,
    },
    "hard": {
        "speed": 7,
        "obstacleFrequency": 40,
    },
    "insane": {
        "speed": 10,
        "obstacleFrequency": 20,
    },
}

const carWidth = 40, carHeight = 70, carY = canvas.height - carHeight - 10;
const laneCount = 5, laneWidth = canvas.width / laneCount;

let currentLane = 2, carX = getLaneX(currentLane), targetX = carX;
let score = 0, gameSpeed = 4, isRunning = false, isAutoPlay = false;
let obstacles = [], frameCount = 0, roadLineOffset = 0;
let obstacleFrequency = 90;

const scoreDisplay = document.getElementById('scoreDisplay');
const startBtn     = document.getElementById('startBtn');
const stopBtn      = document.getElementById('stopBtn');
const watchBtn     = document.getElementById('watchBtn');

// Get all difficulty radio buttons
const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');

const carImg    = new Image();
carImg.src      = "static/green_car.png";
const redCarImg = new Image();
redCarImg.src   = "static/red_car.png";

carImg.onload = drawInitialScreen;

function getLaneX(lane) {
  return lane * laneWidth + (laneWidth - carWidth) / 2;
}

function drawRoadLines() {
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 2;
  ctx.setLineDash([15,20]);
  for (let i = 1; i < laneCount; i++) {
    const x = i * laneWidth;
    ctx.beginPath();
    ctx.moveTo(x, -40 + roadLineOffset);
    ctx.lineTo(x, canvas.height + 40);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawCar() {
  carX += (targetX - carX) * 0.2;
  ctx.drawImage(carImg, carX, carY, carWidth, carHeight);
}

function drawInitialScreen() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawRoadLines();
  drawCar();
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
}

function spawnObstacle() {
  const lane = Math.floor(Math.random()*laneCount);
  obstacles.push({ lane, x: getLaneX(lane), y: -carHeight, height: carHeight, width: carWidth });
}

function updateObstacles() {
  obstacles.forEach(o => o.y += gameSpeed);
  obstacles = obstacles.filter(o => o.y < canvas.height);
  if (++frameCount % obstacleFrequency === 0) spawnObstacle();
}

function drawObstacles() {
  obstacles.forEach(o => ctx.drawImage(redCarImg, o.x, o.y, o.width, o.height));
}

function collides(car, obstacle) {
    return car.x < obstacle.x+obstacle.width && car.x+car.width>obstacle.x && car.y<obstacle.y+obstacle.height && car.y+car.height>obstacle.y;
}

function carObject() {
    return {
        x: carX,
        y: carY,
        width: carWidth,
        height: carHeight,
    };
}

function checkCollisions() {
  for (let obstacle of obstacles) {
    if (collides(carObject(), obstacle)) {
      endGame();
      alert(`💥 Crash! Score: ${score}`);
      return true;
    }
  }
  return false;
}

function getAllUpcoming() {
    const threshold = 120;
    const upcoming = obstacles.filter(obstacle => {
        const newObstacle = {
            ...obstacle,
            //y: obstacle.y + threshold / 2,
            height: obstacle.height + threshold,
            width: obstacle.width,
        };
        const x = getLaneX(obstacle.lane);
        const car = {
            x: x,
            y: carY,
            width: carWidth,
            height: carHeight,
        };
        const collision = collides(car, newObstacle);
        return collision;
    });
    return upcoming;
}

function isLineSafe(lane) {
    const upcoming = getAllUpcoming();
    return !upcoming.some(obstacle => obstacle.lane === lane);
}

function moveToLane(lane) {
    currentLane = lane;
    targetX = getLaneX(lane);
}

function botControl() {
    const upcoming = getAllUpcoming();
  
    // If no threats in current lane, try to move to the center lane if possible
    if (!upcoming.some(o => o.lane === currentLane)) {
        if ([0].includes(currentLane)) {
            const moveTo = currentLane + 1;
            if (isLineSafe(moveTo)) {
                console.log("moving to safe lane", moveTo);
                moveToLane(moveTo);
                return;
            }
        } else if ([laneCount - 1].includes(currentLane)) {
            const moveTo = currentLane - 1;
            if (isLineSafe(moveTo)) {
                moveToLane(moveTo);
                return;
            }
        }
        return;
    };
  
    // Only consider adjacent lanes (left and right)
    const adjacentLanes = [];
    if (currentLane > 0) adjacentLanes.push(currentLane - 1); // left lane
    if (currentLane < laneCount - 1) adjacentLanes.push(currentLane + 1); // right lane
  
    // Check for completely safe adjacent lanes
    const safeAdjacentLanes = adjacentLanes.filter(lane => 
      !upcoming.some(o => o.lane === lane)
    );
  
    // If there are safe adjacent lanes, move to the safest one (closest to center)
    if (safeAdjacentLanes.length > 0) {
      const centerLane = Math.floor(laneCount / 2);
      safeAdjacentLanes.sort((a, b) => Math.abs(a - centerLane) - Math.abs(b - centerLane));
      const targetLane = safeAdjacentLanes[0];
      moveToLane(targetLane);
      return;
    }
  
    // If no safe adjacent lanes, find the "safest" option
    // Calculate safety score for each adjacent lane based on obstacle distance
    const laneSafetyScores = [];
    
    for (const lane of adjacentLanes) {
      const obstaclesInLane = upcoming.filter(o => o.lane === lane);
      if (obstaclesInLane.length === 0) {
        // No obstacles in this lane (shouldn't happen here, but just in case)
        laneSafetyScores.push({ lane, score: Infinity });
      } else {
        // Find the closest obstacle in this lane
        const closestObstacle = obstaclesInLane.reduce((closest, o) => 
          o.y < closest.y ? o : closest
        );
        // Higher score = safer (further away obstacle)
        const safetyScore = canvas.height - closestObstacle.y;
        laneSafetyScores.push({ lane, score: safetyScore });
      }
    }
  
    // Also consider staying in current lane
    const currentLaneObstacles = upcoming.filter(o => o.lane === currentLane);
    if (currentLaneObstacles.length > 0) {
      const closestObstacle = currentLaneObstacles.reduce((closest, o) => 
        o.y < closest.y ? o : closest
      );
      const safetyScore = canvas.height - closestObstacle.y;
      laneSafetyScores.push({ lane: currentLane, score: safetyScore });
    }
  
    // Sort by safety score (highest first) and choose the safest option
    laneSafetyScores.sort((a, b) => b.score - a.score);
    const safestLane = laneSafetyScores[0].lane;
    
    // Only move if the safest option is not the current lane
    if (safestLane !== currentLane) {
      moveToLane(safestLane);
    }
  }

function gameLoop() {
  if (!isRunning) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  roadLineOffset = (roadLineOffset + gameSpeed/2) % 35;
  drawRoadLines();
  drawCar();
  updateObstacles();
  drawObstacles();
  if (checkCollisions()) return;
  score++;
  updateScore();
  if (isAutoPlay) botControl();
  requestAnimationFrame(gameLoop);
}

function disableAllControls() {
  // Disable all buttons
  startBtn.disabled = true;
  watchBtn.disabled = true;
  stopBtn.disabled = false;
  
  // Disable all difficulty radio buttons
  difficultyInputs.forEach(input => {
    input.disabled = true;
  });
}

function enableAllControls() {
  // Enable all buttons
  startBtn.disabled = false;
  watchBtn.disabled = false;
  stopBtn.disabled = true;
  
  // Enable all difficulty radio buttons
  difficultyInputs.forEach(input => {
    input.disabled = false;
  });
}

function startGame(auto=false) {
  isRunning = true; isAutoPlay = auto;
  score = 0; frameCount = 0; obstacles = []; roadLineOffset = 0;
  currentLane = 2; carX = targetX = getLaneX(2);
  const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
  if (!difficultyConfig[difficulty]) {
    alert("Invalid difficulty level");
    return;
  }
  gameSpeed = difficultyConfig[difficulty].speed;
  obstacleFrequency = difficultyConfig[difficulty].obstacleFrequency;
  console.log(difficulty, gameSpeed, obstacleFrequency);
  updateScore();
  disableAllControls();
  gameLoop();
}

function endGame() {
  isRunning = false;
  enableAllControls();
}

function moveLeft() {
  if (!isAutoPlay) {
    moveToLane(Math.max(0, currentLane-1));
  }
}
function moveRight() {
  if (!isAutoPlay) {
    moveToLane(Math.min(laneCount-1, currentLane+1));
  }
}

// User controls
document.addEventListener('keydown', e => {
  if (e.key==='ArrowLeft') moveLeft();
  if (e.key==='ArrowRight') moveRight();
});
canvas.addEventListener('click', e => {
  if (isAutoPlay) return;
  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  (cx < carX+carWidth/2 ? moveLeft : moveRight)();
});
let tStart=null;
canvas.addEventListener('touchstart', e => tStart = e.changedTouches[0].clientX);
canvas.addEventListener('touchend',   e => {
  if (isAutoPlay || tStart===null) return;
  const delta = e.changedTouches[0].clientX - tStart;
  if (Math.abs(delta)>30) (delta<0?moveLeft:moveRight)();
  tStart = null;
});

// Button hooks
startBtn .addEventListener('click', () => startGame(false));
watchBtn .addEventListener('click', () => startGame(true));
stopBtn  .addEventListener('click', endGame);
