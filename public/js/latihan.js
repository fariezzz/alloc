// ====== Drag questions: 3 soal (First-Fit, Best-Fit, Worst-Fit)
function makeMatchingDragQuestion(algo) {
  const randInt = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
  const n = randInt(4, 6);
  const partitions = [];
  for (let i=0;i<n;i++){
    partitions.push(randInt(120,500));
  }
  let processes = partitions.map((ps,i)=>{
    const low = Math.max(40, ps - 60);
    // Buat proses yang ukurannya pas
    const size = Math.min(ps, Math.max(low, Math.floor(ps * (0.7 + Math.random()*0.25))));
    // Beri nama sementara (akan diganti setelah diacak)
    return { name: 'temp'+i, size: size };
  });

  processes = shuffleArray(processes);

  processes.forEach((proc, i) => {
    proc.name = 'P' + (i + 1);
  });

  return { type:'drag', algo: algo, partitions, processes };
}

// (BARU) Fungsi untuk mengacak array (Fisher-Yates shuffle)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// (BARU) Fungsi untuk memilih N soal MCQ acak dari bank
function selectRandomMcqs(bank, num) {
  const shuffled = shuffleArray([...bank]); // Acak salinan bank soal
  return shuffled.slice(0, num); // Ambil 'num' soal pertama
}


// (DIMODIFIKASI) Variabel Global
let isAdminLoggedIn = false; 
let currentDragProcs = [];
let currentDragTotal = 0;
let allQuestions = []; // Akan diisi oleh setupQuiz()
let index = 0;
const numMcqToSelect = 7; // Tetapkan jumlah soal MCQ
const numDragToSelect = 3; // Tetapkan jumlah soal Drag
const total = numMcqToSelect + numDragToSelect; // Total soal tetap (10)
let isEvaluating = false;

// state (Ini sudah benar, ukurannya tetap 'total')
const userAnswers = new Array(total).fill(null); 
const userSelected = new Array(total).fill(null);

// DOM refs
const root = document.getElementById('quizRoot');
const progressText = document.getElementById('progressText');
const nextBtn = document.getElementById('nextBtn');
const progressWrapper = document.getElementById('progressWrapper');
const progressBarInner = document.getElementById('progressBarInner');

// (BARU) Fungsi untuk mengatur/mengatur ulang kuis
function setupQuiz() {
  // 1. Pilih 7 soal MCQ acak dari bank
  const activeMcqQuestions = selectRandomMcqs(mcqQuestionBank, numMcqToSelect);
  
  // 2. Buat 3 soal Drag baru
  const activeDragQuestions = [
    makeMatchingDragQuestion('First-Fit'),
    makeMatchingDragQuestion('Best-Fit'),
    makeMatchingDragQuestion('Worst-Fit')
  ];
  
  // 3. Gabungkan keduanya
  allQuestions = [...activeMcqQuestions, ...activeDragQuestions];
  
  // 4. Reset semua state
  index = 0;
  userAnswers.fill(null);
  userSelected.fill(null);
  
  // (Pastikan tombol next kembali ke state awal jika diperlukan)
  nextBtn.disabled = true;
  nextBtn.style.display = 'inline-block';

 if (document.getElementById("adminBtn") || document.getElementById("adminToolbar")) { 
     updateAdminButtonUI(); 
  }
}

