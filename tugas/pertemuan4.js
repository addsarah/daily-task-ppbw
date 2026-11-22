const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const INITIAL_TIME = 60;
const WIN_SCORE = 100;
const COIN_VALUE = 20;

let gameState = "START"; // START | PLAYING | WIN | GAME_OVER
let score = 0;
let timeLeft = INITIAL_TIME;
let timerInterval = null;

const player = {
  x: 380,
  y: 230,
  width: 40,
  height: 40,
  speed: 5,
  color: "cyan"
};

const danger = {
  x: 180,
  y: 300,
  width: 50,
  height: 50,
  color: "#ff4444"
};

const coins = [
  { x: 100, y: 100, width: 24, height: 24, color: "gold" },
  { x: 600, y: 120, width: 24, height: 24, color: "gold" },
  { x: 500, y: 380, width: 24, height: 24, color: "gold" }
];

const keys = {};

window.addEventListener("keydown", function (event) {
  if (event.key.startsWith("Arrow")) {
    event.preventDefault();
  }
  keys[event.key] = true;
});

window.addEventListener("keyup", function (event) {
  keys[event.key] = false;
});

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function relocateCoin(coin) {
  do {
    coin.x = Math.random() * (canvas.width - coin.width);
    coin.y = 60 + Math.random() * (canvas.height - coin.height - 60);
  } while (isColliding(coin, danger) || isColliding(coin, player));
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    if (gameState !== "PLAYING") return;

    timeLeft--;
    if (timeLeft <= 0) {
      timeLeft = 0;
      endGame("GAME_OVER");
    }
  }, 1000);
}

function endGame(resultState) {
  gameState = resultState;
  stopTimer();
  restartBtn.classList.remove("hidden");
}

function startGame() {
  score = 0;
  timeLeft = INITIAL_TIME;
  player.x = 380;
  player.y = 230;
  coins.forEach(relocateCoin);

  gameState = "PLAYING";
  startBtn.classList.add("hidden");
  restartBtn.classList.add("hidden");
  startTimer();
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

function update() {
  if (gameState !== "PLAYING") return;

  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  if (player.x < 0) player.x = 0;
  if (player.y < 50) player.y = 50;
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
  }

  coins.forEach((coin) => {
    if (isColliding(player, coin)) {
      score += COIN_VALUE;
      relocateCoin(coin);
      if (score >= WIN_SCORE) {
        endGame("WIN");
      }
    }
  });

  if (isColliding(player, danger)) {
    score = Math.max(0, score - 10);
    player.x = 380;
    player.y = 230;
  }
}

function drawHUD() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, 50);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "left";
  ctx.fillText("SCORE: " + score + " / " + WIN_SCORE, 20, 32);

  ctx.textAlign = "right";
  ctx.fillText("TIME: " + timeLeft + "s", canvas.width - 20, 32);
}

function drawOverlay(title, subtitle, color) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = color;
  ctx.font = "bold 44px Arial";
  ctx.textAlign = "center";
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 20);

  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 25);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = danger.color;
  ctx.fillRect(danger.x, danger.y, danger.width, danger.height);

  coins.forEach((coin) => {
    const centerX = coin.x + coin.width / 2;
    const centerY = coin.y + coin.height / 2;
    const radius = coin.width / 2;

    ctx.fillStyle = coin.color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  drawHUD();

  if (gameState === "START") {
    drawOverlay("CATCH THE COIN", "Tekan START untuk bermain (Target: 100 Poin)", "#00e676");
  } else if (gameState === "WIN") {
    drawOverlay("YOU WIN!", "Skor Akhir: " + score + " | Sisa Waktu: " + timeLeft + "s", "#00e676");
  } else if (gameState === "GAME_OVER") {
    drawOverlay("GAME OVER", "Waktu habis! Skor Akhir: " + score, "#ff4444");
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();