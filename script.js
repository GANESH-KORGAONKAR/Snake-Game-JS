const board = document.querySelector(".board");
const startBtn = document.querySelector(".start-btn");
const restartBtn = document.querySelector(".restart-btn");
const modal = document.querySelector(".modal");
const gameStartModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const scoreElement = document.querySelector("#score");
const highScoreElement = document.querySelector("#high-score");
const timeElement = document.querySelector("#time");

const blockHeight = 30;
const blockWidth = 30;

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
highScoreElement.innerText = highScore;
let time = "00-00";

const blocks = [];
let directions = "right";

let intevalId = null;
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

// render logic
function render() {
  let head = null;

  // food render logic
  blocks[`${food.x}-${food.y}`].classList.add("food");

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
    clearInterval(intevalId);
    clearInterval(timeIntervalId);
  }
  // wall collision and self collision logic
  if (
    head.x < 0 ||
    head.x >= rows ||
    head.y < 0 ||
    head.y >= cols ||
    snake.some((segment) => segment.x === head.x && segment.y === head.y)
  ) {
    gameOver();

    modal.style.display = "flex";
    gameStartModal.style.display = "none";
    gameOverModal.style.display = "flex";

    return;
  }

  // food eating logic
  if (head.x === food.x && head.y === food.y) {
    blocks[`${food.x}-${food.y}`].classList.remove("food");

    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };

    blocks[`${food.x}-${food.y}`].classList.add("food");

    snake.unshift(head);

    score += 1;
    scoreElement.innerText = score;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore.toString());
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
  intevalId = setInterval(() => {
    render();
  }, 300);

  timeIntervalId = setInterval(() => {
    let [min , sec] = time.split("-").map(Number);

    if(sec === 59){
      min += 1;
      sec = 0;
    }else{
      sec += 1;
    }
    time = `${min}-${sec}`;
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
time = "00-00";

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

  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };

  intevalId = setInterval(() => {
    render();
  }, 300);

  timeIntervalId = setInterval(() => {
    let [min , sec] = time.split("-").map(Number);

    if(sec === 59){
      min += 1;
      sec = 0;
    }else{
      sec += 1;
    }
    time = `${min}-${sec}`;
    timeElement.innerText = time;
  }, 1000);
}

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