function computeExpected(parts, procs, algo) {
    const assign = {};
    const used = new Array(parts.length).fill(false);
    const waiting = [];

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

// render current
function renderCurrent() {
  window.solveCurrentDrag = null;


  root.innerHTML = '';

  const adminBtn = document.getElementById("adminBtn");
  if (adminBtn) {
    if (isAdminLoggedIn) {
      adminBtn.style.display = 'none';
    } else {
      if (index === 0) {
        adminBtn.style.display = 'inline-flex';
      } else {
        adminBtn.style.display = 'none';
      }
    }
  }

  root.classList.remove("fade-question");
  void root.offsetWidth;
  root.classList.add("fade-question");
  
  progressText.textContent = `Soal ${index+1} dari ${total}`;

  if (progressBarInner) { 
    // Hitung persentase progres. (index 0 -> soal 1)
    const percent = ((index + 1) / total) * 100;
    progressBarInner.style.width = percent + '%';
  }
  // (BARU) Pastikan wrapper terlihat (jika sebelumnya disembunyikan oleh summary)
  if (progressWrapper) progressWrapper.style.display = 'block';

  const q = allQuestions[index];
  if (q.type === 'mcq') renderMCQ(q);
  else renderDrag(q);

  if (isAdminLoggedIn) {
    renderAdminToolbar();
  }

  // default nextBtn state - actual behavior is handled in global click handler below
  // nextBtn enabled/disabled will be controlled per-render
}

// ----- MCQ renderer -----
function renderMCQ(q) {
  const container = document.createElement('div');
  container.innerHTML = `<h4>Soal ${index+1} :</h4><div style="margin-top:8px;font-weight:600;">${q.question}</div>`;
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
  wrap.innerHTML = ''; // Bersihkan wrapper

  // 1. Buat div status sederhana (yang akan langsung terlihat)
  const simpleStatusDiv = document.createElement('div');
  simpleStatusDiv.className = 'simple-status animated ' + (isCorrect ? 'correct' : 'wrong');
  const icon = isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
  const text = isCorrect ? 'Jawaban benar!' : 'Jawaban salah.';
  
  simpleStatusDiv.innerHTML = `
    <span>
      <i class="bi ${icon} status-icon"></i> ${text}
    </span>
    <button class="btn-toggle-detail">Lihat Analisis Jawaban</button>
  `;

  // ================== PEROMBAKAN KOTAK DETAIL ==================
  
  // 2. (BARU) Buat div penjelasan detail (yang akan tersembunyi)
  const detailExplainDiv = document.createElement('div');
  detailExplainDiv.className = 'explain animated ' + (isCorrect ? 'correct' : 'wrong');
  detailExplainDiv.id = 'mcqDetailExplain'; // ID unik untuk di-toggle
  detailExplainDiv.style.display = 'none'; // Sembunyikan secara default

  // Ambil teks jawaban untuk ditampilkan
  const userAnsText = q.options[selectedIdx];
  const correctAnsText = q.options[correctIdx];

  // (BARU) Bangun HTML yang rapi menggunakan style yang sudah ada
  let detailHtml = '<h3 class="eval-heading">Analisis Jawaban</h3>';

  // Bagian 1: Jawaban Anda
  detailHtml += `
    <div class="eval-section ${isCorrect ? 'eval-correct' : 'eval-wrong'}">
      <strong>Jawaban Anda:</strong>
      <div class="mcq-detail-text">${userAnsText}</div>
    </div>
  `;

  // Bagian 2: Jawaban Benar (hanya tampil jika Anda salah)
  if (!isCorrect) {
    detailHtml += `
      <div class="eval-section eval-correct">
        <strong>Jawaban Benar:</strong>
        <div class="mcq-detail-text">${correctAnsText}</div>
      </div>
    `;
  }

  // Bagian 3: Penjelasan (selalu tampil)
  detailHtml += `
    <div class="eval-section eval-neutral">
      <strong>Penjelasan:</strong>
      <div class="mcq-detail-text">${q.explain}</div>
    </div>
  `;
  
  detailExplainDiv.innerHTML = detailHtml;
  // ================ AKHIR PEROMBAKAN ================

  // 3. Tambahkan keduanya ke wrapper
  wrap.appendChild(simpleStatusDiv);
  wrap.appendChild(detailExplainDiv);

  // 4. (BARU) Tambahkan event listener ke tombol toggle
  simpleStatusDiv.querySelector('.btn-toggle-detail').addEventListener('click', (e) => {
      const detailBox = container.querySelector('#mcqDetailExplain'); 
      const btn = e.target;
      if (detailBox.style.display === 'none') {
          detailBox.style.display = 'block';
          btn.textContent = 'Sembunyikan Analisis';
      } else {
          detailBox.style.display = 'none';
          btn.textContent = 'Lihat Analisis Jawaban';
      }
  });

  // Logika untuk mewarnai tombol opsi (ini tidak berubah)
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
    <div class="small-muted" style="margin-top:6px;">Seret proses ke partisi atau ke tabel waiting time.</div>`;

  const tw = document.createElement('div');
  tw.className = 'tables-wrap';

  const left = document.createElement('div'); left.className='left-area';
  const right = document.createElement('div'); right.className='right-area';

  const pTitle = document.createElement('div'); pTitle.className='small-muted mb-1'; pTitle.textContent = 'Partisi';
  const pTable = document.createElement('table'); pTable.className='partition-table';
  pTable.innerHTML = '<thead><tr><th>Nama</th><th>Ukuran (KB)</th><th>Proses</th></tr></thead><tbody></tbody>';
  const pBody = pTable.querySelector('tbody');

  const poolTitle = document.createElement('div'); poolTitle.className='small-muted mb-2'; poolTitle.textContent='Daftar Proses';
  const pool = document.createElement('div'); pool.id='procPool';

  left.appendChild(pTitle); left.appendChild(pTable);

  // waiting table (dropzone)
  const waitingWrap = document.createElement('div');
  waitingWrap.style.marginTop = '14px';
  waitingWrap.innerHTML = `
    <div class="small-muted mb-1">Waiting Time</div>
    <table class="partition-table">
      <thead><tr><th>Proses</th></tr></thead>
      <tbody id="waitingBody" class="waiting-dropzone"><tr><td>-</td></tr></tbody>
    </table>
  `;
  left.appendChild(waitingWrap);

  right.appendChild(poolTitle); right.appendChild(pool);
  tw.appendChild(left); tw.appendChild(right);
  wrapper.appendChild(tw);

  const feedback = document.createElement('div');
  feedback.style.marginTop = '12px';
  wrapper.appendChild(feedback);

  root.appendChild(wrapper);

  // data copies
  const PARTS = q.partitions.slice();
  const PROCS = q.processes.map(p=>({...p}));
  const totalProcesses = PROCS.length;

  currentDragProcs = PROCS;
  currentDragTotal = totalProcesses;

  // build partition rows
  PARTS.forEach((size,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>Part${i+1}</td><td>${size}</td><td class="process-slot" id="slot-${i}" data-slot="${i}"></td>`;
    pBody.appendChild(tr);
  });

  // build pool
  PROCS.forEach(proc=>{
    const el = document.createElement('div');
    el.className = 'draggable-process';
    el.draggable = true;
    el.dataset.proc = proc.name;
    el.textContent = `${proc.name} (${proc.size} KB)`;
    el.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', proc.name);
    
        setTimeout(() => el.style.opacity = '0.4', 0); 
    });

    el.addEventListener('dragend', () => {
        el.style.opacity = '1';
    });
    
    pool.appendChild(el);
  });

  const totalSlots = PARTS.length;
  const waitingBody = document.getElementById('waitingBody');

  

  // add back to pool if not present
  function addToPool(name) {
    // 1. Cek jika sudah ada, jangan duplikat
    if (pool.querySelector(`[data-proc="${name}"]`)) return;

    const procObj = PROCS.find(p => p.name === name);
    if (!procObj) return;

    // 2. Buat elemen elemen visual
    const el = document.createElement('div');
    el.className = 'draggable-process';
    el.draggable = true;
    el.dataset.proc = procObj.name;
    el.textContent = `${procObj.name} (${procObj.size} KB)`;

    // Event listener Drag & Drop
    el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', procObj.name);
      setTimeout(() => el.style.opacity = '0.4', 0);
    });
    el.addEventListener('dragend', () => {
      el.style.opacity = '1';
    });

    // === LOGIKA PENGURUTAN (SORTING) ===
    // Ambil angka dari nama proses, misal "P2" -> 2
    const newNum = parseInt(name.substring(1)); 
    
    const children = Array.from(pool.children);
    let inserted = false;

    // Loop semua anak yang ada di pool saat ini
    for (let child of children) {
      const childNum = parseInt(child.dataset.proc.substring(1));
      
      // Jika nomor proses baru LEBIH KECIL dari proses yang ada di pool,
      // sisipkan SEBELUM proses tersebut.
      if (newNum < childNum) {
        pool.insertBefore(el, child);
        inserted = true;
        break;
      }
    }

    // Jika pool kosong atau ini adalah angka terbesar, taruh di paling belakang
    if (!inserted) {
      pool.appendChild(el);
    }
  }

  // add to waiting (supports multiple) with remove button which triggers cascading removal
  function addToWaiting(procName, skipCascade=false) {
    const procObj = PROCS.find(p=>p.name===procName);
    if (!procObj) return;
    
    // remove from pool if present
    const el = pool.querySelector(`[data-proc="${procName}"]`);
    if (el) el.remove();
    // create row
    const row = document.createElement('tr');
    row.innerHTML = `<td class="process-slot"> 
      <div class="slot-content">
        <span class="proc-label">${procName} (${procObj.size} KB)</span>
        <button class="remove-btn" title="Hapus">✕</button>
      </div>
    </td>`;
    // remove handler -> cascading delete from this proc onward
    row.querySelector('.remove-btn').addEventListener('click', () => {
      cascadeRemoveFrom(procName);
    });

    const placeholderRow = Array.from(waitingBody.querySelectorAll('tr')).find(r => r.textContent.trim() === '-');

    if (placeholderRow) {
      // 2. Sisipkan baris proses baru TEPAT SEBELUM placeholder
      waitingBody.insertBefore(row, placeholderRow);
    } else {
      // 3. Fallback (jika placeholder tidak ada, tambahkan baris & placeholder baru)
      waitingBody.appendChild(row);
      waitingBody.insertAdjacentHTML('beforeend', '<tr><td>-</td></tr>');
    }

    const tdSlot = row.querySelector('.process-slot');
    if (tdSlot) {
      tdSlot.classList.add('filled');
      tdSlot.addEventListener('animationend', () => {
        tdSlot.classList.remove('filled');
      }, { once: true });
    }

    // after adding, check filled status
    refreshNextButtonState();
  }

  // cascade removal: remove procName and any later-numbered processes (both in partitions and waiting)
  function cascadeRemoveFrom(procName) {
    const removedNum = parseInt(procName.substring(1));
    const animationDuration = 400; // 0.4s from latihan.css

    // remove from partitions
    Array.from(document.querySelectorAll('.process-slot')).forEach(slot=>{
      const name = slot.dataset.proc;
      if (name) {
        const num = parseInt(name.substring(1));
        if (num >= removedNum) {
          
          delete slot.dataset.proc;
          slot.classList.add('removing'); 
    
        }
      }
    });

    // remove from waiting
    const waitRows = Array.from(document.querySelectorAll('#waitingBody tr'));
    waitRows.forEach(row=>{
      const cellText = row.textContent.trim();
      if (!cellText) return;
      const name = cellText.split(" ")[0];
      if (name === '-') return;
      const num = parseInt(name.substring(1));
      if (num >= removedNum) {
        
        const slotInWait = row.querySelector('.process-slot');
        if (slotInWait) {
            slotInWait.classList.add('removing'); 
        }
        
        setTimeout(() => {
            row.remove();
        }, animationDuration);
      }
    });

    setTimeout(() => {
      // return removed processes (>= removedNum) to pool (in increasing order)
      for (let k = removedNum; k <= totalProcesses; k++) {
        const nm = 'P' + k;
        // ensure it's not present in pool already
        if (!pool.querySelector(`[data-proc="${nm}"]`)) {
          // but only add if nm is not present in any slot or waiting
          const presentInSlots = Array.from(document.querySelectorAll('.process-slot'))
            .some(s => s.dataset.proc === nm);
          // Cek waiting body SETELAH delay
          const presentInWait = Array.from(document.querySelectorAll('#waitingBody tr'))
            .some(r => r.textContent.trim().split(" ")[0] === nm);
          if (!presentInSlots && !presentInWait) addToPool(nm);
        }
      }
      
      // if waiting empty put placeholder
      // Cek waiting body SETELAH delay
      if (waitingBody.children.length === 0) {
        waitingBody.innerHTML = '<tr><td>-</td></tr>';
      }

      Array.from(document.querySelectorAll('.process-slot.removing')).forEach(slot => {
          slot.innerHTML = ''; // Hapus kontennya
          slot.classList.remove('removing'); // Hapus kelas animasinya
      });
      
      refreshNextButtonState();
      // clear previous feedback (so evaluation will re-run only when filled)
      clearAllFeedbackVisuals();

    }, animationDuration + 10); 
  }

  // slot remove with cascading behavior: same as cascadeRemoveFrom(slotProc)
  function attachSlotRemove(slot, procName) {
    const btn = slot.querySelector('.remove-btn');
    if (!btn) return;
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      cascadeRemoveFrom(procName);
    });
  }

  // place proc into a slot (slot DOM element)
  function placeIntoSlot(slotElem, procName) {
    // remove from pool
    const el = pool.querySelector(`[data-proc="${procName}"]`);
    if (el) el.remove();

    const procObj = PROCS.find(p=>p.name===procName);
    if (!procObj) return

    slotElem.dataset.proc = procName;

    slotElem.innerHTML = `<div class="slot-content">
      <span class="proc-label">${procName} (${procObj.size} KB)</span>
      <button class="remove-btn" title="Hapus">✕</button>
    </div>`;

    slotElem.classList.add('filled');
    slotElem.addEventListener('animationend', () => {
        slotElem.classList.remove('filled');
    }, { once: true });

    attachSlotRemove(slotElem, procName);
    refreshNextButtonState();
  }


  // Helper: Hapus semua feedback visual (warna, hint) dari tabel
  function clearAllFeedbackVisuals() {
    // 1. Hapus dari tabel partisi
    root.querySelectorAll('.process-slot').forEach(s => {
      s.classList.remove('correct', 'wrong', 'neutral');
      const oldHints = s.querySelectorAll('.expected-hint');
      oldHints.forEach(hint => hint.remove());
      
      // Pastikan konten slot (jika disembunyikan) muncul kembali
      const content = s.querySelector('.slot-content');
      if (content) {
        content.style.display = ''; 
      }
    });
    
    // 2. Hapus dari tabel waiting
    waitingBody.style.background = '';
    
    // 3. Hapus kotak feedback utama
    feedback.innerHTML = '';
  }

 // Evaluate and show feedback (called only when allPlaced())
  function evaluateAndShow() {
    if (isEvaluating) return; // 1. Jika sedang evaluasi, hentikan
    isEvaluating = true;      // 2. Aktifkan kunci

    // 1. Bersihkan visual sebelumnya MENGGUNAKAN HELPER
    clearAllFeedbackVisuals();

    // 2. Langsung kunci UI (sembunyikan pool & hapus tombol)
    document.querySelectorAll('.remove-btn').forEach(btn => btn.remove());
    const procArea = document.querySelector('.right-area');
    if (procArea) procArea.style.display = 'none';

    // Ambil jawaban benar
    const { assign, waiting } = computeExpected(PARTS, PROCS, q.algo);

    // 3. Hitung hasil partisi terlebih dahulu
    const slotResults = [];
    let correctCount = 0;
    
    for (let i = 0; i < PARTS.length; i++) {
      const slot = document.getElementById(`slot-${i}`);
      const user = slot.dataset.proc || null; 
      const expected = assign[i] || null; 
      
      let status = 'neutral';
      let hintText = 'kosong'; 
      let waitHint = false; 

      if (expected && user === expected) {
        status = 'correct';
        correctCount++;
        hintText = user;
      } else if (!expected && !user) {
        status = 'neutral';
        hintText = 'kosong';
      } else { 
        status = 'wrong';
        if (expected) {
          hintText = expected; 
          if (user && user !== expected && waiting.includes(user)) {
            waitHint = true; 
          }
        } else if (user && waiting.includes(user)) {
          hintText = 'Waiting';
        } else {
          hintText = 'kosong'; 
        }
      }
      slotResults.push({ 
        status, 
        expected: hintText, 
        waitHint: waitHint, 
        userProc: user 
      });
    }

    // 4. Terapkan hasil (visual) PARTISI secara bertahap
    const animDelay = 150; // Jeda 150ms antar slot
    slotResults.forEach((res, i) => {
      setTimeout(() => {
        const slot = document.getElementById(`slot-${i}`);
        slot.classList.add(res.status); 
        
        if (res.status === 'wrong') {
          const hint = document.createElement('div');
          hint.className = 'expected-hint';
          hint.textContent = `→ seharusnya: ${res.expected}`;
          slot.appendChild(hint); 

          if (res.waitHint) {
            const waitIndicator = document.createElement('div');
            waitIndicator.className = 'expected-hint waiting-indicator';
            waitIndicator.textContent = `(${res.userProc} seharusnya Waiting)`;
            slot.appendChild(waitIndicator);
          }
        }
      }, i * animDelay); // Penundaan bertingkat
    });

    const userWait = Array.from(document.querySelectorAll('#waitingBody tr'))
      .map(r => r.textContent.trim().split(" ")[0])
      .filter(x => x !== "-");
    const waitingCorrect = JSON.stringify(userWait) === JSON.stringify(waiting);

   const partitionCorrect = slotResults.every(res => res.status !== 'wrong');
    // Jawaban benar HANYA JIKA (partisi benar) DAN (waiting benar)
    const allCorrect = partitionCorrect && waitingCorrect;

    const waitRows = waitingBody.querySelectorAll('tr');
    const maxLen = Math.max(userWait.length, waiting.length);

    for (let i = 0; i < maxLen; i++) {
        const animTime = (slotResults.length + i) * animDelay; // Lanjutkan animasi
        const row = waitRows[i];
        const userProc = userWait[i] || null;
        const expectedProc = waiting[i] || null;

        setTimeout(() => {
            if (!row) return; // Jika user tidak mengisi sebanyak yang seharusnya
            const td = row.querySelector('.process-slot');
            if (!td) return;

            if (userProc === expectedProc) {
                td.classList.add(userProc ? 'correct' : 'neutral');
            } else {
                td.classList.add('wrong');
                const hintText = expectedProc || 'kosong';
                const hint = document.createElement('div');
                hint.className = 'expected-hint';
                hint.textContent = `→ seharusnya: ${hintText}`;
                td.appendChild(hint);
            }
        }, animTime);
    }

    const totalAnimTime = (slotResults.length + maxLen) * animDelay + 100;
    
    setTimeout(() => {
      // (Warna latar tabel waiting list)
      if (waitingCorrect) {
        waitingBody.style.background = 'rgba(34, 61, 34, 0.4)';
      } else {
        waitingBody.style.background = 'rgba(61, 34, 34, 0.4)';
      }

      // --- KOTAK 1: STATUS SEDERHANA (Langsung Terlihat) ---
      // (Tidak berubah, ini sudah benar)
      // (BARU) Tentukan ikon dan teks berdasarkan status
      const icon = allCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
      const text = allCorrect ? 'Jawaban Benar!' : 'Jawaban Salah!';

      const simpleStatusDiv = document.createElement('div');
      simpleStatusDiv.className = 'simple-status ' + (allCorrect ? 'correct' : 'wrong');
      simpleStatusDiv.innerHTML = `
        <span>
          <i class="bi ${icon} status-icon"></i> ${text}
        </span>
        <button id="toggleDetailBtn" class="btn-toggle-detail">Lihat Evaluasi Detail</button>
      `;

      // --- KOTAK 2: EVALUASI DETAIL (Tersembunyi) ---
      // (BARU) Struktur HTML yang lebih detail
      let summaryHtml = '';

      // 1. (BARU) Penjelasan Logika Algoritma
      let algoExplain = '';
      if (q.algo === 'First-Fit') {
          algoExplain = 'Mencari partisi pertama dari atas yang cukup (>= ukuran proses).';
      } else if (q.algo === 'Best-Fit') {
          algoExplain = 'Mencari partisi terkecil yang masih cukup, untuk meminimalkan sisa.';
      } else { // Worst-Fit
          algoExplain = 'Mencari partisi terbesar yang tersedia, untuk menyisakan sisa besar.';
      }
      summaryHtml += `<div class="eval-algo-explain">
                        <strong>Logika ${q.algo}:</strong> ${algoExplain}
                      </div>`;

      // 2. (BARU) Hasil Partisi (dengan list <ul>)
      summaryHtml += `<h3 class="eval-heading">Evaluasi Partisi</h3>`; // Judul Bagian
      
      // (PERBAIKAN) Gunakan variabel 'partitionCorrect' yang sudah dihitung
      const partitionClass = partitionCorrect ? 'eval-correct' : 'eval-wrong';
      
      summaryHtml += `<div class="eval-section ${partitionClass}">`; 
      
      summaryHtml += `<div class="eval-subtitle">Urutan proses: P1 → P2 → P3 → ...</div>`;
      
      // (PERBAIKAN) Gunakan 'partitionCorrect' untuk menentukan teks hasil
      if (partitionCorrect) {
          // Hitung jumlah total slot yang 'benar' (terisi atau kosong)
          const correctSlots = slotResults.filter(res => res.status !== 'wrong').length;
          summaryHtml += `<strong><i class="bi bi-check-circle-fill status-icon"></i> Hasil: Benar</strong> (${correctSlots}/${PARTS.length} slot).`;
      } else {
          // Hitung hanya slot yang 'terisi dengan benar'
          const correctFilledSlots = slotResults.filter(res => res.status === 'correct').length;
          summaryHtml += `<strong><i class="bi bi-x-circle-fill status-icon"></i> Hasil: Salah</strong> (${correctFilledSlots} benar dari ${PARTS.length} slot.)`;
          summaryHtml += `<div class="correction-list-title">Detail Kesalahan:</div>`;
          summaryHtml += `<ul class="correction-list">`; // List
          
          for (let i = 0; i < slotResults.length; i++) {
              const res = slotResults[i];
              if (res.status === 'wrong') {
                  const partName = `Part${i + 1}`;
                  const userAnswer = res.userProc || 'Kosong'; 
                  const expectedAnswer = res.expected; 
                  summaryHtml += `<li>
                                    <strong>${partName}:</strong> 
                                    Anda menjawab <span>${userAnswer}</span>, seharusnya <span>${expectedAnswer}</span>.
                                  </li>`;
              }
          }
          summaryHtml += `</ul>`; // Tutup List
      }
      summaryHtml += `</div>`; // Tutup eval-section

      // 3. (BARU) Hasil Waiting (logika lama, tampilan baru)
      summaryHtml += `<h3 class="eval-heading">Evaluasi Waiting List</h3>`; // Judul Bagian
      
      let waitSummary = ''; 
      if (waitingCorrect) {
          waitSummary = `<div class="eval-section eval-correct">
                           <strong><i class="bi bi-check-circle-fill status-icon"></i> Hasil: Benar</strong> ${waiting.length > 0 ? `(${waiting.join(', ')})` : '(Kosong)'}
                         </div>`;
      } else {
          // Gunakan kembali logika .wait-detail yang sudah jelas
          const userWaitText = userWait.length > 0 ? userWait.join(', ') : 'Kosong';
          const expectedWaitText = waiting.length > 0 ? waiting.join(', ') : 'Kosong';
          const forgotten = waiting.filter(proc => !userWait.includes(proc));

         waitSummary = `<div class="eval-section eval-wrong">
                           <strong><i class="bi bi-x-circle-fill status-icon"></i> Hasil: Salah</strong>
                           <div class="wait-detail">Jawaban Anda: <strong>${userWaitText}</strong></div>
                           <div class="wait-detail">Seharusnya: <strong>${expectedWaitText}</strong></div>`;
          if (forgotten.length > 0) {
              waitSummary += `<div class="wait-detail missed"><i class="bi bi-exclamation-triangle-fill status-icon"></i> Proses <strong>${forgotten.join(', ')}</strong> tidak dimasukkan.</div>`;
          }
          waitSummary += `</div>`;
      }
      summaryHtml += waitSummary; // Tambahkan bagian waiting
      // (Akhir dari pembuatan HTML)

      // Buat div utamanya (KOTAK 2)
      const evaluationDiv = document.createElement('div');
      evaluationDiv.className = 'explain fade-in ' + (allCorrect ? 'correct' : 'wrong');
      evaluationDiv.id = 'detailedEvaluation';
      evaluationDiv.style.display = 'none';
      evaluationDiv.innerHTML = summaryHtml;
      
      // Tampilkan kedua kotak
      feedback.innerHTML = '';      
      feedback.appendChild(simpleStatusDiv); // Tampilkan KOTAK 1
      feedback.appendChild(evaluationDiv);   // Tampilkan KOTAK 2 (tersembunyi)

      // Event Listener (Tidak berubah)
      document.getElementById('toggleDetailBtn').addEventListener('click', (e) => {
          const detailBox = document.getElementById('detailedEvaluation');
          const btn = e.target;
          if (detailBox.style.display === 'none') {
              detailBox.style.display = 'block';
              btn.textContent = 'Sembunyikan Detail';
          } else {
              detailBox.style.display = 'none';
              btn.textContent = 'Lihat Evaluasi Detail';
          }
      });

      // 7. Simpan jawaban (Tidak berubah)
      const map = {};
      for (let i=0;i<PARTS.length;i++){
        const s = document.getElementById(`slot-${i}`);
        map[i] = s.dataset.proc || null;
      }
      map.__waiting = userWait;
      userAnswers[index] = map;

      // 8. Aktifkan tombol next (Tidak berubah)
      nextBtn.disabled = false;
      nextBtn.textContent = (index < total - 1) ? "Soal Selanjutnya →" : "Lihat Hasil";

      // 9. Lepaskan kunci (Tidak berubah)
      isEvaluating = false; 

    }, totalAnimTime);
    // ================ AKHIR BLOK PENGGANTI ================
  }

  // when any change occurs, refresh nextBtn state (locked until all placed)
  function refreshNextButtonState() {
    if (allPlaced()) {
      // auto-evaluate and show immediately
      evaluateAndShow();
    } else {
      nextBtn.disabled = true;
      clearAllFeedbackVisuals();
      // restore pool display if hidden
      const procArea = document.querySelector('.right-area');
      if (procArea) procArea.style.display = 'block';
    }
  }

  // DROP HANDLER for partition slots
  function onDropHandler(ev) {
    ev.preventDefault();
    const td = ev.currentTarget;
    td.classList.remove('drop-hover');
    const procName = ev.dataTransfer.getData('text/plain');
    if (!procName) return;

    const expected = getNextExpectedProc();
    if (procName !== expected) {
      showToast(`Harap masukkan <strong>${expected}</strong> terlebih dahulu sebelum ${procName}.`, 'info');
      return;
    }

    // if already filled
    if (td.dataset.proc) {
      showToast(`Slot ini sudah diisi (<strong>${td.dataset.proc}</strong>). Hapus dulu sebelum mengganti.`, 'warning');
      return;
    }

    // check size
    const slotIndex = parseInt(td.dataset.slot);
    const procObj = PROCS.find(p=>p.name===procName);
    const partSize = PARTS[slotIndex];

    if (procObj.size > partSize) {
      // Tampilkan pesan warning bahwa partisi tidak cukup
      showToast(`Proses <strong>${procName}</strong> (${procObj.size} KB) terlalu besar untuk partisi ini (${partSize} KB).`, 'warning');
      
      // Hentikan proses (jangan masukkan ke waiting list otomatis, biarkan user berpikir)
      return; 
    }

    // place into slot
    placeIntoSlot(td, procName);
  }

      // attach slot events
      for (let i = 0; i < totalSlots; i++) {
          const slot = document.getElementById(`slot-${i}`);

          // 1. DRAG OVER (Wajib ada e.preventDefault() agar bisa didrop)
          slot.addEventListener('dragover', e => {
            e.preventDefault(); // Izinkan drop
            e.dataTransfer.dropEffect = 'move';
            
            // Tambahkan kelas visual
            slot.classList.add('drop-hover');
          });

          // 2. DRAG ENTER (Visual tambahan)
          slot.addEventListener('dragenter', e => {
            e.preventDefault();
            slot.classList.add('drop-hover');
          });

          // 3. DRAG LEAVE (Hapus visual saat keluar)
          slot.addEventListener('dragleave', e => {
            // Cek apakah benar-benar keluar dari elemen slot (bukan masuk ke anak elemennya)
            if (e.relatedTarget && !slot.contains(e.relatedTarget)) {
              slot.classList.remove('drop-hover');
            }
          });

          // 4. DROP (Tangani logika penempatan)
          slot.addEventListener('drop', (e) => {
            e.preventDefault(); // Stop default behavior browser
            slot.classList.remove('drop-hover'); // Hapus highlight
            onDropHandler(e); // Panggil fungsi handler utama Anda
          });
        }

      // waiting drop zone events
          waitingBody.addEventListener('dragenter', e => {
        e.preventDefault();
        waitingBody.classList.add('drop-hover');
      });

 
    waitingBody.addEventListener('dragover', e => {
      e.preventDefault();
      // Pastikan class tetap ada (untuk menjaga konsistensi browser)
      if (!waitingBody.classList.contains('drop-hover')) {
          waitingBody.classList.add('drop-hover');
      }
      return false;
    });

    waitingBody.addEventListener('dragleave', e => {
      // PENTING: Cek apakah kursor benar-benar keluar dari elemen waitingBody
      // (bukan hanya masuk ke elemen anak/teks di dalamnya)
      if (e.relatedTarget && !waitingBody.contains(e.relatedTarget)) {
        waitingBody.classList.remove('drop-hover');
      }
    });

  
    waitingBody.addEventListener('drop', e => {
    e.preventDefault();
    
    // Hapus highlight visual
    waitingBody.classList.remove('drop-hover');

    const procName = e.dataTransfer.getData('text/plain');
    if (!procName) return;

    const expected = getNextExpectedProc();
    
    // Validasi urutan
    if (procName !== expected) {
       showToast(`Harap masukkan <strong>${expected}</strong> terlebih dahulu sebelum ${procName}.`, 'info');
      return;
    }
    
    // Masukkan ke dalam tabel
    addToWaiting(procName);
  });


  // restore previous answer if exists
  if (userAnswers[index]) {
    const prev = userAnswers[index];
    // restore slots
    for (let i=0;i<totalSlots;i++){
      const val = prev[i];
      if (val) {
        const slot = document.getElementById(`slot-${i}`);
        slot.dataset.proc = val;
        slot.innerHTML = `<div class="slot-content"><span class="proc-label">${val}</span><button class="remove-btn">✕</button></div>`;
        attachSlotRemove(slot, val);
        // remove from pool if existed
        const rem = pool.querySelector(`[data-proc="${val}"]`); if (rem) rem.remove();
      }
    }
    // restore waiting
    if (prev.__waiting && prev.__waiting.length > 0) {
      waitingBody.innerHTML = '';
      prev.__waiting.forEach(name=>{
        const procObj = PROCS.find(p=>p.name===name);
        if (!procObj) return;
        const row = document.createElement('tr');
        row.innerHTML = `<td style="display:flex;justify-content:space-between;align-items:center;">
          ${name} (${procObj.size} KB)
          <button class="remove-wait-btn" title="Hapus">✕</button>
        </td>`;
        row.querySelector('.remove-wait-btn').addEventListener('click', ()=> cascadeRemoveFrom(name));
        waitingBody.appendChild(row);
        const rem = pool.querySelector(`[data-proc="${name}"]`); if (rem) rem.remove();
      });
    }
    // after restoring, show evaluation immediately and enable next
    evaluateAndShow();
  } else {
    // ensure next button disabled until filled
    nextBtn.disabled = true;
    nextBtn.textContent = (index < total - 1) ? "Soal Selanjutnya →" : "Lihat Hasil";
  }


  window.solveCurrentDrag = () => {
    // 1. Hitung jawaban yang benar
    const { assign, waiting } = computeExpected(PARTS, PROCS, q.algo);

    // 2. Isi Partisi (Animasi drag otomatis)
    // Gunakan placeIntoSlot agar logika internal berjalan
    Object.keys(assign).forEach(idx => {
      const procName = assign[idx];
      const slot = document.getElementById(`slot-${idx}`);
      
      // Pastikan slot ada dan prosesnya belum terisi
      if (slot && !slot.dataset.proc) {
        placeIntoSlot(slot, procName);
      }
    });

    // 3. Isi Waiting List
    // Gunakan addToWaiting agar logika internal berjalan
    waiting.forEach(procName => {
      // Cek agar tidak duplikat di waiting list
      const rows = Array.from(document.querySelectorAll('#waitingBody tr'));
      const isAlreadyInWaiting = rows.some(r => r.textContent.includes(procName));
      
      if (!isAlreadyInWaiting) {
        addToWaiting(procName);
      }
    });

    // Catatan: Karena placeIntoSlot/addToWaiting memanggil refreshNextButtonState(),
    // maka evaluateAndShow() akan otomatis terpanggil saat item terakhir dimasukkan.
  };

}

