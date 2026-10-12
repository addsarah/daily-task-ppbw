const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Objek Game
const player = { x: 400, y: 250, width: 40, height: 40, speed: 5, color: "lime" };
const danger = { x: 200, y: 300, width: 50, height: 50, color: "red" };

// Minimal 3 koin
const coins = [
    { x: 100, y: 100, width: 20, height: 20, color: "gold" },
    { x: 300, y: 200, width: 20, height: 20, color: "gold" },
    { x: 600, y: 400, width: 20, height: 20, color: "gold" }
];

// Deteksi tombol ditahan agar gerak mulus
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// Fungsi Collision Sederhana
function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function update() {
    // Gerak Player
    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;

    // Batas Kanvas
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

    // Deteksi Tabrakan Koin
    coins.forEach(coin => {
        if (isColliding(player, coin)) {
            // Pindahkan koin ke lokasi acak
            coin.x = Math.random() * (canvas.width - coin.width);
            coin.y = Math.random() * (canvas.height - coin.height);
        }
    });

    // Deteksi Tabrakan Objek Bahaya
    if (isColliding(player, danger)) {
        alert("Bahaya!");
        player.x = 400; // Reset posisi
        player.y = 250;
        keys["ArrowUp"] = keys["ArrowDown"] = keys["ArrowLeft"] = keys["ArrowRight"] = false;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Gambar Bahaya
    ctx.fillStyle = danger.color;
    ctx.fillRect(danger.x, danger.y, danger.width, danger.height);

    // Gambar Koin
    coins.forEach(coin => {
        ctx.fillStyle = coin.color;
        ctx.fillRect(coin.x, coin.y, coin.width, coin.height);
    });

    // Gambar Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();