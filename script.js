const board = document.querySelector(".board");
const startBtn = document.querySelector(".start-btn");
const restartBtn = document.querySelector(".restart-btn");
const modal = document.querySelector(".modal");
const gameStartModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const scoreElement = document.querySelector("#score");
const highScoreElement = document.querySelector("#high-score");
const timeElement = document.querySelector("#time");

const easyLevelBtn = document.querySelector(".easy");
const mediumLevelBtn = document.querySelector(".medium");
const hardLevelBtn = document.querySelector(".hard");

const blockHeight = 30;
const blockWidth = 30;

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

let score = 0;
let time = "00:00";
let streak = 0; // tracks consecutive food eaten

let bonusFoods = [];
let lastBonusSpawnScore = 0; // prevents duplicate spawn at same milestone

const blocks = {};
let directions = "right"; // initial direction of the snake

const btnUp = document.querySelector(".up");
const btnDown = document.querySelector(".down");
const btnLeft = document.querySelector(".left");
const btnRight = document.querySelector(".right");

let startX = 0;
let startY = 0;

let currentDifficulty = "easy";
let gameSpeed = 300; // default easy speed
let intervalId = null;
let timeIntervalId = null;

let snake = [
  { x: 2, y: 5 },
  { x: 2, y: 4 },
  { x: 2, y: 3 },
];

let foods = [];
let dangerousFoods = [];

// Reload the page on window resize to recalculate board dimensions and prevent layout issues
window.addEventListener("resize", () => {
  location.reload();
});

// board creation logic
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);
    // block.innerText = `${row},${col}`; // for testing
    blocks[`${row}-${col}`] = block;
  }
}

// high score management logic
function getHighScore() {
  const key = `snake_highscore_${currentDifficulty}`;
  return Number(localStorage.getItem(key)) || 0;
}

// Save high score if current score is greater than existing high score for the current difficulty level
function saveHighScore(score) {
  const key = `snake_highscore_${currentDifficulty}`;
  const existing = Number(localStorage.getItem(key)) || 0;

  if (score > existing) {
    localStorage.setItem(key, score);
  }
}

// difficulty settings
// EASY
easyLevelBtn.addEventListener("click", () => {
  currentDifficulty = "easy";
  gameSpeed = 250;
  spawnFood(1, "normal");
  spawnFood(1, "dangerous");
  updateDifficultyUI();
  updateHighScore();
});

// MEDIUM
mediumLevelBtn.addEventListener("click", () => {
  currentDifficulty = "medium";
  gameSpeed = 180;
  spawnFood(1, "normal");
  spawnFood(2, "dangerous");
  updateDifficultyUI();
  updateHighScore();
});

// HARD
hardLevelBtn.addEventListener("click", () => {
  currentDifficulty = "hard";
  gameSpeed = 110;
  spawnFood(2, "normal");
  spawnFood(4, "dangerous");
  updateDifficultyUI();
  updateHighScore();
});

function updateDifficultyUI() {
  easyLevelBtn.style.backgroundColor =
    currentDifficulty === "easy"
      ? "var(--border-easy-level-color)"
      : "var(--bg-color)";
  mediumLevelBtn.style.backgroundColor =
    currentDifficulty === "medium"
      ? "var(--border-medium-level-color)"
      : "var(--bg-color)";
  hardLevelBtn.style.backgroundColor =
    currentDifficulty === "hard"
      ? "var(--border-hard-level-color)"
      : "var(--bg-color)";
}

function updateHighScore() {
  highScoreElement.innerText = getHighScore();
}

// game over logic
function gameOver() {
  // alert("Game Over!");// for testing
  clearInterval(intervalId);
  clearInterval(timeIntervalId);
  saveHighScore(score); // ✅ Save score
  updateHighScore(); // ✅ Refresh UI
}

// calculate the next head position based on the current direction
function getNextHeadPosition() {
  const currentHead = snake[0];
  // head directions logic
  switch (directions) {
    case "right":
      return { x: currentHead.x, y: currentHead.y + 1 };
    case "left":
      return { x: currentHead.x, y: currentHead.y - 1 };
    case "up":
      return { x: currentHead.x - 1, y: currentHead.y };
    case "down":
      return { x: currentHead.x + 1, y: currentHead.y };
  }
}

// collision detection logic
function isCollision(head) {
  const wallCollision =
    head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols;

  const selfCollision = snake.some(
    (segment) => segment.x === head.x && segment.y === head.y,
  );

  const dangerousCollision = dangerousFoods.some(
    (food) => food.x === head.x && food.y === head.y,
  );

  return wallCollision || selfCollision || dangerousCollision;
}

// food spawning logic
function spawnFood(count, type) {
  const foodArray = [];

  for (let i = 0; i < count; i++) {
    let newFood;

    do {
      newFood = {
        x: Math.floor(Math.random() * rows),
        y: Math.floor(Math.random() * cols),
      };
    } while (
      snake.some((seg) => seg.x === newFood.x && seg.y === newFood.y) ||
      foods.some((f) => f.x === newFood.x && f.y === newFood.y) ||
      dangerousFoods.some((f) => f.x === newFood.x && f.y === newFood.y) ||
      bonusFoods.some((f) => f.x === newFood.x && f.y === newFood.y)
    );

    foodArray.push(newFood);
  }

  if (type === "normal") foods = foodArray;
  if (type === "dangerous") dangerousFoods = foodArray;
  if (type === "bonus") bonusFoods = foodArray;
}

