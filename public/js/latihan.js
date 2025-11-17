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
  root.innerHTML = '';

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
  wrap.innerHTML = ''; // Bersihkan wrapper

  // 1. Buat div status sederhana (yang akan langsung terlihat)
  const simpleStatusDiv = document.createElement('div');
  simpleStatusDiv.className = 'simple-status animated ' + (isCorrect ? 'correct' : 'wrong');
  simpleStatusDiv.innerHTML = `
    <span>${isCorrect ? '✅ Jawaban benar!' : '❌ Jawaban salah.'}</span>
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
  pTable.innerHTML = '<thead><tr><th>Nama</th><th>Ukuran (KB)</th><th>Process</th></tr></thead><tbody></tbody>';
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
    el.addEventListener('dragstart', e=> e.dataTransfer.setData('text/plain', proc.name));
    pool.appendChild(el);
  });

  const totalSlots = PARTS.length;
  const waitingBody = document.getElementById('waitingBody');

  // helper: get ordered list of current used process names (by position)
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

  // helper: next expected proc name based on (partisi + waiting) count
  function getNextExpectedProc() {
    const usedCount = getUsedListOrdered().length;
    return PROCS[usedCount]?.name || null;
  }

  // add back to pool if not present
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

  // check whether all processes are placed (either in slots or waiting)
  function allPlaced() {
    const used = getUsedListOrdered();
    return used.length === totalProcesses;
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
      const simpleStatusDiv = document.createElement('div');
      simpleStatusDiv.className = 'simple-status ' + (allCorrect ? 'correct' : 'wrong');
      simpleStatusDiv.innerHTML = `
        <span>${allCorrect ? '✅ Jawaban Benar!' : '❌ Jawaban Salah!'}</span>
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
          summaryHtml += `<strong>✅ Hasil: Benar</strong> (${correctSlots}/${PARTS.length} slot).`;
      } else {
          // Hitung hanya slot yang 'terisi dengan benar'
          const correctFilledSlots = slotResults.filter(res => res.status === 'correct').length;
          summaryHtml += `<strong>❌ Hasil: Salah</strong> (${correctFilledSlots} benar dari ${PARTS.length} slot.)`;
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
                           <strong>✅ Hasil: Benar</strong> ${waiting.length > 0 ? `(${waiting.join(', ')})` : '(Kosong)'}
                         </div>`;
      } else {
          // Gunakan kembali logika .wait-detail yang sudah jelas
          const userWaitText = userWait.length > 0 ? userWait.join(', ') : 'Kosong';
          const expectedWaitText = waiting.length > 0 ? waiting.join(', ') : 'Kosong';
          const forgotten = waiting.filter(proc => !userWait.includes(proc));

          waitSummary = `<div class="eval-section eval-wrong">
                           <strong>❌ Hasil: Salah</strong>
                           <div class="wait-detail">Jawaban Anda: <strong>${userWaitText}</strong></div>
                           <div class="wait-detail">Seharusnya: <strong>${expectedWaitText}</strong></div>`;
          if (forgotten.length > 0) {
              waitSummary += `<div class="wait-detail missed">❗ Proses <strong>${forgotten.join(', ')}</strong> tidak dimasukkan.</div>`;
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
      showHint(`💡 Harap masukkan ${expected} terlebih dahulu sebelum ${procName}.`);
      return;
    }

    // if already filled
    if (td.dataset.proc) {
      showHint(`❗ Slot ini sudah diisi (${td.dataset.proc}). Hapus dulu sebelum mengganti.`);
      return;
    }

    // check size
    const slotIndex = parseInt(td.dataset.slot);
    const procObj = PROCS.find(p=>p.name===procName);
    const partSize = PARTS[slotIndex];

    if (procObj.size > partSize) {
      // not fit -> directly to waiting
      addToWaiting(procName);
      refreshNextButtonState();
      return;
    }

    // place into slot
    placeIntoSlot(td, procName);
  }

  // show small hint message
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
    setTimeout(()=>{ hintBox.style.opacity = '0'; }, 1500);
  }

  // attach slot events
  for (let i=0;i<totalSlots;i++){
    const slot = document.getElementById(`slot-${i}`);
    slot.addEventListener('dragover', e=> e.preventDefault());
    slot.addEventListener('dragenter', ()=> slot.classList.add('drop-hover'));
    slot.addEventListener('dragleave', ()=> slot.classList.remove('drop-hover'));
    slot.addEventListener('drop', onDropHandler);
  }

  // waiting drop zone events
  waitingBody.addEventListener('dragover', e=> e.preventDefault());
  waitingBody.addEventListener('drop', e=>{
    e.preventDefault();
    const procName = e.dataTransfer.getData('text/plain');
    if (!procName) return;
    const expected = getNextExpectedProc();
    if (procName !== expected) {
      showHint(`💡 Harap masukkan ${expected} terlebih dahulu.`);
      return;
    }
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
      const explainWrap = root.querySelector('#explainWrap');
      if (explainWrap) {
        explainWrap.innerHTML = `<div class="loading-anim">⏳ Memeriksa jawaban...</div>`;
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

  // (DIUBAH) Render HTML dengan ID baru dan nilai awal 0
  root.innerHTML = `
    <div class="result-wrapper">
      <div class="result-title">Hasil Akhir Latihan</div>
      <div class="result-subtitle">Berikut ringkasan performa Anda</div>

      <div class="score-ring" id="finalScoreRing" style="--score-angle: 0deg;">
        <div class="score-text" id="finalScoreText">0%</div>
      </div>

      <div class="breakdown-box">
        <strong>📝 Soal Pilihan Ganda</strong>
        <div class="breakdown-small">${mcqCorrect} benar dari ${numMcqToSelect} soal</div>
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
  if (progressWrapper) progressWrapper.style.display = 'none';


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
  // Durasi animasi (dalam milidetik). 
  // Harus sama dengan durasi 'transition' di CSS (misal: 1s -> 1000ms)
  const animationDuration = 2000; 
  
  // 1. Animasi Angka (Teks Persentase)
  let startValue = 0;
  const endValue = percent;
  const intervalTime = Math.max(16, animationDuration / endValue); // Waktu per langkah

  if (endValue > 0) {
      const counter = setInterval(() => {
        startValue += 1;
        if (startValue >= endValue) {
          startValue = endValue; // Pastikan pas
          clearInterval(counter);
        }
        scoreText.textContent = `${startValue}%`;
      }, intervalTime);
  } else {
      scoreText.textContent = `0%`;
  }

  // 2. Animasi Progress Bar (Lingkaran)
  // Beri browser 'jeda' sesaat (10ms) untuk merender HTML di atas
  // sebelum kita mengubah style-nya. Ini akan memicu transisi CSS.
  setTimeout(() => {
    if (scoreRing) {
      scoreRing.style.setProperty('--score-angle', `${angle}deg`);
    }
  }, 10);
  
  // --- Akhir Logika Animasi ---

  document.getElementById('restartBtn').addEventListener('click', () => {
    // (BARU) Saat restart, reset juga angle agar animasi bisa jalan lagi
    const ring = document.getElementById('finalScoreRing');
    if (ring) ring.style.setProperty('--score-angle', '0deg');
    
    setupQuiz(); 
    renderCurrent(); 
  });
}


// initial
setupQuiz();
renderCurrent();