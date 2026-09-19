// ==========================================
// 1. LOGIKA JAM REAL-TIME (FITUR 4)
// ==========================================
function updateTime() {
    const timeEl = document.getElementById('current-time');
    const dateEl = document.getElementById('current-date');
    const container = document.getElementById('time-container');
    
    const now = new Date();
    
    // Format waktu HH:MM:SS
    const timeString = now.toLocaleTimeString('id-ID', { hour12: false });
    
    // Format hari dan tanggal menggunakan bahasa Indonesia
    const dateString = now.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
    });
    
    if (timeEl && dateEl && container) {
        timeEl.textContent = timeString;
        dateEl.textContent = dateString;
        container.setAttribute('datetime', now.toISOString());
    }
    
    requestAnimationFrame(updateTime);
}

updateTime();


// ==========================================
// 2. ARSITEKTUR OOP & GAME LOOP (DENGAN PLAY, PAUSE, RESTART)
// ==========================================

class Player {
    constructor(canvasWidth, canvasHeight) {
        this.width = 80;
        this.height = 20;
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - 40;
        this.speed = 7;
        this.dx = 0;
        this.canvasWidth = canvasWidth;
    }

    draw(ctx) {
        ctx.fillStyle = "#00ff88";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = "#161c8f";
        ctx.fillRect(this.x + 10, this.y + 5, this.width - 20, 5);
    }

    update() {
        this.x += this.dx;

        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > this.canvasWidth) {
            this.x = this.canvasWidth - this.width;
        }
    }

    reset(canvasWidth) {
        this.x = (canvasWidth - this.width) / 2;
        this.dx = 0;
    }

    moveLeft() {
        this.dx = -this.speed;
    }

    moveRight() {
        this.dx = this.speed;
    }

    stop() {
        this.dx = 0;
    }
}

class Target {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.reset();
    }

    reset() {
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (this.canvasWidth - this.width);
        this.y = -this.height;
        this.speed = 3 + Math.random() * 3;
    }

    draw(ctx) {
        ctx.fillStyle = "#ff3333";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;

        if (this.y > this.canvasHeight) {
            this.reset();
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 600;
        this.canvas.height = 400;

        this.player = new Player(this.canvas.width, this.canvas.height);
        this.target = new Target(this.canvas.width, this.canvas.height);
        
        this.score = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.animationId = null;

        this.loop = this.loop.bind(this);
        this.initInput();
    }

    initInput() {
        window.addEventListener("keydown", (e) => {
            if (!this.isPlaying || this.isPaused) return;
            if (e.key === "ArrowLeft" || e.key === "a") {
                this.player.moveLeft();
            } else if (e.key === "ArrowRight" || e.key === "d") {
                this.player.moveRight();
            }
        });

        window.addEventListener("keyup", (e) => {
            if (e.key === "ArrowLeft" || e.key === "a" || e.key === "ArrowRight" || e.key === "d") {
                this.player.stop();
            }
        });
    }

    checkCollision() {
        if (
            this.target.x < this.player.x + this.player.width &&
            this.target.x + this.target.width > this.player.x &&
            this.target.y < this.player.y + this.player.height &&
            this.target.y + this.target.height > this.player.y
        ) {
            this.score += 1;
            this.target.reset();
        }
    }

    clearScreen() {
        this.ctx.fillStyle = "#121212";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawUI() {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "20px 'Segoe UI', sans-serif";
        this.ctx.fillText(`Skor: ${this.score}`, 20, 30);

        if (!this.isPlaying && !this.isPaused) {
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = "#00ff88";
            this.ctx.font = "28px 'Segoe UI', sans-serif";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Tekan 'Mainkan' untuk Memulai", this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.textAlign = "left"; // Reset alignment
        } else if (this.isPaused) {
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = "#ffcc00";
            this.ctx.font = "32px 'Segoe UI', sans-serif";
            this.ctx.textAlign = "center";
            this.ctx.fillText("GAME DIJEDA (PAUSED)", this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.textAlign = "left";
        }
    }

    loop() {
        if (!this.isPlaying) return;

        if (!this.isPaused) {
            this.clearScreen();
            this.player.update();
            this.target.update();
            this.checkCollision();
        }

        this.player.draw(this.ctx);
        this.target.draw(this.ctx);
        this.drawUI();

        if (this.isPlaying) {
            this.animationId = requestAnimationFrame(this.loop);
        }
    }

    play() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.isPaused = false;
            this.loop();
        } else if (this.isPaused) {
            this.isPaused = false;
            this.loop();
        }
    }

    pause() {
        if (this.isPlaying && !this.isPaused) {
            this.isPaused = true;
            cancelAnimationFrame(this.animationId);
            // Render ulang sekali untuk memunculkan teks "PAUSED"
            this.clearScreen();
            this.player.draw(this.ctx);
            this.target.draw(this.ctx);
            this.drawUI();
        }
    }

    restart() {
        cancelAnimationFrame(this.animationId);
        this.score = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.player.reset(this.canvas.width);
        this.target.reset();
        
        // Render layar awal bersih
        this.clearScreen();
        this.player.draw(this.ctx);
        this.target.draw(this.ctx);
        this.drawUI();
    }
}

// Inisialisasi global agar fungsi tombol HTML onclick dapat mengakses instance game
window.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("gameCanvas")) {
        window.gameInstance = new Game();
        window.gameInstance.restart(); // Render kondisi awal layar hitam dengan teks panduan
    }
});