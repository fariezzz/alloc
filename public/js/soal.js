const mcqQuestionBank = [
  {
    type:'mcq',
    question: "Manakah pernyataan yang tepat mengenai algoritma First-Fit pada alokasi memori?",
    options: [
      "Memilih partisi dengan ukuran terkecil yang masih memadai untuk proses.",
      "Memilih partisi pertama yang cukup besar untuk menampung proses.",
      "Memilih partisi terbesar yang tersedia untuk proses.",
      "Selalu membagi partisi menjadi blok yang lebih kecil sebelum alokasi."
    ],
    answer: 1,
    explain: "Pada algoritma First-Fit, proses dialokasikan pada partisi pertama (dari awal daftar) yang memiliki ukuran cukup untuk menampung proses tersebut."
  },
  {
    type:'mcq',
    question: "Apa yang dimaksud fragmentasi eksternal?",
    options: [
      "Ruang kosong kecil yang tersebar di antara blok-blok yang digunakan sehingga menghambat alokasi proses besar.",
      "Ruang kosong yang berada di dalam blok yang sudah dialokasikan.",
      "Kehilangan data saat proses berpindah antar partisi.",
      "Kegagalan sistem operasi dalam mengalokasikan memori karena virtual memory penuh."
    ],
    answer: 0,
    explain: "Fragmentasi eksternal adalah kondisi di mana total ruang kosong cukup tetapi tersebar di beberapa bagian sehingga tidak ada bagian tunggal yang cukup besar untuk menampung proses besar."
  },
  {
    type:'mcq',
    question: "Apa tujuan utama algoritma Best-Fit?",
    options: [
      "Mengurangi fragmentasi internal dengan memilih partisi yang paling kecil namun cukup.",
      "Mempercepat proses alokasi dengan memilih partisi pertama.",
      "Mengalokasikan proses ke partisi terakhir saja.",
      "Memastikan setiap partisi terisi minimal satu proses."
    ],
    answer: 0,
    explain: "Best-Fit memilih partisi dengan ukuran terkecil yang masih cukup untuk proses, bertujuan mengurangi sisa ruang (fragmentasi internal) pada partisi tersebut."
  },
  {
    type:'mcq',
    question: "Dalam Worst-Fit, partisi yang dipilih biasanya adalah:",
    options: [
      "Partisi pertama yang cukup besar.",
      "Partisi dengan ukuran tepat sama dengan proses.",
      "Partisi terbesar yang tersedia.",
      "Partisi terkecil yang masih muat."
    ],
    answer: 2,
    explain: "Worst-Fit memilih partisi terbesar yang tersedia untuk mengalokasikan proses, dengan harapan menyisakan partisi cukup besar untuk proses lain."
  },
  {
    type:'mcq',
    question: "Jika sebuah proses tidak muat di partisi manapun, sistem biasanya akan:",
    options: [
      "Menempatkannya ke partisi terkecil yang ada.",
      "Membatalkan proses tersebut atau menunggu pembebasan memori (gagal alokasi).",
      "Membagi proses menjadi beberapa bagian dan menempatkannya di beberapa partisi.",
      "Secara otomatis menambah ukuran semua partisi."
    ],
    answer: 1,
    explain: "Jika tidak ada partisi yang cukup besar, alokasi akan gagal (proses tidak dialokasikan) hingga ada pembebasan memori atau kebijakan lain diterapkan."
  },
  {
    type:'mcq',
    question: "Apa kelemahan umum First-Fit dibanding Best-Fit?",
    options: [
      "First-Fit cenderung lebih lambat daripada Best-Fit.",
      "First-Fit menghasilkan lebih banyak fragmentasi internal di bagian awal daftar.",
      "First-Fit membutuhkan pengurutan partisi sebelum alokasi.",
      "First-Fit selalu menggunakan partisi terkecil."
    ],
    answer: 1,
    explain: "First-Fit dapat meninggalkan banyak sisa kecil pada partisi awal karena selalu memilih partisi pertama yang cukup, sehingga berpotensi meningkatkan fragmentasi pada bagian awal daftar."
  },
  {
    type:'mcq',
    question: "Dalam konteks alokasi memori, istilah 'hole' merujuk ke:",
    options: [
      "Proses yang sedang dieksekusi.",
      "Partisi yang sedang dipakai oleh proses.",
      "Ruang memori kosong (free space) antara blok yang dialokasikan.",
      "Tabel alokasi memori di sistem operasi."
    ],
    answer: 2,
    explain: "Hole adalah istilah yang digunakan untuk menunjukkan area memori kosong yang tersedia untuk alokasi proses."
  },
  
  // --- SOAL BARU 1 ---
  {
    type:'mcq',
    question: "Apa yang dimaksud dengan fragmentasi internal?",
    options: [
      "Ruang kosong yang tersebar di luar partisi.",
      "Ruang yang terbuang di dalam partisi yang dialokasikan karena ukuran proses lebih kecil dari partisi.",
      "Kesalahan memori saat proses mencoba mengakses alamat di luar batasnya.",
      "Kondisi dimana total memori kosong cukup, tetapi tidak bersebelahan."
    ],
    answer: 1,
    explain: "Fragmentasi internal terjadi ketika sebuah partisi dialokasikan untuk proses, namun ukuran proses lebih kecil dari partisi tersebut, sehingga menyisakan ruang tak terpakai 'di dalam' partisi."
  },
  // --- SOAL BARU 2 ---
  {
    type:'mcq',
    question: "Teknik 'compaction' (pemadatan) digunakan untuk mengatasi masalah apa?",
    options: [
      "Fragmentasi internal",
      "Overhead sistem operasi",
      "Fragmentasi eksternal",
      "Alokasi proses yang terlalu lambat"
    ],
    answer: 2,
    explain: "Compaction adalah proses memindahkan semua proses yang sedang berjalan ke satu ujung memori, sehingga menyatukan semua 'hole' (ruang kosong) menjadi satu blok besar. Ini secara langsung mengatasi fragmentasi eksternal."
  },
  // --- SOAL BARU 3 ---
  {
    type:'mcq',
    question: "Manakah algoritma yang cenderung paling lambat dalam proses pencarian partisi?",
    options: [
      "First-Fit",
      "Best-Fit",
      "Worst-Fit",
      "Semua sama cepatnya"
    ],
    answer: 1,
    explain: "Best-Fit dan Worst-Fit harus memeriksa *seluruh* daftar partisi yang tersedia untuk menemukan yang 'terbaik' atau 'terburuk'. First-Fit berhenti begitu menemukan partisi pertama yang cukup, sehingga cenderung lebih cepat."
  },
  // --- SOAL BARU 4 ---
  {
    type:'mcq',
    question: "Algoritma alokasi memori dinamis yang mencoba meninggalkan 'hole' sisa terbesar adalah...",
    options: [
      "First-Fit",
      "Best-Fit",
      "Worst-Fit",
      "Next-Fit"
    ],
    answer: 2,
    explain: "Worst-Fit secara spesifik mencari partisi terbesar. Tujuannya adalah agar sisa dari alokasi (partisi - proses) tetap sebesar mungkin, dengan harapan sisa tersebut masih cukup untuk proses lain."
  },
  // --- SOAL BARU 5 ---
  {
    type:'mcq',
    question: "Metode alokasi memori di mana memori dibagi menjadi blok-blok berukuran tetap disebut...",
    options: [
      "Segmentasi (Segmentation)",
      "Partisi Dinamis (Dynamic Partitioning)",
      "Paging",
      "Buddy System"
    ],
    answer: 2,
    explain: "Paging adalah teknik manajemen memori di mana ruang alamat fisik (memori utama) dibagi menjadi blok-blok berukuran tetap yang disebut 'frames', dan ruang alamat logis (proses) dibagi menjadi blok berukuran sama yang disebut 'pages'."
  },
  // --- SOAL BARU 6 ---
  {
    type:'mcq',
    question: "Kelemahan utama dari alokasi partisi dinamis adalah...",
    options: [
      "Ukuran partisi tidak bisa diubah.",
      "Menghasilkan fragmentasi eksternal seiring waktu.",
      "Membutuhkan perangkat keras khusus.",
      "Hanya bisa menjalankan satu proses dalam satu waktu."
    ],
    answer: 1,
    explain: "Pada partisi dinamis, partisi dibuat sesuai kebutuhan proses. Saat proses selesai dan memori dibebaskan, 'hole' dengan berbagai ukuran tercipta di antara blok yang terisi, yang menyebabkan fragmentasi eksternal."
  },

  // --- SOAL BARU 7 ---
  {
    type:'mcq',
    question: "Apa fungsi utama dari Memory Management Unit (MMU)?",
    options: [
      "Mengelola cache CPU.",
      "Menerjemahkan alamat logis ke alamat fisik.",
      "Menjalankan algoritma First-Fit atau Best-Fit.",
      "Menyimpan tabel partisi."
    ],
    answer: 1,
    explain: "MMU adalah komponen perangkat keras yang bertugas menerjemahkan alamat virtual/logis (yang digunakan oleh CPU dan proses) menjadi alamat fisik (lokasi sebenarnya di RAM)."
  },
  // --- SOAL BARU 8 ---
  {
    type:'mcq',
    question: "Manakah dari berikut ini yang merupakan perbedaan utama antara Paging dan Segmentasi?",
    options: [
      "Paging menggunakan blok berukuran tetap (page), Segmentasi menggunakan blok berukuran variatif (segment).",
      "Paging hanya digunakan di Windows, Segmentasi hanya di Linux.",
      "Paging menyebabkan fragmentasi eksternal, Segmentasi menyebabkan fragmentasi internal.",
      "Paging lebih cepat daripada Segmentasi dalam semua kasus."
    ],
    answer: 0,
    explain: "Perbedaan fundamentalnya adalah ukuran blok. Paging membagi memori fisik menjadi 'frame' berukuran tetap. Segmentasi membagi memori secara logis (misal: kode, data, stack) dengan ukuran yang bervariasi."
  },
  // --- SOAL BARU 9 ---
  {
    type:'mcq',
    question: "Algoritma 'Next-Fit' mirip dengan 'First-Fit', tetapi memiliki satu perbedaan kunci. Apakah itu?",
    options: [
      "Next-Fit selalu memilih partisi terbesar.",
      "Next-Fit memulai pencarian dari lokasi alokasi terakhir, bukan dari awal.",
      "Next-Fit hanya mengizinkan satu proses dalam satu waktu.",
      "Next-Fit mengurutkan partisi dari yang terkecil ke terbesar."
    ],
    answer: 1,
    explain: "First-Fit selalu memindai dari awal daftar. Next-Fit menyimpan 'pointer' ke lokasi terakhir ia mengalokasikan memori, dan memulai pencarian berikutnya dari titik tersebut, yang seringkali lebih cepat."
  },
  // --- SOAL BARU 10 ---
  {
    type:'mcq',
    question: "Teknik 'Buddy System' adalah strategi alokasi yang...",
    options: [
      "Menggabungkan semua proses kecil menjadi satu proses besar.",
      "Selalu mengalokasikan partisi terbesar (Worst-Fit).",
      "Membagi dan menggabungkan blok memori dalam ukuran pangkat 2 (powers-of-2).",
      "Menempatkan proses baru di sebelah 'buddy' (proses) yang sudah ada."
    ],
    answer: 2,
    explain: "Buddy System bekerja dengan membagi blok memori besar menjadi dua 'buddy' yang lebih kecil (misal: 1MB dibagi jadi 512KB + 512KB) hingga ukuran yang pas ditemukan. Ini efisien tetapi bisa menyebabkan fragmentasi internal."
  },
  // --- SOAL BARU 11 ---
  {
    type:'mcq',
    question: "Apa kerugian utama dari teknik 'compaction' (pemadatan) untuk mengatasi fragmentasi eksternal?",
    options: [
      "Membutuhkan memori tambahan yang sangat besar.",
      "Sangat intensif secara komputasi dan memakan waktu (overhead tinggi).",
      "Hanya dapat dilakukan jika tidak ada proses yang berjalan.",
      "Menyebabkan fragmentasi internal yang parah."
    ],
    answer: 1,
    explain: "Compaction mengharuskan sistem untuk menghentikan semua proses, menyalin blok-blok memori besar, dan memperbarui alamat register. Ini adalah operasi yang sangat 'mahal' dan memakan waktu."
  },
  // --- SOAL BARU 12 ---
  {
    type:'mcq',
    question: "Dalam konteks Paging, fragmentasi internal dapat terjadi pada...",
    options: [
      "Setiap page dalam proses.",
      "Hanya pada page pertama dari proses.",
      "Hanya pada page terakhir dari proses.",
      "Tidak pernah terjadi sama sekali."
    ],
    answer: 2,
    explain: "Karena proses jarang sekali memiliki ukuran yang pas kelipatan ukuran page (misal 4096 byte), page terakhir yang dialokasikan seringkali tidak terisi penuh. Ruang sisa di dalam page terakhir inilah yang disebut fragmentasi internal."
  },
  // --- SOAL BARU 13 ---
  {
    type:'mcq',
    question: "Manakah dari teknik berikut yang PALING rentan terhadap fragmentasi EKSTERNAL?",
    options: [
      "Paging Murni (Pure Paging)",
      "Partisi Dinamis (Dynamic Partitioning)",
      "Partisi Statis (Static Partitioning)",
      "Sistem Operasi modern"
    ],
    answer: 1,
    explain: "Partisi Dinamis (seperti First-Fit, Best-Fit, Worst-Fit) secara alami menciptakan 'hole' (ruang kosong) dengan ukuran acak di antara blok yang terisi. Seiring waktu, hole ini menjadi terlalu kecil untuk proses baru, itulah fragmentasi eksternal."
  },
  // --- SOAL BARU 14 ---
  {
    type:'mcq',
    question: "Alamat yang dihasilkan oleh CPU disebut juga...",
    options: [
      "Alamat Fisik (Physical Address)",
      "Alamat Logis (Logical Address)",
      "Alamat MAC (MAC Address)",
      "Alamat Tetap (Fixed Address)"
    ],
    answer: 1,
    explain: "CPU beroperasi dalam ruang alamatnya sendiri, yang disebut alamat logis atau virtual. Alamat ini kemudian diterjemahkan oleh MMU menjadi alamat fisik (lokasi aktual di RAM)."
  },

  {
    type:'mcq',
    question: "Apa tujuan utama dari Memori Virtual (Virtual Memory)?",
    options: [
      "Mengizinkan program berjalan meskipun ukurannya lebih besar dari memori fisik (RAM) yang tersedia.",
      "Mempercepat kecepatan eksekusi CPU secara langsung.",
      "Menghilangkan kebutuhan akan hard drive (penyimpanan sekunder).",
      "Menggantikan fungsi dari Memory Management Unit (MMU)."
    ],
    answer: 0,
    explain: "Tujuan utama Memori Virtual adalah untuk memisahkan memori logis (yang dilihat program) dari memori fisik (RAM). Ini memungkinkan sistem menjalankan program yang lebih besar dari RAM dengan menyimpan bagian yang tidak aktif di disk."
  },
  // --- SOAL BARU 16 ---
  {
    type:'mcq',
    question: "Teknik di mana 'page' (halaman) dari suatu proses hanya dimuat ke memori fisik saat benar-benar dibutuhkan (diakses) disebut...",
    options: [
      "Swapping",
      "Demand Paging (Paging Permintaan)",
      "Compaction",
      "Pre-loading"
    ],
    answer: 1,
    explain: "Demand Paging adalah mekanisme inti dari Memori Virtual. Alih-alih memuat seluruh program saat dimulai, sistem hanya memuat 'page' yang diperlukan, dan 'page' lainnya dimuat 'on demand' (saat terjadi Page Fault)."
  },
  // --- SOAL BARU 17 ---
  {
    type:'mcq',
    question: "Apa yang terjadi jika CPU mencoba mengakses 'page' yang ada di memori logis tetapi belum dimuat ke memori fisik (RAM)?",
    options: [
      "Program akan langsung dihentikan (crash).",
      "Sistem operasi akan mengabaikan instruksi tersebut.",
      "Terjadi 'Page Fault' (Kesalahan Halaman).",
      "Terjadi 'Segmentasi Fault'."
    ],
    answer: 2,
    explain: "Page Fault adalah interupsi (trap) ke sistem operasi. Ini BUKAN error, melainkan mekanisme normal. OS akan menghentikan proses, mencari 'page' di disk, memuatnya ke 'frame' di RAM, dan melanjutkan proses."
  },
  // --- SOAL BARU 18 ---
  {
    type:'mcq',
    question: "Dalam algoritma penggantian halaman (page replacement), algoritma manakah yang mengganti halaman yang telah berada di memori paling lama?",
    options: [
      "LRU (Least Recently Used)",
      "FIFO (First-In, First-Out)",
      "Optimal",
      "Random"
    ],
    answer: 1,
    explain: "FIFO adalah yang paling sederhana. Ia melacak halaman mana yang pertama kali masuk ke memori dan akan mengeluarkannya pertama kali saat terjadi page fault dan memori penuh, seperti antrian."
  },
  // --- SOAL BARU 19 ---
  {
    type:'mcq',
    question: "Algoritma penggantian halaman (page replacement) yang mengganti halaman yang paling lama *tidak digunakan* (not accessed) adalah...",
    options: [
      "FIFO (First-In, First-Out)",
      "Optimal",
      "LRU (Least Recently Used)",
      "LFU (Least Frequently Used)"
    ],
    answer: 2,
    explain: "LRU (Least Recently Used) didasarkan pada prinsip lokalitas: jika sebuah halaman sudah lama tidak diakses, kemungkinan besar ia tidak akan diakses lagi dalam waktu dekat. Ini seringkali lebih efisien daripada FIFO."
  },
  // --- SOAL BARU 20 ---
  {
    type:'mcq',
    question: "Kondisi di mana sistem menghabiskan sebagian besar waktunya hanya untuk memindahkan halaman (swapping) antara RAM dan disk, sehingga kinerja CPU sangat rendah, disebut...",
    options: [
      "Fragmentasi Eksternal",
      "Overhead",
      "Thrashing",
      "Context Switching"
    ],
    answer: 2,
    explain: "Thrashing terjadi ketika sistem memiliki terlalu banyak proses aktif tetapi memori (RAM) tidak mencukupi. Sistem terus-menerus mengalami page fault, menukar halaman keluar-masuk, dan CPU tidak sempat melakukan pekerjaan (eksekusi) yang sebenarnya."
  },
  // --- SOAL BARU 21 ---
  {
    type:'mcq',
    question: "Proses memindahkan *seluruh* proses (atau bagian besar) dari memori utama (RAM) ke penyimpanan sekunder (disk) untuk sementara waktu disebut...",
    options: [
      "Swapping",
      "Paging",
      "Compaction",
      "Context Switching"
    ],
    answer: 0,
    explain: "Swapping adalah teknik manajemen memori dasar. Berbeda dengan 'paging' (yang memindahkan 'page'), 'swapping' secara tradisional merujuk pada pemindahan seluruh proses keluar dari RAM untuk memberi ruang bagi proses lain."
  },

  {
    type:'mcq',
    question: "Diberikan partisi memori: {18KB, 50KB, 22KB, 40KB}. Jika proses 20KB masuk, partisi mana yang akan dipilih oleh algoritma Best-Fit?",
    options: [
      "18KB (Tidak muat)",
      "50KB",
      "22KB",
      "40KB"
    ],
    answer: 2,
    explain: "Best-Fit memilih partisi terkecil yang masih muat (>= 20KB). Dari {50KB, 22KB, 40KB}, yang terkecil adalah 22KB."
  },
  // --- SOAL BARU 23 ---
  {
    type:'mcq',
    question: "Menggunakan skenario yang sama (Partisi: {18KB, 50KB, 22KB, 40KB}, Proses: 20KB), partisi mana yang akan dipilih Worst-Fit?",
    options: [
      "18KB (Tidak muat)",
      "50KB",
      "22KB",
      "40KB"
    ],
    answer: 1,
    explain: "Worst-Fit memilih partisi terbesar yang masih muat (>= 20KB). Dari {50KB, 22KB, 40KB}, yang terbesar adalah 50KB."
  },
  // --- SOAL BARU 24 ---
  {
    type:'mcq',
    question: "Apa kelemahan utama dari algoritma Worst-Fit?",
    options: [
      "Menghasilkan banyak 'hole' kecil yang tersebar (fragmentasi eksternal).",
      "Sangat lambat dalam melakukan pencarian.",
      "Cepat menghabiskan partisi-partisi besar, menyisakan sisa yang mungkin terlalu kecil untuk proses lain.",
      "Menyebabkan fragmentasi internal yang parah."
    ],
    answer: 2,
    explain: "Worst-Fit cenderung menghabiskan partisi besar, dan sisa (remainder) dari alokasi tersebut mungkin masih besar, tetapi 'hole' terbesar di sistem jadi cepat habis."
  },
  // --- SOAL BARU 25 ---
  {
    type:'mcq',
    question: "Sistem Paging murni (Pure Paging) berhasil menghilangkan...",
    options: [
      "Fragmentasi Internal",
      "Fragmentasi Eksternal",
      "Kebutuhan akan MMU",
      "Semua jenis fragmentasi"
    ],
    answer: 1,
    explain: "Karena semua 'frame' di memori fisik berukuran sama dan 'page' bisa ditempatkan di 'frame' manapun yang kosong, Paging tidak memiliki masalah 'hole' yang tersebar (fragmentasi eksternal). Namun, ia masih memiliki fragmentasi internal di 'page' terakhir."
  },
  // --- SOAL BARU 26 ---
  {
    type:'mcq',
    question: "Sebaliknya, Segmentasi (Segmentation) rentan terhadap...",
    options: [
      "Fragmentasi Internal (karena segmen pas dengan proses)",
      "Fragmentasi Eksternal (karena segmen berukuran variatif)",
      "Anomali Belady",
      "Hanya bisa berjalan di satu CPU"
    ],
    answer: 1,
    explain: "Karena segmen memiliki ukuran yang berbeda-beda, saat segmen dimuat dan dikeluarkan dari memori, ia akan menciptakan 'hole' dengan ukuran variatif, yang merupakan definisi dari fragmentasi eksternal."
  },
  // --- SOAL BARU 27 ---
  {
    type:'mcq',
    question: "Dalam sistem Paging, struktur data yang digunakan MMU untuk mencatat pemetaan antara 'page' logis dan 'frame' fisik disebut...",
    options: [
      "File Allocation Table (FAT)",
      "Page Table (Tabel Halaman)",
      "Segment Table (Tabel Segmen)",
      "Process Control Block (PCB)"
    ],
    answer: 1,
    explain: "Page Table adalah 'kamus' atau 'peta' yang digunakan MMU untuk menerjemahkan alamat logis (nomor halaman) menjadi alamat fisik (nomor frame)."
  },
  // --- SOAL BARU 28 ---
  {
    type:'mcq',
    question: "Dalam Paging, satu 'Frame' adalah...",
    options: [
      "Blok memori logis (bagian dari proses) berukuran tetap.",
      "Blok memori fisik (bagian dari RAM) berukuran tetap.",
      "Keseluruhan memori virtual yang tersedia.",
      "Unit eksekusi CPU."
    ],
    answer: 1,
    explain: "Memori Logis (Proses) dibagi menjadi 'Page'. Memori Fisik (RAM) dibagi menjadi 'Frame'. Ukuran Page = Ukuran Frame."
  },
  // --- SOAL BARU 29 ---
  {
    type:'mcq',
    question: "Apa keuntungan utama Segmentasi yang tidak dimiliki Paging murni?",
    options: [
      "Lebih cepat dalam translasi alamat.",
      "Menghilangkan fragmentasi internal.",
      "Mendukung proteksi dan 'sharing' (berbagi pakai) memori secara logis (misal: berbagi 'kode' antar proses).",
      "Tidak membutuhkan perangkat keras khusus."
    ],
    answer: 2,
    explain: "Segmentasi membagi memori berdasarkan pandangan programmer (kode, data, stack). Ini memudahkan OS untuk memberi izin (misal: 'kode' = read-only) atau berbagi segmen 'kode' yang sama di antara banyak proses."
  },
  // --- SOAL BARU 30 ---
  {
    type:'mcq',
    question: "Dalam tabel halaman (page table), 'dirty bit' (atau modify bit) digunakan untuk...",
    options: [
      "Menandai bahwa 'page' tersebut tidak boleh diakses.",
      "Menandai bahwa 'page' tersebut sudah ada di memori fisik (RAM).",
      "Menandai bahwa 'page' tersebut telah diubah (ditulisi) sejak dimuat ke RAM.",
      "Menandai 'page' yang paling sering digunakan."
    ],
    answer: 2,
    explain: "'Dirty bit' diatur ke '1' oleh hardware jika ada operasi 'write' ke halaman tersebut. Ini sangat penting untuk algoritma penggantian halaman."
  },
  // --- SOAL BARU 31 ---
  {
    type:'mcq',
    question: "Mengapa 'dirty bit' (Soal sebelumnya) sangat penting bagi sistem memori virtual?",
    options: [
      "Karena OS bisa tahu 'page' mana yang harus dihapus.",
      "Agar OS tahu bahwa 'page' tersebut tidak perlu ditulis kembali ke disk jika tidak 'dirty' (belum diubah).",
      "Untuk menghitung kecepatan 'page fault'.",
      "Untuk menentukan prioritas proses."
    ],
    answer: 1,
    explain: "Jika sebuah 'page' diganti tetapi 'dirty bit'-nya '0' (bersih/tidak diubah), OS bisa langsung menimpanya tanpa perlu menyalinnya kembali ke disk, sehingga menghemat waktu I/O yang sangat besar."
  },
  // --- SOAL BARU 32 ---
  {
    type:'mcq',
    question: "Algoritma Page Replacement yang mengganti halaman yang *tidak akan* digunakan dalam jangka waktu paling lama di *masa depan* adalah...",
    options: [
      "FIFO (First-In, First-Out)",
      "LRU (Least Recently Used)",
      "Optimal",
      "LFU (Least Frequently Used)"
    ],
    answer: 2,
    explain: "Algoritma Optimal (OPT) memberikan performa terbaik karena melihat ke masa depan. Algoritma ini tidak praktis tetapi digunakan sebagai standar perbandingan (benchmark)."
  },
  // --- SOAL BARU 33 ---
  {
    type:'mcq',
    question: "Mengapa algoritma Optimal (Soal sebelumnya) tidak praktis untuk diimplementasikan di sistem operasi nyata?",
    options: [
      "Terlalu lambat dalam mengambil keputusan.",
      "Membutuhkan perangkat keras (hardware) yang sangat mahal.",
      "Menyebabkan 'Thrashing'.",
      "Sistem operasi tidak dapat memprediksi urutan akses halaman di masa depan secara pasti."
    ],
    answer: 3,
    explain: "Implementasi algoritma Optimal membutuhkan pengetahuan sempurna tentang masa depan (crystal ball), yang tidak mungkin dimiliki oleh sistem operasi."
  },
  // --- SOAL BARU 34 ---
  {
    type:'mcq',
    question: "Kelemahan algoritma FIFO adalah 'Anomali Belady'. Apa itu Anomali Belady?",
    options: [
      "Kondisi dimana 'page' yang baru masuk langsung dikeluarkan lagi.",
      "Kondisi dimana menambah jumlah 'frame' (RAM) justru *memperbanyak* jumlah 'page fault'.",
      "Kondisi dimana algoritma FIFO berjalan lebih lambat dari LRU.",
      "Kondisi 'Thrashing' yang disebabkan oleh FIFO."
    ],
    answer: 1,
    explain: "Secara intuitif, menambah RAM seharusnya mengurangi page fault. Anomali Belady adalah fenomena langka pada FIFO di mana (untuk string referensi tertentu) menambah 'frame' justru memperburuk performa."
  },
  // --- SOAL BARU 35 ---
  {
    type:'mcq',
    question: "Mengapa algoritma LRU (Least Recently Used) lebih sulit diimplementasikan di hardware daripada FIFO?",
    options: [
      "LRU membutuhkan 'queue' (antrian), sedangkan FIFO tidak.",
      "LRU membutuhkan *pencatatan waktu* (timestamp) atau 'stack' untuk melacak kapan setiap 'page' terakhir kali diakses.",
      "LRU hanya bisa diimplementasikan di software.",
      "LRU sering menyebabkan Anomali Belady."
    ],
    answer: 1,
    explain: "FIFO hanya perlu tahu kapan 'page' masuk (antrian sederhana). LRU harus tahu kapan 'page' *diakses*. Ini membutuhkan mekanisme perangkat keras (seperti 'counter' atau 'stack') untuk memperbarui status setiap akses memori, yang lebih kompleks."
  },
  // --- SOAL BARU 36 ---
  {
    type:'mcq',
    question: "Kumpulan 'page' dari suatu proses yang sedang aktif digunakan (diakses secara intensif) pada suatu waktu tertentu disebut...",
    options: [
      "Page Table",
      "Working Set",
      "Swap Space",
      "Cache"
    ],
    answer: 1,
    explain: "Konsep 'Working Set' penting untuk 'Thrashing'. Jika total 'Working Set' dari semua proses melebihi RAM, 'Thrashing' akan terjadi. OS harus memastikan 'Working Set' sebuah proses ada di RAM."
  },
  // --- SOAL BARU 37 ---
  {
    type:'mcq',
    question: "Apa cara paling efektif bagi sistem operasi untuk mengatasi 'Thrashing' (selain menambah RAM fisik)?",
    options: [
      "Menggunakan algoritma FIFO daripada LRU.",
      "Mempercepat kecepatan disk (penyimpanan sekunder).",
      "Mengurangi 'degree of multiprogramming' (menghentikan/men-'suspend' beberapa proses).",
      "Memperbesar ukuran 'page' (halaman)."
    ],
    answer: 2,
    explain: "Thrashing terjadi karena terlalu banyak proses bersaing untuk RAM yang sedikit. Dengan mengurangi jumlah proses yang aktif, OS dapat memastikan proses yang tersisa memiliki cukup 'frame' untuk 'Working Set' mereka, sehingga 'page fault' berkurang drastis."
  },
  // --- SOAL BARU 38 ---
  {
    type:'mcq',
    question: "Manakah dari algoritma alokasi partisi dinamis berikut yang harus memeriksa *seluruh* daftar 'hole' (partisi kosong) sebelum mengambil keputusan?",
    options: [
      "First-Fit dan Next-Fit",
      "Best-Fit dan Worst-Fit",
      "Hanya First-Fit",
      "Hanya Next-Fit"
    ],
    answer: 1,
    explain: "First-Fit berhenti begitu menemukan yang *pertama* muat. Next-Fit juga. Tetapi Best-Fit (terkecil) dan Worst-Fit (terbesar) harus memeriksa *semua* 'hole' untuk memastikan mereka menemukan yang 'terbaik' atau 'terburuk'."
  },
  // --- SOAL BARU 39 ---
  {
    type:'mcq',
    question: "Manakah teknik yang membagi memori berdasarkan *pandangan logis* pengguna (misal: 'blok kode', 'blok data', 'stack')?",
    options: [
      "Paging",
      "Segmentasi",
      "Partisi Dinamis (Misal: First-Fit)",
      "Buddy System"
    ],
    answer: 1,
    explain: "Segmentasi secara unik memetakan cara programmer melihat program (segmen logis) ke memori, bukan membaginya secara arbitrer berdasarkan ukuran tetap (seperti Paging)."
  },
  // --- SOAL BARU 40 ---
  {
    type:'mcq',
    question: "Apa langkah *pertama* yang dilakukan sistem operasi setelah terjadi 'Page Fault'?",
    options: [
      "Langsung mengambil 'page' dari disk.",
      "Menghentikan proses yang salah (crash).",
      "Memeriksa tabel internal untuk memastikan alamat tersebut valid dan legal untuk diakses oleh proses.",
      "Memilih 'page' korban untuk dikeluarkan."
    ],
    answer: 2,
    explain: "Page fault bisa jadi karena akses ilegal (misal: 'segmentation fault') atau karena 'page' memang ada di disk. OS harus memvalidasi alamatnya terlebih dahulu. Jika valid, baru OS mencari 'page' di disk."
  },
  // --- SOAL BARU 41 ---
  {
    type:'mcq',
    question: "Perbedaan utama antara 'Swapping' (tradisional) dan 'Demand Paging' adalah...",
    options: [
      "'Swapping' menggunakan disk, 'Paging' menggunakan RAM.",
      "'Swapping' memindahkan *seluruh proses*, 'Paging' memindahkan *halaman (page)* individual.",
      "'Swapping' lebih cepat daripada 'Paging'.",
      "'Swapping' adalah teknik baru, 'Paging' adalah teknik lama."
    ],
    answer: 1,
    explain: "Swapping (tradisional) menukar seluruh proses keluar-masuk RAM. Demand Paging (sering disebut 'pager') jauh lebih efisien karena hanya memindahkan 'page' (potongan kecil) yang dibutuhkan saja."
  }
];