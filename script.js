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
let highScore = localStorage.getItem("highScore") || 0;
highScoreElement.innerText = highScore;
let time = "00:00";
let streak = 0; // tracks consecutive food eaten

const blocks = [];
let directions = "right"; // initial direction of the snake

const btnUp = document.querySelector(".up");
const btnDown = document.querySelector(".down");
const btnLeft = document.querySelector(".left");
const btnRight = document.querySelector(".right");

let startX = 0;
let startY = 0;

let gameSpeed;
let currentDifficulty = "easy"; // default
let intervalId = null;
let timeIntervalId = null;

let snake = [
  { x: 2, y: 5 },
  { x: 2, y: 4 },
  { x: 2, y: 3 },
];

let food = {
  x: Math.floor(Math.random() * rows),
  y: Math.floor(Math.random() * cols),
};

let dengerousFood = {
  x: Math.floor(Math.random() * rows),
  y: Math.floor(Math.random() * cols),
};

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

// EASY
easyLevelBtn.addEventListener("click", () => {
  currentDifficulty = "easy";
  gameSpeed = 300;
  updateDifficultyUI();
  updateHighScore();
});

// MEDIUM
mediumLevelBtn.addEventListener("click", () => {
  currentDifficulty = "medium";
  gameSpeed = 200;
  updateDifficultyUI();
  updateHighScore();
});

// HARD
hardLevelBtn.addEventListener("click", () => {
  currentDifficulty = "hard";
  gameSpeed = 100;
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

// render logic
function render() {
  let head = null;

  // food render logic
  blocks[`${food.x}-${food.y}`].classList.add("food");
  blocks[`${dengerousFood.x}-${dengerousFood.y}`].classList.add(
    "dengerous-food",
  );

  // head directions logic
  if (directions === "right") {
    head = { x: snake[0].x, y: snake[0].y + 1 };
  } else if (directions === "down") {
    head = { x: snake[0].x + 1, y: snake[0].y };
  } else if (directions === "left") {
    head = { x: snake[0].x, y: snake[0].y - 1 };
  } else if (directions === "up") {
    head = { x: snake[0].x - 1, y: snake[0].y };
  }

  // game over logic
  function gameOver() {
    // alert("Game Over!");// for testing
    clearInterval(intervalId);
    clearInterval(timeIntervalId);
  }

  // wall collision and self collision logic and dengerous food collision logic
  if (
    head.x < 0 ||
    head.x >= rows ||
    head.y < 0 ||
    head.y >= cols ||
    snake.some((segment) => segment.x === head.x && segment.y === head.y) ||
    (head.x === dengerousFood.x && head.y === dengerousFood.y)
  ) {
    gameOver();

    modal.style.display = "flex";
    gameStartModal.style.display = "none";
    gameOverModal.style.display = "flex";
    return;
  }

  // food consumption logic
  if (head.x === food.x && head.y === food.y) {
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    blocks[`${dengerousFood.x}-${dengerousFood.y}`].classList.remove(
      "dengerous-food",
    );

    // ensure that the new food doesn't spawn on the snake
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * rows),
        y: Math.floor(Math.random() * cols),
      };
    } while (
      snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y,
      )
    );

    food = newFood;

    // ensure that the new dengerous food doesn't spawn on the snake or on the food
    let newDengerousFood;
    do {
      newDengerousFood = {
        x: Math.floor(Math.random() * rows),
        y: Math.floor(Math.random() * cols),
      };
    } while (
      snake.some(
        (segment) =>
          segment.x === newDengerousFood.x && segment.y === newDengerousFood.y,
      ) ||
      (newDengerousFood.x === food.x && newDengerousFood.y === food.y)
    );

    dengerousFood = newDengerousFood;

    // render the new food and dengerous food
    blocks[`${food.x}-${food.y}`].classList.add("food");
    blocks[`${dengerousFood.x}-${dengerousFood.y}`].classList.add(
      "dengerous-food",
    );

    snake.unshift(head);

    streak += 1;
    score += 1;

    // Bonus every 10 consecutive foods
    if (streak % 10 === 0) {
      score += 5; // bonus points
    }

    scoreElement.innerText = score;

    if (score > getHighScore()) {
      saveHighScore(score);
      updateHighScore();
    }
  }

  snake.forEach((segment) => {
    const block = blocks[`${segment.x}-${segment.y}`];
    block.classList.remove("snake");
  });

  snake.unshift(head);
  snake.pop();

  snake.forEach((segment) => {
    // console.log(segment); // for testing
    const block = blocks[`${segment.x}-${segment.y}`];
    block.classList.add("snake");
  });
}

startBtn.addEventListener("click", () => {
  modal.style.display = "none";
  intervalId = setInterval(() => {
    render();
  }, gameSpeed);

  timeIntervalId = setInterval(() => {
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
  }, 1000);
});

restartBtn.addEventListener("click", restartGame);

function restartGame() {
  // Clear the food and snake from the previous game
  blocks[`${food.x}-${food.y}`].classList.remove("food");

  snake.forEach((segment) => {
    const block = blocks[`${segment.x}-${segment.y}`];
    block.classList.remove("snake");
  });

  // reset the score, time and high score if necessary
  score = 0;
  time = "00:00";

  scoreElement.innerText = score;
  timeElement.innerText = time;
  highScoreElement.innerText = highScore;

  // remove the game over modal and restart the game
  modal.style.display = "none";
  directions = "right";
  snake = [
    { x: 2, y: 5 },
    { x: 2, y: 4 },
    { x: 2, y: 3 },
  ];

  // ensure that the new food doesn't spawn on the snake
  do {
    newFood = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };
  } while (
    snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
  );

  food = newFood;

  clearInterval(intervalId);
  intervalId = setInterval(() => {
    render();
  }, gameSpeed);

  // reset the time interval
  timeIntervalId = setInterval(() => {
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
  }, 1000);

  updateHighScore() 
}

// saanke direction control logic
document.addEventListener("keydown", (event) => {
  // console.log(event.key); // for testing
  if (event.key === "ArrowUp" || event.key === "w" || event.key === "8") {
    directions = "up";
  } else if (
    event.key === "ArrowRight" ||
    event.key === "d" ||
    event.key === "6"
  ) {
    directions = "right";
  } else if (
    event.key === "ArrowDown" ||
    event.key === "s" ||
    event.key === "2"
  ) {
    directions = "down";
  } else if (
    event.key === "ArrowLeft" ||
    event.key === "a" ||
    event.key === "4"
  ) {
    directions = "left";
  }
});

// mobile controls logic
btnUp.addEventListener("click", () => {
  directions = "up";
  // console.log("up"); // for testing
});

btnRight.addEventListener("click", () => {
  directions = "right";
  // console.log("right"); // for testing
});

btnDown.addEventListener("click", () => {
  directions = "down";
  // console.log("down"); // for testing
});

btnLeft.addEventListener("click", () => {
  directions = "left";
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
      directions = "right";
    } else {
      directions = "left";
    }
  } else {
    if (diffY > 0) {
      directions = "down";
    } else {
      directions = "up";
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
