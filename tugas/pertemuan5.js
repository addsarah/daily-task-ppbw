const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const hudScore = document.getElementById("hudScore");
const hudTime = document.getElementById("hudTime");
const startScreen = document.getElementById("startScreen");
const endScreen = document.getElementById("endScreen");
const endTitle = document.getElementById("endTitle");
const endSummary = document.getElementById("endSummary");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const INITIAL_TIME = 60;
const WIN_SCORE = 100;
const COIN_VALUE = 20;

let gameState = "START";
let score = 0;
let timeLeft = INITIAL_TIME;
let timerInterval = null;
let audioCtx = null;

const player = {
  x: 380,
  y: 230,
  width: 42,
  height: 42,
  speed: 6,
  baseColor: "#00e5ff",
  color: "#00e5ff"
};

const danger = {
  x: 180,
  y: 300,
  width: 52,
  height: 52,
  color: "#ff4757"
};

const coins = [
  { x: 100, y: 100, width: 24, height: 24, color: "#ffd700" },
  { x: 640, y: 120, width: 24, height: 24, color: "#ffd700" },
  { x: 520, y: 380, width: 24, height: 24, color: "#ffd700" }
];

const particles = [];
const floatingTexts = [];
const keys = {};

// Web Audio API Synthesizer (bebas error 404 file audio eksternal)
function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playTone(freq, duration, type, volume) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playCoinSound() {
  playTone(880, 0.12, "sine", 0.15);
  setTimeout(() => playTone(1320, 0.16, "sine", 0.15), 70);
}

function playHitSound() {
  playTone(160, 0.25, "sawtooth", 0.18);
}

function playWinSound() {
  playTone(523, 0.15, "triangle", 0.18);
  setTimeout(() => playTone(659, 0.15, "triangle", 0.18), 120);
  setTimeout(() => playTone(784, 0.3, "triangle", 0.2), 240);
}

function playGameOverSound() {
  playTone(300, 0.2, "sawtooth", 0.15);
  setTimeout(() => playTone(200, 0.35, "sawtooth", 0.15), 180);
}

window.addEventListener("keydown", function (event) {
  if (event.key.startsWith("Arrow")) {
    event.preventDefault();
  }
  keys[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", function (event) {
  keys[event.key.toLowerCase()] = false;
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
    coin.x = 20 + Math.random() * (canvas.width - coin.width - 40);
    coin.y = 20 + Math.random() * (canvas.height - coin.height - 40);
  } while (isColliding(coin, danger) || isColliding(coin, player));
}

function spawnParticles(x, y, color) {
  for (let i = 0; i < 12; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      size: 4 + Math.random() * 4,
      life: 1,
      color
    });
  }
}

function spawnFloatingText(x, y, text, color) {
  floatingTexts.push({ x, y, text, color, life: 1 });
}

function flashPlayer(flashColor) {
  player.color = flashColor;
  setTimeout(() => {
    player.color = player.baseColor;
  }, 150);
}

function updateHUD() {
  hudScore.textContent = score + " / " + WIN_SCORE;
  hudTime.textContent = timeLeft + "s";
  hudTime.classList.toggle("warning", timeLeft <= 10);
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
    updateHUD();

    if (timeLeft <= 0) {
      timeLeft = 0;
      endGame("GAME_OVER");
    }
  }, 1000);
}

function endGame(resultState) {
  gameState = resultState;
  stopTimer();

  if (resultState === "WIN") {
    playWinSound();
    endTitle.textContent = "YOU WIN!";
    endTitle.classList.remove("lose");
    endSummary.textContent = "Skor Akhir: " + score + " | Sisa Waktu: " + timeLeft + " detik";
  } else {
    playGameOverSound();
    endTitle.textContent = "GAME OVER";
    endTitle.classList.add("lose");
    endSummary.textContent = "Waktu habis! Skor Akhir: " + score + " / " + WIN_SCORE;
  }

  endScreen.classList.remove("hidden");
}

function startGame() {
  initAudio();
  score = 0;
  timeLeft = INITIAL_TIME;
  player.x = 380;
  player.y = 230;
  player.color = player.baseColor;
  particles.length = 0;
  floatingTexts.length = 0;
  coins.forEach(relocateCoin);

  gameState = "PLAYING";
  startScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  updateHUD();
  startTimer();
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

function updateEffects() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.04;
    if (p.life <= 0) particles.splice(i, 1);
  }

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const t = floatingTexts[i];
    t.y -= 1.2;
    t.life -= 0.03;
    if (t.life <= 0) floatingTexts.splice(i, 1);
  }
}

function update() {
  updateEffects();
  if (gameState !== "PLAYING") return;

  if (keys["arrowup"] || keys["w"]) player.y -= player.speed;
  if (keys["arrowdown"] || keys["s"]) player.y += player.speed;
  if (keys["arrowleft"] || keys["a"]) player.x -= player.speed;
  if (keys["arrowright"] || keys["d"]) player.x += player.speed;

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
      score += COIN_VALUE;
      playCoinSound();
      flashPlayer("#ffd700");
      spawnParticles(coin.x + coin.width / 2, coin.y + coin.height / 2, "#ffd700");
      spawnFloatingText(coin.x, coin.y, "+" + COIN_VALUE, "#00e676");
      relocateCoin(coin);
      updateHUD();

      if (score >= WIN_SCORE) {
        endGame("WIN");
      }
    }
  });

  if (isColliding(player, danger)) {
    score = Math.max(0, score - 10);
    playHitSound();
    flashPlayer("#ff4757");
    spawnParticles(player.x + player.width / 2, player.y + player.height / 2, "#ff4757");
    spawnFloatingText(player.x, player.y, "-10", "#ff4757");
    player.x = 380;
    player.y = 230;
    updateHUD();
  }
}

function drawGridBackground() {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGridBackground();

  // Danger block
  ctx.fillStyle = danger.color;
  ctx.fillRect(danger.x, danger.y, danger.width, danger.height);

  // Coins (lingkaran emas)
  coins.forEach((coin) => {
    const cx = coin.x + coin.width / 2;
    const cy = coin.y + coin.height / 2;
    ctx.fillStyle = coin.color;
    ctx.beginPath();
    ctx.arc(cx, cy, coin.width / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Particles
  particles.forEach((p) => {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
  ctx.globalAlpha = 1;

  // Floating texts
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  floatingTexts.forEach((t) => {
    ctx.globalAlpha = Math.max(0, t.life);
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, t.x, t.y);
  });
  ctx.globalAlpha = 1;
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

updateHUD();
gameLoop();