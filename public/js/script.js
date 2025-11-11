// Jangan ngoding yang lain di sini, khusus simulasi

fetch('templates/navbar.html')
    .then(response => {
        if (!response.ok) {
            throw new Error('Gagal memuat navbar');
        }
        return response.text();
    })
    .then(html => {
        document.getElementById('navbar-container').innerHTML = html;
    })
    .catch(error => console.error(error));

document.addEventListener("DOMContentLoaded", function () {
    // ==============================
    // PART 1: PARTITION HANDLER
    // ==============================
    const addButton = document.getElementById("addPartition");
    const sizeInput = document.getElementById("partitionSize");
    const tableBody = document.getElementById("partitionTableBody");

    function getPartitionName(num) {
        let name = "";
        while (num >= 0) {
            name = String.fromCharCode((num % 26) + 65) + name;
            num = Math.floor(num / 26) - 1;
        }
        return name;
    }

    function updatePartitionNames() {
        const rows = tableBody.querySelectorAll("tr");
        rows.forEach((row, index) => {
            const nameCell = row.querySelector("td:first-child");
            nameCell.textContent = getPartitionName(index);
        });
    }

    function addPartition() {
        const raw = sizeInput.value;
        if (raw === null) return; // safety
        const sizeStr = String(raw).trim();

        // Validasi: harus angka positif (boleh 0 kalau mau)
        const sizeNum = Number(sizeStr);
        if (sizeStr === "" || !isFinite(sizeNum) || sizeNum <= 0) {
            alert("Please enter a valid positive number for partition size!");
            sizeInput.focus();
            return;
        }

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        row.appendChild(nameCell);

        const sizeCell = document.createElement("td");
        sizeCell.textContent = sizeNum;
        row.appendChild(sizeCell);

        const actionCell = document.createElement("td");
        actionCell.classList.add("text-center");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "×";
        deleteBtn.classList.add("btn", "btn-danger", "btn-sm", "rounded-circle");
        deleteBtn.style.width = "28px";
        deleteBtn.style.height = "28px";

        deleteBtn.addEventListener("click", function () {
            row.remove();
            updatePartitionNames();
        });

        actionCell.appendChild(deleteBtn);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
        updatePartitionNames();

        // enable inline edit for the newly created size cell
        enableInlineEdit(sizeCell);

        sizeInput.value = "";
        sizeInput.focus();
    }

    // attach both click and Enter to the same function
    addButton.addEventListener("click", addPartition);

    // ensure keydown listener attached only once
    if (!sizeInput.dataset.keyListener) {
        sizeInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                addPartition(); // call directly (no reliance on click())
            }
        });
        sizeInput.dataset.keyListener = "true";
    }


    // ==============================
    // PART 2: PROCESS HANDLER
    // ==============================
    const processAddButton = document.getElementById("addProcess");
    const processSizeInput = document.getElementById("processSize");
    const processTableBody = document.getElementById("processTableBody");

    function getProcessName(num) {
        return "P" + (num + 1);
    }

    function updateProcessNames() {
        const rows = processTableBody.querySelectorAll("tr");
        rows.forEach((row, index) => {
            const nameCell = row.querySelector("td:first-child");
            nameCell.textContent = getProcessName(index);
        });
    }

    function addProcess() {
        const raw = processSizeInput.value;
        if (raw === null) return;
        const sizeStr = String(raw).trim();
        const sizeNum = Number(sizeStr);
        if (sizeStr === "" || !isFinite(sizeNum) || sizeNum <= 0) {
            alert("Please enter a valid positive number for process size!");
            processSizeInput.focus();
            return;
        }

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        row.appendChild(nameCell);

        const sizeCell = document.createElement("td");
        sizeCell.textContent = sizeNum;
        row.appendChild(sizeCell);

        const actionCell = document.createElement("td");
        actionCell.classList.add("text-center");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "×";
        deleteBtn.classList.add("btn", "btn-danger", "btn-sm", "rounded-circle");
        deleteBtn.style.width = "28px";
        deleteBtn.style.height = "28px";

        deleteBtn.addEventListener("click", function () {
            row.remove();
            updateProcessNames();
        });

        actionCell.appendChild(deleteBtn);
        row.appendChild(actionCell);

        processTableBody.appendChild(row);
        updateProcessNames();

        // enable inline edit for the newly created size cell
        enableInlineEdit(sizeCell);

        processSizeInput.value = "";
        processSizeInput.focus();
    }

    processAddButton.addEventListener("click", addProcess);

    if (!processSizeInput.dataset.keyListener) {
        processSizeInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                addProcess();
            }
        });
        processSizeInput.dataset.keyListener = "true";
    }

    // ==============================
    // INLINE EDIT FUNCTION
    // ==============================
    function enableInlineEdit(cell) {
        if (!cell) return;
        // guard if listener already attached
        if (cell.dataset.inline === "true") return;
        cell.dataset.inline = "true";

        cell.addEventListener("dblclick", function () {
            const oldValue = cell.textContent.trim();
            const input = document.createElement("input");
            input.type = "number";
            input.value = oldValue;
            input.className = "form-control form-control-sm";
            input.style.width = "100px";
            input.style.display = "inline-block";

            cell.textContent = "";
            cell.appendChild(input);
            input.focus();

            input.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    saveEdit();
                }
            });

            input.addEventListener("blur", saveEdit);

            function saveEdit() {
                const newValue = input.value.trim();

                if (newValue === "" || isNaN(newValue) || Number(newValue) <= 0) {
                    cell.textContent = oldValue;
                } else {
                    cell.textContent = Number(newValue); // save numeric
                }

                // setelah simpan, update penamaan (kalau perlu)
                updatePartitionNames();
                updateProcessNames();
            }
        });
    }

    // ==============================
    // PART 3: RESULT HANDLER
    // ==============================
    document.querySelector(".btn-pink").addEventListener("click", () => {
        const algorithm = document.querySelector("select.form-select").value;
        const partitions = getTableData("partitionTableBody");
        const processes = getTableData("processTableBody");

        if (partitions.length === 0 || processes.length === 0) {
            alert("Please add at least one partition and one process!");
            return;
        }

        // Salin partisi agar tidak merusak data asli
        const blocks = partitions.map(p => ({
            name: p.name,
            size: p.size,
            used: false,
            parent: p.name
        }));

        const allocationResult = [];

        processes.forEach(proc => {
            let allocated = false;
            let chosenIndex = -1;

            if (algorithm === "First-Fit") {
                for (let i = 0; i < blocks.length; i++) {
                    if (!blocks[i].used && blocks[i].size >= proc.size) {
                        chosenIndex = i;
                        break;
                    }
                }
            }

            else if (algorithm === "Best-Fit") {
                let minDiff = Infinity;
                for (let i = 0; i < blocks.length; i++) {
                    if (!blocks[i].used && blocks[i].size >= proc.size) {
                        const diff = blocks[i].size - proc.size;
                        if (diff < minDiff) {
                            minDiff = diff;
                            chosenIndex = i;
                        }
                    }
                }
            }

            else if (algorithm === "Worst-Fit") {
                let maxDiff = -1;
                for (let i = 0; i < blocks.length; i++) {
                    if (!blocks[i].used && blocks[i].size >= proc.size) {
                        const diff = blocks[i].size - proc.size;
                        if (diff > maxDiff) {
                            maxDiff = diff;
                            chosenIndex = i;
                        }
                    }
                }
            }

            // === Proses alokasi ===
            if (chosenIndex !== -1) {
                const block = blocks[chosenIndex];
                allocationResult.push({
                    process: proc.name,
                    size: proc.size,
                    partition: block.name,
                    parent: block.parent
                });

                block.used = true;
                allocated = true;

                const remaining = block.size - proc.size;
                if (remaining > 0) {
                    const newBlockName = `${block.name}-${proc.name}`;
                    blocks.splice(chosenIndex + 1, 0, {
                        name: newBlockName,
                        size: remaining,
                        used: false,
                        parent: block.parent
                    });
                }
            }

            if (!allocated) {
                allocationResult.push({
                    process: proc.name,
                    size: proc.size,
                    partition: "Not Allocated",
                    parent: null
                });
            }
        });

        showResultDynamic(allocationResult, blocks);
    });

    function getTableData(tableId) {
        const tableBody = document.getElementById(tableId);
        const rows = tableBody.querySelectorAll("tr");
        const data = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
                const name = cells[0].textContent.trim();
                const size = parseInt(cells[1].textContent.trim());
                data.push({ name, size });
            }
        });

        return data;
    }

    function showResultDynamic(allocationResult, blocks) {
        const inputCard = document.querySelector(".memoalloc-card");
        const resultCard = document.querySelector(".result-card");
        const tbody = document.querySelector("#resultTable tbody");
        const explanation = document.getElementById("resultExplanation");

        tbody.innerHTML = "";

        // Grupkan blok berdasarkan parent (partisi utama)
        const grouped = {};
        blocks.forEach(b => {
            if (!grouped[b.parent]) grouped[b.parent] = [];
            grouped[b.parent].push(b);
        });

        // Bangun tabel hasil
        Object.keys(grouped).forEach(parent => {
            grouped[parent].forEach(block => {
                const allocated = allocationResult.find(
                    a => a.partition === block.name
                );

                const row = document.createElement("tr");
                row.innerHTML = `
            <td>${block.name === parent ? parent : ""}</td>
            <td>${block.size}</td>
            <td>${allocated ? allocated.process : "-"}</td>
            <td>${allocated ? allocated.size : "-"}</td>
        `;
                tbody.appendChild(row);
            });
        });

        const notAllocated = allocationResult.filter(a => a.partition === "Not Allocated");
        const allocatedCount = allocationResult.length - notAllocated.length;
        const algorithm = document.querySelector("select.form-select").value;

        const unallocatedList = notAllocated.length > 0
            ? `<br><b>Proses yang tidak teralokasi:</b> ${notAllocated.map(a => a.process).join(", ")}`
            : "";

        let algorithmDesc = "";
        if (algorithm === "First-Fit") {
            algorithmDesc = `
                    Algoritma <b>First-Fit</b> memungkinkan proses untuk ditempatkan di blok memori kosong pertama yang ukurannya cukup besar untuk menampung proses tersebut. Pemindaian dimulai dari awal memori dan berhenti segera setelah menemukan ruang yang cukup.
                `;
        } else if (algorithm == "Best-Fit") {
            algorithmDesc = `
                    Algoritma <b>Best-Fit</b> memilih blok terkecil yang masih cukup besar untuk menampung proses. Semua blok diperiksa terlebih dahulu sebelum memilih yang paling sesuai.
                `;
        } else if (algorithm == "Worst-Fit") {
            algorithmDesc = `
                    Algoritma <b>Worst-Fit</b> Memilih blok terbesar yang tersedia untuk menampung proses. Tujuannya adalah menyisakan ruang kosong besar, agar bisa digunakan oleh proses lain di masa mendatang.
                `;
        }

        explanation.innerHTML = `
            ${algorithmDesc}
            <br><br>
            Total blok terbentuk: ${blocks.length}<br>
            <ul>
                <li>${allocatedCount} proses berhasil dialokasikan.</li>
                <li>${notAllocated.length} proses tidak mendapat partisi.</li>
            </ul>
            ${unallocatedList}
        `;

        inputCard.classList.add("d-none");
        resultCard.classList.remove("d-none");

        document.getElementById("backButton").onclick = () => {
            resultCard.classList.add("d-none");
            inputCard.classList.remove("d-none");
        };
    }
});
