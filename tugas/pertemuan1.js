const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 1. Menggambar Player (warna, ukuran, dan posisi diubah dari default)
ctx.fillStyle = "lime";
ctx.fillRect(50, 200, 60, 60);

// 2. Menggambar Objek Target 1
ctx.fillStyle = "red";
ctx.fillRect(600, 300, 30, 30);

// 3. Menggambar Objek Target 2 (memenuhi challenge menggambar 3 objek sekaligus)
ctx.fillStyle = "gold";
ctx.fillRect(380, 120, 40, 40);