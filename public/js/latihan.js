// ====== Data MCQ (7 soal) ======
const mcqQuestions = [
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
  }
];

// ====== Drag questions: 3 soal (First-Fit, Best-Fit, Worst-Fit)
function makeMatchingDragQuestion(algo) {
  const randInt = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
  const n = randInt(3,5);
  const partitions = [];
  for (let i=0;i<n;i++){
    partitions.push(randInt(120,500));
  }
  const processes = partitions.map((ps,i)=>{
    const low = Math.max(40, ps - 60);
    const size = Math.min(ps, Math.max(low, Math.floor(ps * (0.7 + Math.random()*0.25))));
    return { name: 'P'+(i+1), size: size };
  });
  return { type:'drag', algo: algo, partitions, processes };
}

const dragQuestions = [
  makeMatchingDragQuestion('First-Fit'),
  makeMatchingDragQuestion('Best-Fit'),
  makeMatchingDragQuestion('Worst-Fit')
];

const allQuestions = [...mcqQuestions, ...dragQuestions];
let index = 0;
const total = allQuestions.length;

// state
const userAnswers = new Array(total).fill(null); // final stored answers (for mcq: index; for drag: map)
const userSelected = new Array(total).fill(null); // temporary selection for MCQ before "Jawab" diklik

// DOM refs
const root = document.getElementById('quizRoot');
const progressText = document.getElementById('progressText');
const nextBtn = document.getElementById('nextBtn');

// render current
function renderCurrent() {
  root.innerHTML = '';

  root.classList.remove("fade-question");
  void root.offsetWidth;
  root.classList.add("fade-question");
  
  progressText.textContent = `Soal ${index+1} dari ${total}`;
  const q = allQuestions[index];
  if (q.type === 'mcq') renderMCQ(q);
  else renderDrag(q);

  // default nextBtn state - actual behavior is handled in global click handler below
  // nextBtn enabled/disabled will be controlled per-render
}

// ----- MCQ renderer -----
function renderMCQ(q) {
  const container = document.createElement('div');
  container.innerHTML = `<h4>Soal ${index+1}:</h4><div style="margin-top:8px;font-weight:600;">${q.question}</div>`;
  const opts = document.createElement('div');
  opts.style.marginTop = '12px';

  let isAnswered = userAnswers[index] !== null;

  q.options.forEach((opt,i)=>{
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.dataset.idx = i;
    // restore selection if userSelected exists
    if (userSelected[index] === i) btn.classList.add('selected');
    // if already answered (final), show selection and disable further changes
    if (isAnswered) {
      if (userAnswers[index] === i) btn.classList.add('selected');
      btn.disabled = true;
    } else {
      btn.addEventListener('click', () => {
        // select (temporary) only if not yet graded
        opts.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        userSelected[index] = i;
        nextBtn.disabled = false; // enable tombol (Jawab)
      });
    }
    opts.appendChild(btn);
  });

  container.appendChild(opts);
  const explainWrap = document.createElement('div');
  explainWrap.id = 'explainWrap';
  container.appendChild(explainWrap);
  root.appendChild(container);

  // UI: button label and state
  if (!isAnswered) {
    nextBtn.textContent = "Jawab";
    nextBtn.disabled = (userSelected[index] === null);
    nextBtn.classList.remove('processing');
  } else {
    // already answered earlier: show explanation and let user go next
    nextBtn.textContent = (index < total-1) ? "Soal Selanjutnya →" : "Lihat Hasil";
    nextBtn.disabled = false;
    showMCQExplain(q, userAnswers[index], container);
  }
}

// show explanation with animation
function showMCQExplain(q, selectedIdx, container) {
  const correctIdx = q.answer;
  const isCorrect = selectedIdx === correctIdx;
  const wrap = container.querySelector('#explainWrap');
  wrap.innerHTML = '';

  const div = document.createElement('div');
  div.className = 'explain animated ' + (isCorrect ? 'correct' : 'wrong');
  div.innerHTML = `
    <strong>${isCorrect ? '✅ Jawaban benar!' : '❌ Jawaban salah.'}</strong>
    <div style="margin-top:8px;">${q.explain}</div>
  `;
  wrap.appendChild(div);

  const optionButtons = container.querySelectorAll('.option-btn');
  optionButtons.forEach((btn, i) => {
    if (i === correctIdx) {
      btn.classList.add('correct-answer');
    } 
    else if (i === selectedIdx && selectedIdx !== correctIdx) {
      btn.classList.add('wrong-answer');
    }
    else {
      btn.classList.add('dimmed-answer');
    }
  });
}


