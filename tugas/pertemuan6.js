const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  scoreDisplay: document.getElementById("scoreDisplay"),
  bestDisplay: document.getElementById("bestDisplay"),
  timeDisplay: document.getElementById("timeDisplay"),
  pauseBtn: document.getElementById("pauseBtn"),
  startOverlay: document.getElementById("startOverlay"),
  pauseOverlay: document.getElementById("pauseOverlay"),
  endOverlay: document.getElementById("endOverlay"),
  endHeading: document.getElementById("endHeading"),
  endDetail: document.getElementById("endDetail"),
  startBtn: document.getElementById("startBtn"),
  resumeBtn: document.getElementById("resumeBtn"),
  pauseRestartBtn: document.getElementById("pauseRestartBtn"),
  restartBtn: document.getElementById("restartBtn")
};

const CONFIG = {
  initialTime: 45,
  targetScore: 120,
  coinReward: 20,
  dangerPenalty: 15,
  coinCount: 3,
  storageKey: "catchTheCoinBestScore"
};

const state = {
  mode: "START", // START | PLAYING | PAUSED | WIN | GAME_OVER
  score: 0,
  bestScore: loadBestScore(),
  timeLeft: CONFIG.initialTime,
  timerId: null,
  invulnerableFrames: 0
};

const player = {
  x: 380,
  y: 230,
  width: 42,
  height: 42,
  speed: 6,
  baseColor: "#38bdf8",
  color: "#38bdf8"
};

const danger = {
  x: 100,
  y: 100,
  width: 48,
  height: 48,
  vx: 3.2,
  vy: 2.6,
  color: "#ff4757"
};

const coins = [];
const particles = [];
const floatingTexts = [];
const pressedKeys = {};
let audioContext = null;

function loadBestScore() {
  try {
    return Number(localStorage.getItem(CONFIG.storageKey)) || 0;
  } catch {
    return 0;
  }
}

function saveBestScore(value) {
  try {
    localStorage.setItem(CONFIG.storageKey, String(value));
  } catch {
    // Abaikan jika storage diblokir browser
  }
}

