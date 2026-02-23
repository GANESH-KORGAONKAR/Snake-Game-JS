const board = document.querySelector(".board");

const blockHeight = 30;
const blockWidth = 30;

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

const blocks = [];
const snake = [
  { x: 2, y: 5 },
  { x: 2, y: 4 },
  { x: 2, y: 3 },
];
let directions = "right";
let intevalId = null;
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

  // head render logic
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
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    alert("Game Over!");
    clearInterval(intevalId);
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

intevalId = setInterval(() => {
  render();
}, 200);

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
