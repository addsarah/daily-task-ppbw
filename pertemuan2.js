// PERTEMUAN 2 - Membuat Player Bergerak dengan JavaScript
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Player sebagai object (warna, ukuran, dan speed bisa kamu ubah)
const player = {
  x: 100,
  y: 100,
  width: 40,
  height: 40,
  speed: 5,
  color: "lime"
};

// Gambar ulang seluruh canvas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Membaca input keyboard
document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowRight") player.x += player.speed;
  if (event.key === "ArrowLeft")  player.x -= player.speed;
  if (event.key === "ArrowUp")    player.y -= player.speed;
  if (event.key === "ArrowDown")  player.y += player.speed;

  // Mencegah halaman ikut ter-scroll saat menekan tombol panah
  if (event.key.startsWith("Arrow")) event.preventDefault();

  // Batas area: player tidak boleh keluar dari canvas
  if (player.x < 0) player.x = 0;
  if (player.y < 0) player.y = 0;
  if (player.x + player.width > canvas.width)   player.x = canvas.width - player.width;
  if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

  draw();
});

draw(); // gambar pertama kali
