const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 1. Menggambar Player (Warna, ukuran, dan posisi sudah diubah)
ctx.fillStyle = "lime"; // Mengubah warna player menjadi hijau
ctx.fillRect(50, 200, 60, 60); // x: 50, y: 200, lebar: 60, tinggi: 60

// 2. Menggambar Objek Target
ctx.fillStyle = "red"; // Warna target berbeda (merah)
ctx.fillRect(600, 300, 30, 30); // Posisi target jauh dari player