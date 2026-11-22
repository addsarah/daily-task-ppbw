const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusMessage = document.getElementById("statusMessage");

const player = {
  x: 400,
  y: 250,
  width: 45,
  height: 45,
  speed: 5,
  color: "lime"
};

const danger = {
  x: 200,
  y: 300,
  width: 55,
  height: 55,
  color: "red"
};

const coins = [
  { x: 100, y: 100, width: 24, height: 24, color: "gold" },
  { x: 350, y: 120, width: 24, height: 24, color: "gold" },
  { x: 650, y: 380, width: 24, height: 24, color: "gold" }
];

const keys = {};
let dangerTimeout = null;

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
    coin.y = Math.random() * (canvas.height - coin.height);
  } while (isColliding(coin, danger));
}

function showStatus(text, isDanger) {
  statusMessage.textContent = text;
  statusMessage.classList.toggle("danger", isDanger);

  if (dangerTimeout) clearTimeout(dangerTimeout);
  dangerTimeout = setTimeout(() => {
    statusMessage.textContent = "Ambil koin emas dan hindari kotak merah!";
    statusMessage.classList.remove("danger");
  }, 1500);
}

function update() {
  if (keys["ArrowUp"]) player.y -= player.speed;
  if (keys["ArrowDown"]) player.y += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  if (player.x < 0) player.x = 0;
  if (player.y < 0) player.y = 0;
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
  }

  coins.forEach((coin) => {
    if (isColliding(player, coin)) {
      relocateCoin(coin);
      showStatus("Koin berhasil diambil!", false);
    }
  });

  if (isColliding(player, danger)) {
    player.x = 400;
    player.y = 250;
    showStatus("Bahaya! Player menyentuh objek merah.", true);
  }
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
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();