// ----- Drag renderer -----
function renderDrag(q) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `<h4>Soal ${index+1} — Drag & Drop (${q.algo})</h4>
    <div class="small-muted" style="margin-top:6px;">Seret proses dari kanan ke kolom Process sesuai urutan (P1, P2, P3, ...).</div>`;

  const tw = document.createElement('div');
  tw.className = 'tables-wrap';

  const left = document.createElement('div'); left.className='left-area';
  const right = document.createElement('div'); right.className='right-area';

  const pTitle = document.createElement('div'); pTitle.className='small-muted mb-1'; pTitle.textContent = 'Partisi';
  const pTable = document.createElement('table'); pTable.className='partition-table';
  pTable.innerHTML = '<thead><tr><th>Nama</th><th>Ukuran (KB)</th><th>Process</th></tr></thead><tbody></tbody>';
  const pBody = pTable.querySelector('tbody');

  const poolTitle = document.createElement('div'); poolTitle.className='small-muted mb-2'; poolTitle.textContent='Daftar Proses';
  const pool = document.createElement('div'); pool.id='procPool';

  left.appendChild(pTitle); left.appendChild(pTable);
  right.appendChild(poolTitle); right.appendChild(pool);
  tw.appendChild(left); tw.appendChild(right);
  wrapper.appendChild(tw);

  const feedback = document.createElement('div');
  feedback.style.marginTop = '12px';
  wrapper.appendChild(feedback);

  root.appendChild(wrapper);

  // === Setup data
  const PARTS = q.partitions.slice();
  const PROCS = q.processes.map(p=>({...p}));

  // buat tabel partisi
  PARTS.forEach((size,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>Part${i+1}</td><td>${size}</td><td class="process-slot" id="slot-${i}" data-slot="${i}"></td>`;
    pBody.appendChild(tr);
  });

  // buat daftar proses di kanan (harus dikerjakan berurutan)
  PROCS.forEach(proc=>{
    const el = document.createElement('div');
    el.className = 'draggable-process';
    el.draggable = true;
    el.dataset.proc = proc.name;
    el.textContent = `${proc.name} (${proc.size} KB)`;
    el.addEventListener('dragstart', e=> e.dataTransfer.setData('text/plain', proc.name));
    pool.appendChild(el);
  });

  // === Drop logic
  const totalSlots = PARTS.length;

  function onDropHandler(ev) {
  ev.preventDefault();
  const td = ev.currentTarget;
  td.classList.remove('drop-hover');
  const procName = ev.dataTransfer.getData('text/plain');
  if (!procName) return;

  // urutan wajib sesuai (P1, lalu P2, dst)
  const expectedProc = getNextExpectedProc();
  if (procName !== expectedProc) {
    showHint(`💡 Harap masukkan ${expectedProc} terlebih dahulu sebelum ${procName}.`);
    return;
  }

  // Jika slot sudah berisi proses, jangan ganti langsung
  if (td.dataset.proc) {
    showHint(`❗ Slot ini sudah diisi (${td.dataset.proc}). Hapus dulu sebelum mengganti.`);
    return;
  }

  // Hapus dari daftar proses di kanan
  const el = pool.querySelector(`[data-proc="${procName}"]`);
  if (el) el.remove();

  // Tampilkan proses + tombol hapus (minimalis)
  td.dataset.proc = procName;
  td.innerHTML = `
    <div class="slot-content">
      <span class="proc-label">${procName}</span>
      <button class="remove-btn" title="Hapus">✕</button>
    </div>
  `;
  td.classList.add('filled');
  setTimeout(() => td.classList.remove('filled'), 400);

    // Tambahkan aksi tombol hapus
    const removeBtn = td.querySelector('.remove-btn');
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      // Dapatkan nama proses yang dihapus, misalnya "P2"
      const removedProc = procName;
      const removedNum = parseInt(removedProc.substring(1)); // 2 dari P2

      // Fungsi bantu untuk hapus dengan animasi
      function animateRemove(slot, name) {
        slot.classList.add('removing');
        setTimeout(() => {
          slot.classList.remove('removing');
          slot.innerHTML = '';
          delete slot.dataset.proc;
          addToPool(name);
        }, 380); // sedikit di bawah 0.4s agar sinkron
      }

      // 🔹 Hapus proses yang diklik
      animateRemove(td, removedProc);

      // 🔹 Hapus juga semua proses setelahnya (P3, P4, dst) jika sudah di tabel
      Array.from(document.querySelectorAll('.process-slot')).forEach(slot => {
        const name = slot.dataset.proc;
        if (name) {
          const num = parseInt(name.substring(1));
          if (num > removedNum) {
            animateRemove(slot, name);
          }
        }
      });
    });



  // Evaluasi otomatis jika semua slot terisi
  const filled = Array.from(document.querySelectorAll('.process-slot')).every(s => s.dataset.proc);
  if (filled) evaluateDragAnswer();
 }



  function addToPool(name) {
    if (pool.querySelector(`[data-proc="${name}"]`)) return;
    const procObj = PROCS.find(p=>p.name===name);
    if (!procObj) return;
    const el = document.createElement('div');
    el.className = 'draggable-process';
    el.draggable = true;
    el.dataset.proc = procObj.name;
    el.textContent = `${procObj.name} (${procObj.size} KB)`;
    el.addEventListener('dragstart', e=> e.dataTransfer.setData('text/plain', procObj.name));
    pool.appendChild(el);
  }

  // deteksi proses berikutnya yang harus dijawab
  function getNextExpectedProc() {
    const used = Array.from(document.querySelectorAll('.process-slot')).map(s => s.dataset.proc).filter(Boolean);
    return PROCS[used.length]?.name || null;
  }

  // pesan hint kecil
  function showHint(msg) {
    let hintBox = document.getElementById('drag-hint');
    if (!hintBox) {
      hintBox = document.createElement('div');
      hintBox.id = 'drag-hint';
      hintBox.style.marginTop = '10px';
      hintBox.style.color = '#ffd580';
      hintBox.style.fontStyle = 'italic';
      wrapper.insertBefore(hintBox, feedback);
    }
    hintBox.textContent = msg;
    hintBox.style.opacity = '1';
    setTimeout(() => { hintBox.style.opacity = '0'; }, 1500);
  }

  // event handlers untuk slot
  for (let i=0;i<totalSlots;i++){
    const slot = document.getElementById(`slot-${i}`);
    slot.addEventListener('dragover', e=> e.preventDefault());
    slot.addEventListener('dragenter', ()=> slot.classList.add('drop-hover'));
    slot.addEventListener('dragleave', ()=> slot.classList.remove('drop-hover'));
    slot.addEventListener('drop', onDropHandler);
  }

  // perhitungan hasil
  function computeExpected(parts, procs, algo) {
    const assign = {}; 
    const used = new Array(parts.length).fill(false);
    const waiting = []; // proses yang tidak teralokasi

    if (algo === 'First-Fit') {
      for (const pr of procs) {
        let placed = false;
        for (let i = 0; i < parts.length; i++) {
          if (!used[i] && parts[i] >= pr.size) {
            assign[i] = pr.name;
            used[i] = true;
            placed = true;
            break;
          }
        }
        if (!placed) waiting.push(pr.name);
      }
    } else if (algo === 'Best-Fit') {
      for (const pr of procs) {
        let best = -1, bestRem = Infinity;
        for (let i = 0; i < parts.length; i++) {
          if (!used[i] && parts[i] >= pr.size) {
            const rem = parts[i] - pr.size;
            if (rem < bestRem) {
              bestRem = rem;
              best = i;
            }
          }
        }
        if (best !== -1) {
          assign[best] = pr.name;
          used[best] = true;
        } else waiting.push(pr.name);
      }
    } else { // Worst-Fit
      for (const pr of procs) {
        let worst = -1, worstRem = -1;
        for (let i = 0; i < parts.length; i++) {
          if (!used[i] && parts[i] >= pr.size) {
            const rem = parts[i] - pr.size;
            if (rem > worstRem) {
              worstRem = rem;
              worst = i;
            }
          }
        }
        if (worst !== -1) {
          assign[worst] = pr.name;
          used[worst] = true;
        } else waiting.push(pr.name);
      }
    }

    return { assign, waiting };
  }


  // evaluasi jawaban
  function evaluateDragAnswer() {
  pBody.querySelectorAll('.process-slot').forEach(s => { 
    s.classList.remove('correct','wrong'); 
    const old=s.querySelector('.expected-hint'); 
    if(old) old.remove(); 
  });

  const { assign, waiting } = computeExpected(PARTS, PROCS, q.algo);

  let correctCount = 0;
  let totalSlots = PARTS.length;

  for (let i = 0; i < totalSlots; i++) {
    const slot = document.getElementById(`slot-${i}`);
    const assigned = slot.dataset.proc || null;
    const expectedProc = assign[i] || null;

    if (expectedProc && assigned === expectedProc) {
      correctCount++;
      slot.classList.add('correct');
    } else if (!expectedProc && !assigned) {
      slot.classList.add('neutral');
    } else {
      slot.classList.add('wrong');
      const hint = document.createElement('div');
      hint.className = 'expected-hint';
      hint.textContent = `→ seharusnya: ${expectedProc || '-'}`;
      slot.appendChild(hint);
    }
  }

  const pct = Math.round((correctCount / totalSlots) * 100);

  // Buat ringkasan evaluasi
  let html = `<strong>Hasil: ${pct}% benar (${correctCount}/${totalSlots}).</strong>
  <div style="margin-top:8px;">Algoritma ${q.algo} menempatkan proses berdasarkan urutan P1, P2, P3, ...</div>`;

  if (waiting.length > 0) {
    html += `<div class="waiting-box"><strong>⚠️ Proses waiting:</strong> ${waiting.join(', ')} (tidak cukup ruang memori)</div>`;
  }

  const explainDiv = document.createElement('div');
  explainDiv.className = 'explain fade-in ' + (pct === 100 ? 'correct' : (pct >= 60 ? 'neutral' : 'wrong'));
  explainDiv.innerHTML = html;

  feedback.innerHTML = '';
  feedback.appendChild(explainDiv);

  const map = {};
  for (let i = 0; i < totalSlots; i++) {
  const slot = document.getElementById(`slot-${i}`);
  map[i] = slot.dataset.proc || null;
  }

  // Simpan jawaban user
  userAnswers[index] = map;

  // 🔒 Hapus semua tombol hapus setelah evaluasi
  document.querySelectorAll('.remove-btn').forEach(btn => btn.remove());

  // 🔹 Sembunyikan daftar proses setelah evaluasi
  const processPool = document.querySelector('.right-area');
  if (processPool) {
    processPool.style.display = 'none';
  }


  // Aktifkan tombol Next
  nextBtn.disabled = false;

  }


  // restore jawaban sebelumnya (jika ada)
  if (userAnswers[index]) {
    const prev = userAnswers[index];
    for (let i=0;i<totalSlots;i++){
      const val = prev[i];
      if (val) {
        const slot = document.getElementById(`slot-${i}`);
        slot.textContent = val;
        slot.dataset.proc = val;
        const rem = pool.querySelector(`[data-proc="${val}"]`); if (rem) rem.remove();
      }
    }
    evaluateDragAnswer();
  } else {
    nextBtn.textContent = (index < total-1) ? "Soal Selanjutnya →" : "Lihat Hasil";
    nextBtn.disabled = true;
  }
}


// global next button behavior (delegator)
nextBtn.addEventListener('click', ()=> {
  const q = allQuestions[index];

  if (q.type === 'mcq') {
  // jika belum dijawab
  if (userAnswers[index] === null) {
    // pastikan user memilih opsi
    const chosen = userSelected[index];
    if (chosen === null) {
      const selBtn = root.querySelector('.option-btn.selected');
      if (selBtn) userSelected[index] = parseInt(selBtn.dataset.idx, 10);
    }
    if (userSelected[index] === null) return;

    // 🔒 Kunci semua tombol opsi selama proses pemeriksaan (langsung meredup)
    const optionButtons = root.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('locked');
    });


    // 🔸 Langsung sembunyikan tombol begitu diklik
    nextBtn.style.display = 'none';

    // tampilkan animasi loading di area penjelasan
    const explainWrap = root.querySelector('#explainWrap');
    if (explainWrap) {
      explainWrap.innerHTML = `<div class="loading-anim">⏳ Memeriksa jawaban...</div>`;
    }

    // simulasi proses pemeriksaan (delay 900 ms)
    setTimeout(() => {
      // nilai jawaban
      const selectedIdx = userSelected[index];
      userAnswers[index] = selectedIdx;
      const container = root.firstElementChild;
      showMCQExplain(q, selectedIdx, container);

      // 🔹 tampilkan kembali tombol dengan teks baru
      nextBtn.textContent = (index < total - 1)
        ? "Soal Selanjutnya →"
        : "Lihat Hasil";
      nextBtn.style.display = 'inline-block';
      nextBtn.disabled = false;
    }, 900);
  } else {
    // sudah dijawab → lanjut ke soal berikutnya
    if (index < total - 1) {
      index++;
      renderCurrent();
    } else {
      showSummary();
    }
  }
 }else {
    // drag or other: original behavior (next if last or summary)
    if (index < total-1) {
      index++;
      renderCurrent();
    } else {
      showSummary();
    }
  }
});

// summary remains same as before
function showSummary() {
  let mcqCorrect = 0;
  for (let i=0;i<mcqQuestions.length;i++){
    const ans = userAnswers[i];
    if (ans !== null && ans === mcqQuestions[i].answer) mcqCorrect++;
  }

  // drag scoring
  let dragCorrectSlots = 0, dragTotalSlots = 0;
  for (let k=0;k<dragQuestions.length;k++){
    const qIdx = mcqQuestions.length + k;
    const q = allQuestions[qIdx];
    const ua = userAnswers[qIdx];
    if (!ua) continue;

    const expected = computeExpectedSummary(q.partitions, q.processes, q.algo);
    for (const sIdx in ua) {
      dragTotalSlots++;
      const assigned = ua[sIdx];
      const expectedProc = expected[sIdx] || null;
      if ((expectedProc && assigned === expectedProc) || (!expectedProc && !assigned)) {
        dragCorrectSlots++;
      }
    }
  }

  const totalCorrect = mcqCorrect + dragCorrectSlots;
  const totalPossible = mcqQuestions.length + dragTotalSlots;
  const percent = totalPossible ? Math.round((totalCorrect/totalPossible)*100) : 0;
  const angle = (percent / 100) * 360;

  root.innerHTML = `
    <div class="result-wrapper">
      <div class="result-title">Hasil Akhir Latihan</div>
      <div class="result-subtitle">Berikut ringkasan performa Anda</div>

      <div class="score-ring" style="--score-angle:${angle}deg;">
        <div class="score-text">${percent}%</div>
      </div>

      <div class="breakdown-box">
        <strong>📝 Soal Pilihan Ganda</strong>
        <div class="breakdown-small">${mcqCorrect} benar dari ${mcqQuestions.length} soal</div>
      </div>

      <div class="breakdown-box">
        <strong>🧩 Soal Drag & Drop</strong>
        <div class="breakdown-small">${dragCorrectSlots} benar dari ${dragTotalSlots} slot</div>
      </div>

      <button id="restartBtn" class="btn-restart">Ulangi Latihan</button>
    </div>
  `;

  nextBtn.disabled = true;
  nextBtn.style.display = 'none';
  progressText.style.display = "none";


  document.getElementById('restartBtn').addEventListener('click', () => {
    index = 0;
    for (let i=0;i<userAnswers.length;i++) userAnswers[i] = null;
    for (let i=0;i<userSelected.length;i++) userSelected[i] = null;

    // regen drag questions
    for (let k=0; k<3; k++){
      allQuestions[mcqQuestions.length + k] = makeMatchingDragQuestion(['First-Fit','Best-Fit','Worst-Fit'][k]);
    }

    renderCurrent();
    progressText.style.display = "block";
    nextBtn.style.display = 'inline-block';
  });
}

function computeExpectedSummary(parts, procs, algo){
  const assign = {};
  const used = new Array(parts.length).fill(false);

  if (algo === 'First-Fit') {
    for (const pr of procs){
      for (let i=0;i<parts.length;i++){
        if (!used[i] && parts[i] >= pr.size){
          assign[i] = pr.name;
          used[i] = true;
          break;
        }
      }
    }
  } else if (algo === 'Best-Fit') {
    for (const pr of procs){
      let best = -1, bestRem = Infinity;
      for (let i=0;i<parts.length;i++){
        if (!used[i] && parts[i] >= pr.size){
          const rem = parts[i] - pr.size;
          if (rem < bestRem){
            bestRem = rem;
            best = i;
          }
        }
      }
      if (best !== -1){
        assign[best] = pr.name;
        used[best] = true;
      }
    }
  } else {
    for (const pr of procs){
      let worst = -1, worstRem = -1;
      for (let i=0;i<parts.length;i++){
        if (!used[i] && parts[i] >= pr.size){
          const rem = parts[i] - pr.size;
          if (rem > worstRem){
            worstRem = rem;
            worst = i;
          }
        }
      }
      if (worst !== -1){
        assign[worst] = pr.name;
        used[worst] = true;
      }
    }
  }
  return assign;
}


// initial
renderCurrent();