function ensureAudioReady() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioContext = new AudioCtx();
  }
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playSound(freq, duration, waveType, gainLevel) {
  if (!audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = waveType;
  osc.frequency.setValueAtTime(freq, audioContext.currentTime);
  gain.gain.setValueAtTime(gainLevel, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + duration);
}

const sfx = {
  coin() {
    playSound(880, 0.1, "sine", 0.14);
    setTimeout(() => playSound(1320, 0.14, "sine", 0.14), 60);
  },
  hit() {
    playSound(150, 0.22, "sawtooth", 0.16);
  },
  win() {
    playSound(523, 0.14, "triangle", 0.16);
    setTimeout(() => playSound(659, 0.14, "triangle", 0.16), 110);
    setTimeout(() => playSound(784, 0.28, "triangle", 0.18), 220);
  },
  gameOver() {
    playSound(280, 0.18, "sawtooth", 0.14);
    setTimeout(() => playSound(180, 0.3, "sawtooth", 0.14), 170);
  }
};

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function createCoins() {
  coins.length = 0;
  for (let i = 0; i < CONFIG.coinCount; i++) {
    const coin = { x: 0, y: 0, width: 24, height: 24, color: "#ffd700" };
    relocateCoin(coin);
    coins.push(coin);
  }
}

function relocateCoin(coin) {
  let attempts = 0;
  do {
    coin.x = 24 + Math.random() * (canvas.width - coin.width - 48);
    coin.y = 24 + Math.random() * (canvas.height - coin.height - 48);
    attempts++;
  } while (
    attempts < 50 &&
    (isColliding(coin, player) || isColliding(coin, danger))
  );
}

function clearPressedKeys() {
  Object.keys(pressedKeys).forEach((key) => {
    pressedKeys[key] = false;
  });
}

function spawnParticles(cx, cy, color) {
  for (let i = 0; i < 12; i++) {
    particles.push({
      x: cx,
      y: cy,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      size: 4 + Math.random() * 3,
      life: 1,
      color
    });
  }
}

function spawnFloatingText(x, y, text, color) {
  floatingTexts.push({ x, y, text, color, life: 1 });
}

function updateHUD() {
  ui.scoreDisplay.textContent = state.score + " / " + CONFIG.targetScore;
  ui.bestDisplay.textContent = String(state.bestScore);
  ui.timeDisplay.textContent = state.timeLeft + "s";
  ui.timeDisplay.classList.toggle("critical", state.timeLeft <= 10);
}

function stopTimer() {
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function startTimer() {
  stopTimer();
  state.timerId = setInterval(() => {
    if (state.mode !== "PLAYING") return;

    state.timeLeft--;
    updateHUD();

    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      finishGame("GAME_OVER");
    }
  }, 1000);
}

function startGame() {
  ensureAudioReady();
  clearPressedKeys();

  state.score = 0;
  state.timeLeft = CONFIG.initialTime;
  state.invulnerableFrames = 30;
  state.mode = "PLAYING";

  player.x = (canvas.width - player.width) / 2;
  player.y = (canvas.height - player.height) / 2;
  player.color = player.baseColor;

  danger.x = 60;
  danger.y = 60;
  danger.vx = 3.2;
  danger.vy = 2.6;

  particles.length = 0;
  floatingTexts.length = 0;
  createCoins();

  ui.startOverlay.classList.add("hidden");
  ui.pauseOverlay.classList.add("hidden");
  ui.endOverlay.classList.add("hidden");
  ui.pauseBtn.classList.remove("hidden");

  updateHUD();
  startTimer();
}

function togglePause() {
  if (state.mode === "PLAYING") {
    state.mode = "PAUSED";
    clearPressedKeys();
    ui.pauseOverlay.classList.remove("hidden");
  } else if (state.mode === "PAUSED") {
    state.mode = "PLAYING";
    ui.pauseOverlay.classList.add("hidden");
  }
}

function finishGame(resultMode) {
  state.mode = resultMode;
  stopTimer();
  clearPressedKeys();
  ui.pauseBtn.classList.add("hidden");

  if (state.score > state.bestScore) {
    state.bestScore = state.score;
    saveBestScore(state.bestScore);
  }
  updateHUD();

  if (resultMode === "WIN") {
    sfx.win();
    ui.endHeading.textContent = "YOU WIN!";
    ui.endHeading.classList.remove("lose");
    ui.endDetail.textContent =
      "Skor Akhir: " + state.score + " | Sisa Waktu: " + state.timeLeft + " detik";
  } else {
    sfx.gameOver();
    ui.endHeading.textContent = "GAME OVER";
    ui.endHeading.classList.add("lose");
    ui.endDetail.textContent =
      "Waktu habis! Skor Akhir: " + state.score + " / " + CONFIG.targetScore;
  }

  ui.endOverlay.classList.remove("hidden");
}

function updatePlayer() {
  if (pressedKeys["arrowup"] || pressedKeys["w"]) player.y -= player.speed;
  if (pressedKeys["arrowdown"] || pressedKeys["s"]) player.y += player.speed;
  if (pressedKeys["arrowleft"] || pressedKeys["a"]) player.x -= player.speed;
  if (pressedKeys["arrowright"] || pressedKeys["d"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

  if (state.invulnerableFrames > 0) {
    state.invulnerableFrames--;
  }
}

function updateDanger() {
  danger.x += danger.vx;
  danger.y += danger.vy;

  if (danger.x <= 0 || danger.x + danger.width >= canvas.width) {
    danger.vx *= -1;
    danger.x = Math.max(0, Math.min(canvas.width - danger.width, danger.x));
  }
  if (danger.y <= 0 || danger.y + danger.height >= canvas.height) {
    danger.vy *= -1;
    danger.y = Math.max(0, Math.min(canvas.height - danger.height, danger.y));
  }
}

function updateCollisions() {
  coins.forEach((coin) => {
    if (isColliding(player, coin)) {
      state.score += CONFIG.coinReward;
      sfx.coin();
      spawnParticles(coin.x + coin.width / 2, coin.y + coin.height / 2, "#ffd700");
      spawnFloatingText(coin.x + 12, coin.y, "+" + CONFIG.coinReward, "#00e676");
      relocateCoin(coin);
      updateHUD();

      if (state.score >= CONFIG.targetScore) {
        finishGame("WIN");
      }
    }
  });

  if (state.invulnerableFrames === 0 && isColliding(player, danger)) {
    state.score = Math.max(0, state.score - CONFIG.dangerPenalty);
    state.invulnerableFrames = 45;
    sfx.hit();
    spawnParticles(player.x + player.width / 2, player.y + player.height / 2, "#ff4757");
    spawnFloatingText(player.x + 20, player.y, "-" + CONFIG.dangerPenalty, "#ff4757");
    updateHUD();
  }
}

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
  if (state.mode !== "PLAYING") return;

  updatePlayer();
  updateDanger();
  updateCollisions();
}

function drawBackground() {
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
  drawBackground();

  ctx.fillStyle = danger.color;
  ctx.fillRect(danger.x, danger.y, danger.width, danger.height);

  coins.forEach((coin) => {
    ctx.fillStyle = coin.color;
    ctx.beginPath();
    ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Efek kedip saat invulnerable setelah kena bahaya
  const shouldDrawPlayer =
    state.invulnerableFrames === 0 || Math.floor(state.invulnerableFrames / 5) % 2 === 0;
  if (shouldDrawPlayer) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  particles.forEach((p) => {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
  ctx.globalAlpha = 1;

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

window.addEventListener("keydown", function (event) {
  const key = event.key.toLowerCase();
  if (event.key.startsWith("Arrow")) {
    event.preventDefault();
  }
  if (key === "p" && (state.mode === "PLAYING" || state.mode === "PAUSED")) {
    togglePause();
    return;
  }
  pressedKeys[key] = true;
});

window.addEventListener("keyup", function (event) {
  pressedKeys[event.key.toLowerCase()] = false;
});

window.addEventListener("blur", clearPressedKeys);

ui.startBtn.addEventListener("click", startGame);
ui.pauseBtn.addEventListener("click", togglePause);
ui.resumeBtn.addEventListener("click", togglePause);
ui.pauseRestartBtn.addEventListener("click", startGame);
ui.restartBtn.addEventListener("click", startGame);

createCoins();
updateHUD();
gameLoop();