function ensureToastContainer() {
    if (document.getElementById("toast-container")) return;
    
    // 1. Buat Container
    const container = document.createElement("div");
    container.id = "toast-container";
    container.style.position = "fixed";
    container.style.right = "20px";
    container.style.bottom = "20px";
    container.style.zIndex = "2000"; // Z-index tinggi agar di atas modal admin
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";
    document.body.appendChild(container);

    // 2. Inject CSS Sederhana (Dark Theme Friendly)
    const style = document.createElement("style");
    style.innerHTML = `
        #toast-container .toast { min-width: 250px; max-width: 360px; border-radius: 8px; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        #toast-container .toast .toast-body { font-size: 0.95rem; color: #fff; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
    `;
    document.head.appendChild(style);
}

/**
 * type: 'success' | 'info' | 'warning' | 'danger'
 */
function showToast(message, type = "info", delay = 3500) {
    ensureToastContainer();
    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    
    // Tentukan warna background ala Bootstrap
    let bgClass = "bg-secondary";
    let closeBtnClass = "btn-close-white"; // Tombol close putih default
    
    if (type === "success") bgClass = "bg-success";
    else if (type === "danger") bgClass = "bg-danger";
    else if (type === "warning") {
        bgClass = "bg-warning";
        closeBtnClass = ""; // Tombol close hitam untuk background kuning
    } else if (type === "info") {
        bgClass = "bg-info";
        closeBtnClass = ""; // Tombol close hitam untuk background biru muda
    }

    toast.className = `toast align-items-center text-white ${bgClass}`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    // Jika background kuning/info, teks harus hitam agar terbaca
    const textClass = (type === "warning" || type === "info") ? "text-dark" : "text-white";
    
    // Ikon opsional berdasarkan tipe
    let icon = "";

    toast.innerHTML = `
        <div class="d-flex w-100">
            <div class="toast-body w-100 ${textClass}">
                <div>${icon} ${message}</div>
                <button type="button" class="btn-close ${closeBtnClass} ms-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    container.appendChild(toast);

    // Init Bootstrap Toast
    const bsToast = new bootstrap.Toast(toast, { autohide: true, delay });
    bsToast.show();

    // Bersihkan dari DOM saat hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}



// global next button behavior (delegator)
nextBtn.addEventListener('click', () => {
  // Ambil soal saat ini
  const q = allQuestions[index];

  if (q.type === 'mcq') {
    // === LOGIKA UNTUK SOAL PILIHAN GANDA ===

    // Jika soal ini belum dijawab (baru menekan "Jawab")
    if (userAnswers[index] === null) {
      // Pastikan user memilih opsi
      const chosen = userSelected[index];
      if (chosen === null) {
        const selBtn = root.querySelector('.option-btn.selected');
        if (selBtn) userSelected[index] = parseInt(selBtn.dataset.idx, 10);
      }
      if (userSelected[index] === null) return;

      // Kunci tombol
      const optionButtons = root.querySelectorAll('.option-btn');
      optionButtons.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('locked');
      });

      // Sembunyikan tombol 'Jawab' & tampilkan loading
      nextBtn.style.display = 'none';
      adminBtn.style.display = 'none';
      const explainWrap = root.querySelector('#explainWrap');
      if (explainWrap) {
        explainWrap.innerHTML = `<div class="loading-anim"><i class="bi bi-arrow-repeat spin-icon"></i> Memeriksa jawaban...</div>`;
      }

      // Simulasi proses pemeriksaan
      setTimeout(() => {
        // Nilai jawaban
        const selectedIdx = userSelected[index];
        userAnswers[index] = selectedIdx;
        const container = root.firstElementChild;
        showMCQExplain(q, selectedIdx, container);

        // Tampilkan kembali tombol dengan teks baru
        // (Kondisi ini sudah benar)
        nextBtn.textContent = (index < total - 1)
          ? "Soal Selanjutnya →"
          : "Lihat Hasil";
        nextBtn.style.display = 'inline-block';
        nextBtn.disabled = false;
      }, 900);

    } else {
      // Jika soal MCQ sudah dijawab (menekan "Soal Selanjutnya" atau "Lihat Hasil")
      
      // (PERBAIKAN DI SINI) Pastikan menggunakan < total - 1
      if (index < total - 1) {
        index++;
        renderCurrent();
      } else {
        // Ini adalah soal MCQ terakhir, tampilkan hasil
        showSummary();
      }
    }
  
  } else {
    // === LOGIKA UNTUK SOAL DRAG & DROP (dan tipe lainnya) ===
    
    // (PERBAIKAN UTAMA DI SINI)
    // Cek apakah 'index' KURANG DARI index terakhir (total - 1)
    if (index < total - 1) {
      // Jika ya, masih ada soal, lanjut
      index++;
      renderCurrent();
    } else {
      // Jika tidak (index SUDAH 9), ini adalah klik terakhir. Tampilkan hasil.
      showSummary();
    }
  }
});

// (DIMODIFIKASI TOTAL) Ganti fungsi showSummary Anda dengan ini
function showSummary() {
  let mcqCorrect = 0;
  for (let i = 0; i < numMcqToSelect; i++){
    const ans = userAnswers[i];
    if (ans !== null && ans === allQuestions[i].answer) mcqCorrect++;
  }

  let dragCorrectSlots = 0, dragTotalSlots = 0;
  for (let k = 0; k < numDragToSelect; k++){
    const qIdx = numMcqToSelect + k;
    const q = allQuestions[qIdx];
    const ua = userAnswers[qIdx];
    if (!ua) continue;

    const { assign: expected } = computeExpected(q.partitions, q.processes, q.algo);
    for (const sIdx in ua) {
      if (sIdx === "__waiting") continue;
      dragTotalSlots++;

      const assigned = ua[sIdx];
      const expectedProc = expected[sIdx] || null;
      if ((expectedProc && assigned === expectedProc) || (!expectedProc && !assigned)) {
        dragCorrectSlots++;
      }
    }
  }

  const totalCorrect = mcqCorrect + dragCorrectSlots;
  const totalPossible = numMcqToSelect + dragTotalSlots;
  const percent = totalPossible ? Math.round((totalCorrect/totalPossible)*100) : 0;
  const angle = (percent / 100) * 360;

  root.innerHTML = `
    <div class="result-wrapper">
      <div class="result-title">Hasil Akhir Latihan</div>
      <div class="result-subtitle">Berikut ringkasan performa Anda</div>

      <div class="score-ring" id="finalScoreRing" style="--score-angle: 0deg;">
        
        <i class="bi bi-trophy-fill score-bg-icon"></i>
        
        <div class="score-text" id="finalScoreText">0%</div>
      
      </div>
      <div class="breakdown-box">
        <div class="d-flex align-items-center gap-3">
          <div class="icon-box mcq-icon">
            <i class="bi bi-list-check"></i>
          </div>
          <div>
            <strong>Soal Pilihan Ganda</strong>
            <div class="breakdown-small">${mcqCorrect} benar dari ${numMcqToSelect} soal</div>
          </div>
        </div>
      </div>

      <div class="breakdown-box">
        <div class="d-flex align-items-center gap-3">
          <div class="icon-box drag-icon">
            <i class="bi bi-puzzle-fill"></i>
          </div>
          <div>
            <strong>Soal Drag & Drop</strong>
            <div class="breakdown-small">${dragCorrectSlots} benar dari ${dragTotalSlots} slot</div>
          </div>
        </div>
      </div>

      <button id="restartBtn" class="btn-restart">
        <i class="bi bi-arrow-counterclockwise me-2"></i> Ulangi Latihan
      </button>
    </div>
  `;

  nextBtn.disabled = true;
  nextBtn.style.display = 'none';
  if (progressWrapper) progressWrapper.style.display = 'none';

  const adminBtn = document.getElementById("adminBtn");
  if (adminBtn) adminBtn.style.display = 'none';


  const resultWrapper = root.querySelector('.result-wrapper');
  if (resultWrapper) {
      // Perintahkan browser untuk scroll ke elemen ini
      resultWrapper.scrollIntoView({
          behavior: 'smooth', // Animasi scroll halus
          block: 'start'      // Sejajarkan bagian atas elemen dengan viewport
      });
  }

  // --- (BARU) Logika Animasi ---
  
  const scoreRing = document.getElementById('finalScoreRing');
  const scoreText = document.getElementById('finalScoreText');

  const duration = 2000; // Durasi total 2 detik (bisa diubah)
  const startVal = 0;
  const endVal = percent; // Nilai akhir (0 - 100)
  const endAngle = angle; // Sudut akhir (0 - 360)
  
  let startTime = null;

  function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  // 4. Loop Animasi
  function animate(currentTime) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    
    // Hitung progres waktu (0.0 sampai 1.0)
    let progress = Math.min(timeElapsed / duration, 1);
    
    // Terapkan efek easing pada progres
    const easedProgress = easeOutExpo(progress);

    // Update Angka (Sinkron)
    const currentScore = Math.round(easedProgress * endVal);
    if (scoreText) scoreText.textContent = `${currentScore}%`;

    // Update Lingkaran (Sinkron)
    const currentAngle = easedProgress * endAngle;
    if (scoreRing) scoreRing.style.setProperty('--score-angle', `${currentAngle}deg`);

    // Lanjutkan animasi jika belum selesai
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  // Mulai Animasi
  requestAnimationFrame(animate);
  
  // --- Akhir Logika Animasi ---

  document.getElementById('restartBtn').addEventListener('click', () => {
    // (BARU) Saat restart, reset juga angle agar animasi bisa jalan lagi
    const ring = document.getElementById('finalScoreRing');
    if (ring) ring.style.setProperty('--score-angle', '0deg');
    
    setupQuiz(); 
    renderCurrent(); 
  });
}

function getUsedListOrdered() {
  // used in partitions by slot index order
  const usedPart = Array.from(document.querySelectorAll('.process-slot'))
    .map(s => s.dataset.proc)
    .filter(Boolean);
  // used in waiting keep order of rows (top->down)
  const usedWait = Array.from(document.querySelectorAll('#waitingBody tr'))
    .map(r => r.textContent.trim().split(" ")[0])
    .filter(x => x !== "-");
  return usedPart.concat(usedWait);
}


function getNextExpectedProc() {
  const usedCount = getUsedListOrdered().length;
  // Gunakan variabel global 'currentDragProcs'
  return currentDragProcs[usedCount]?.name || null;
}


function allPlaced() {
  const used = getUsedListOrdered();
  // Gunakan variabel global 'currentDragTotal'
  return used.length === currentDragTotal;
}



function updateAdminButtonUI() {
  const adminBtn = document.getElementById("adminBtn");
  if (!adminBtn) return;

  if (isAdminLoggedIn) {
    // Jika login, sembunyikan tombol kunci kecil, tampilkan toolbar
    adminBtn.style.display = 'none'; 
    renderAdminToolbar();
  } else {
    // Jika logout, tampilkan tombol kunci, hapus toolbar
    adminBtn.style.display = 'inline-flex';
    adminBtn.classList.remove('admin-active');
    
    const toolbar = document.getElementById('adminToolbar');
    if (toolbar) toolbar.remove();
  }
}


function renderAdminToolbar() {
  // Cek jika toolbar sudah ada agar tidak duplikat
  if (document.getElementById('adminToolbar')) return;

  const toolbar = document.createElement('div');
  toolbar.id = 'adminToolbar';
  toolbar.className = 'admin-toolbar';
  
  toolbar.innerHTML = `
    <div class="admin-badge"><i class="bi bi-shield-lock-fill"></i> Admin Mode</div>
    
    <button class="admin-tool-btn solve" title="Auto Solve (Jawab Otomatis)" onclick="adminAutoSolve()">
      <i class="bi bi-magic"></i>
    </button>
    
    <button class="admin-tool-btn reset" title="Reset Soal Ini" onclick="adminResetQuestion()">
      <i class="bi bi-arrow-counterclockwise"></i>
    </button>

    <button class="admin-tool-btn skip" title="Force Next (Lewati)" onclick="adminForceNext()">
      <i class="bi bi-skip-forward-fill"></i>
    </button>
    
    <div style="width:1px; height:20px; background:rgba(255,255,255,0.2); margin:0 5px;"></div>
    
    <button class="admin-tool-btn logout" title="Logout" onclick="adminLogout()">
      <i class="bi bi-box-arrow-right"></i>
    </button>
  `;

  document.body.appendChild(toolbar);
}

function adminLogout() {
  isAdminLoggedIn = false;
  const toolbar = document.getElementById('adminToolbar');
  if (toolbar) toolbar.remove();
  
  showToast("Sesi Admin diakhiri. Kembali ke mode pengguna.", "info");
  updateAdminButtonUI();
  renderCurrent();
}

function adminResetQuestion() {
  userAnswers[index] = null;
  userSelected[index] = null;
  renderCurrent();
  adminBtn.style.display = 'none';
}

function adminForceNext() {
  if (index < total - 1) {
    index++;
    renderCurrent();
    adminBtn.style.display = 'none';
  } else {
    showSummary();
  }
}

function adminAutoSolve() {
  const q = allQuestions[index];

  if (q.type === 'mcq') {
    // === LOGIKA MCQ (Tidak Berubah) ===
    userSelected[index] = q.answer;
    const opts = document.querySelectorAll('.option-btn');
    if (opts[q.answer]) {
      opts.forEach(b => b.classList.remove('selected'));
      opts[q.answer].classList.add('selected');
    }
    const nBtn = document.getElementById('nextBtn');
    if (nBtn) {
      nBtn.disabled = false;
      nBtn.click(); // Trigger penilaian
    }

  } else if (q.type === 'drag') {
    
    // 1. Reset soal ke kondisi awal (bersih)
    renderCurrent();
    
    // 2. Gunakan setTimeout kecil untuk memastikan DOM sudah siap setelah renderCurrent
    setTimeout(() => {
      if (typeof window.solveCurrentDrag === 'function') {
        // 3. Panggil fungsi solver internal yang sudah kita buat di renderDrag
        window.solveCurrentDrag();
        
      } else {
        showToast("Gagal melakukan auto-solve. Handler tidak ditemukan.", "danger");
      }
    }, 50);
  }
}



const adminBtn = document.getElementById("adminBtn");

if (adminBtn) {
  // Ambil referensi elemen modal dari HTML
  const adminBtn = document.getElementById("adminBtn");
  const adminIcon = adminBtn.querySelector('i');
  const modalOverlay = document.getElementById("adminModalOverlay");
  const modalBox = document.getElementById("adminModalBox");
  const loginBtn = document.getElementById("adminLoginBtn");
  const batalBtn = document.getElementById("adminBatalBtn");
  const userInput = document.getElementById("adminUsername");
  const passInput = document.getElementById("adminPassword");
  const messageBox = document.getElementById("adminModalMessage");
  const togglePassword = document.getElementById("togglePassword");

  // Fungsi untuk menampilkan modal
  function showLoginModal() {
    messageBox.style.display = 'none'; // Sembunyikan pesan
    messageBox.textContent = '';
    messageBox.className = ''; // Hapus class error/success
    userInput.value = '';
    passInput.value = '';

    passInput.setAttribute('type', 'password');
    if (togglePassword) {
      togglePassword.classList.remove('bi-eye-slash-fill');
      togglePassword.classList.add('bi-eye-fill');
      togglePassword.title = "Tampilkan password";
    }

    modalOverlay.classList.add('visible');
    userInput.focus(); // Langsung fokus ke username
  }

  // Fungsi untuk menyembunyikan modal
  function hideLoginModal() {
    modalOverlay.classList.remove('visible');
  }

  adminBtn.addEventListener("click", () => {
    showLoginModal();
  });

  if (togglePassword) {
    togglePassword.addEventListener("click", () => {
      // Cek tipe input saat ini
      const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passInput.setAttribute('type', type);

      // Ubah ikon mata
      if (type === 'text') {
        togglePassword.classList.remove('bi-eye-fill');
        togglePassword.classList.add('bi-eye-slash-fill');
        togglePassword.title = "Sembunyikan password";
      } else {
        togglePassword.classList.remove('bi-eye-slash-fill');
        togglePassword.classList.add('bi-eye-fill');
        togglePassword.title = "Tampilkan password";
      }
    });
  }

  // --- Event Listener Tombol "Login" di Dalam Modal ---
  loginBtn.addEventListener("click", () => {
    // Ambil nilai dari input
    const user = userInput.value;
    const pass = passInput.value;

    const ADMIN_USER = atob("YWRpbA=="); 
    const ADMIN_PASS = atob("MjQyNTI2");
    
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      // --- Login Sukses ---
      messageBox.textContent = "Login Berhasil.";
      messageBox.className = 'success'; // Terapkan class sukses
      messageBox.style.display = 'block';

      // Nonaktifkan tombol sementara
      loginBtn.disabled = true;

      // Tutup modal setelah jeda singkat agar pesan terbaca
      setTimeout(() => {
        hideLoginModal();
        isAdminLoggedIn = true;
        updateAdminButtonUI(); 
        loginBtn.disabled = false; 


        showToast("<b>[ADMIN]</b> Akses diberikan. Toolbar diaktifkan.", "success");
      }, 1200); // Jeda 1.2 detik

    } else {
      // --- Login Gagal ---
      messageBox.textContent = "Login Gagal. Username atau Password salah.";
      messageBox.className = 'error'; // Terapkan class error
      messageBox.style.display = 'block';
    }
  });

  // (BARU) Izinkan 'Enter' untuk login
  passInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
          loginBtn.click(); // Simulasikan klik tombol login
      }
  });
  
  userInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
          passInput.focus(); // Pindah ke password
      }
  });

  // --- Event Listener Tombol "Batal" dan Klik Latar ---
  batalBtn.addEventListener("click", hideLoginModal);
  modalOverlay.addEventListener("click", (e) => {
    // Hanya tutup jika klik di overlay (latar), bukan di kotak modal
    if (e.target === modalOverlay) {
      hideLoginModal();
    }
  });
}

// initial
setupQuiz();
renderCurrent();