// move the snake by adding the new head and removing the tail
function draw() {
  // Clear all
  Object.values(blocks).forEach((block) => {
    block.classList.remove(
      "snake",
      "snake-head",
      "food",
      "dangerous-food",
      "bonus-food",
    );
  });

  // Draw snake
  snake.forEach((segment, index) => {
    const block = blocks[`${segment.x}-${segment.y}`];
    block.classList.add("snake");

    if (index === 0) block.classList.add("snake-head");
  });

  // Draw normal foods
  foods.forEach((food) => {
    blocks[`${food.x}-${food.y}`].classList.add("food");
  });

  // Draw dangerous foods
  dangerousFoods.forEach((food) => {
    blocks[`${food.x}-${food.y}`].classList.add("dangerous-food");
  });

  // Draw bonus foods
  bonusFoods.forEach((food) => {
    blocks[`${food.x}-${food.y}`].classList.add("bonus-food");
  });
}

// Move Snake Function
function moveSnake(head) {
  snake.unshift(head);
  snake.pop();
}

// time tracking logic
function updateTime() {
  let [min, sec] = time.split(":").map(Number);

  if (sec === 59) {
    min += 1;
    sec = 0;
  } else {
    sec += 1;
  }

  const formattedMin = String(min).padStart(2, "0");
  const formattedSec = String(sec).padStart(2, "0");

  time = `${formattedMin}:${formattedSec}`;
  timeElement.innerText = time;
}

// render logic
function render() {
  const head = getNextHeadPosition();

  if (isCollision(head)) {
    gameOver();
    modal.style.display = "flex";
    gameStartModal.style.display = "none";
    gameOverModal.style.display = "flex";
    return;
  }

  const ateFood = foods.some((food) => food.x === head.x && food.y === head.y);

  if (ateFood) {
    snake.unshift(head); // grow
    score++;
    streak++;

    if (streak % 10 === 0) score += 5;
    scoreElement.innerText = score;

    spawnFood(foods.length, "normal");
    spawnFood(dangerousFoods.length, "dangerous");
  } else {
    moveSnake(head); // normal move
  }

  const ateBonus = bonusFoods.some(
    (food) => food.x === head.x && food.y === head.y,
  );

  if (ateBonus) {
    score += 10; // bonus points
    scoreElement.innerText = score;

    bonusFoods = []; // remove bonus after eating
    draw();
    return;
  }

  // Spawn bonus food every 30 points
  if (score > 0 && score % 30 === 0 && score !== lastBonusSpawnScore) {
    spawnFood(1, "bonus");
    lastBonusSpawnScore = score;
  }

  draw();
}

startBtn.addEventListener("click", () => {
  modal.style.display = "none";
  intervalId = setInterval(() => {
    render();
  }, gameSpeed);

  timeIntervalId = setInterval(updateTime, 1000);
});

restartBtn.addEventListener("click", restartGame);

function restartGame() {
  clearInterval(intervalId);
  clearInterval(timeIntervalId);

  score = 0;
  time = "00:00";
  streak = 0;

  scoreElement.innerText = score;
  timeElement.innerText = time;

  directions = "right";

  snake = [
    { x: 2, y: 5 },
    { x: 2, y: 4 },
    { x: 2, y: 3 },
  ];

  spawnFood(1, "normal");

  if (currentDifficulty === "easy") {
    spawnFood(1, "dangerous");
  } else if (currentDifficulty === "medium") {
    spawnFood(2, "dangerous");
  } else if (currentDifficulty === "hard") {
    spawnFood(4, "dangerous");
    spawnFood(2, "normal");
  }

  modal.style.display = "none";

  intervalId = setInterval(render, gameSpeed);
  timeIntervalId = setInterval(updateTime, 1000);

  updateHighScore();
}

// saanke direction control logic
document.addEventListener("keydown", (event) => {
  // console.log(event.key); // for testing
  if (event.key === "ArrowUp" || event.key === "w" || event.key === "8") {
    setDirection("up");
  } else if (
    event.key === "ArrowRight" ||
    event.key === "d" ||
    event.key === "6"
  ) {
    setDirection("right");
  } else if (
    event.key === "ArrowDown" ||
    event.key === "s" ||
    event.key === "2"
  ) {
    setDirection("down");
  } else if (
    event.key === "ArrowLeft" ||
    event.key === "a" ||
    event.key === "4"
  ) {
    setDirection("left");
  }
});

// mobile controls logic
btnUp.addEventListener("click", () => {
  setDirection("up");
  // console.log("up"); // for testing
});

btnRight.addEventListener("click", () => {
  setDirection("right");
  // console.log("right"); // for testing
});

btnDown.addEventListener("click", () => {
  setDirection("down");
  // console.log("down"); // for testing
});

btnLeft.addEventListener("click", () => {
  setDirection("left");
  // console.log("left"); // for testing
});

// swipe controls logic
document.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

document.addEventListener("touchend", (e) => {
  let endX = e.changedTouches[0].clientX;
  let endY = e.changedTouches[0].clientY;

  let diffX = endX - startX;
  let diffY = endY - startY;

  // Ignore very small swipes
  if (Math.abs(diffX) < 30 && Math.abs(diffY) < 30) return;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 0) {
      setDirection("right");
    } else {
      setDirection("left");
    }
  } else {
    if (diffY > 0) {
      setDirection("down");
    } else {
      setDirection("up");
    }
  }
});

function setDirection(newDirection) {
  if (directions === "up" && newDirection === "down") return;
  if (directions === "down" && newDirection === "up") return;
  if (directions === "left" && newDirection === "right") return;
  if (directions === "right" && newDirection === "left") return;

  directions = newDirection;
}
