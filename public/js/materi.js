// === Fungsi navigasi antar sub-page di materi.html ===
function showPage(id, event) {
  // Sembunyikan semua section
  document.querySelectorAll('section').forEach(section => {
    section.classList.remove('active');
  });

  // Tampilkan section yang dipilih
  const targetSection = document.getElementById(id);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Atur tombol aktif di menu navigasi (nav-pills)
  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.classList.remove('active');
  });
  if (event && event.target) {
    event.target.classList.add('active');
  }

  // Scroll ke atas saat berpindah halaman
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// === Jalankan setelah DOM siap ===
document.addEventListener("DOMContentLoaded", () => {
  // Aktifkan section pertama (Pendahuluan) secara default jika belum ada yang aktif
  const firstSection = document.querySelector('section');
  if (firstSection && !document.querySelector('section.active')) {
    firstSection.classList.add('active');
  }

  // Pastikan navbar sudah termuat dari template.js
  const navbarContainer = document.getElementById("navbar-container");
  if (navbarContainer && typeof loadNavbar === "function") {
    loadNavbar(); // fungsi ini berasal dari ../assets/js/template.js
  }
});


 // JavaScript sederhana untuk toggle jawaban
    document.getElementById("toggleJawabanBtn").addEventListener("click", function () {
      const jawaban = document.getElementById("jawabanContainer");
      const btn = document.getElementById("toggleJawabanBtn");

      if (jawaban.style.display === "none") {
        jawaban.style.display = "block";
        btn.textContent = "❌ Sembunyikan Jawaban";
      } else {
        jawaban.style.display = "none";
        btn.textContent = "🔍 Tampilkan Jawaban";
      }
    });