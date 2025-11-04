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
    const addButton = document.querySelector(".btn-add");
    const sizeInput = document.getElementById("size");
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

    addButton.addEventListener("click", function () {
        const size = sizeInput.value.trim();
        if (size === "") {
            alert("Please fill in the Size field!");
            return;
        }

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        row.appendChild(nameCell);

        const sizeCell = document.createElement("td");
        sizeCell.textContent = size;
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

        sizeInput.value = "";
        sizeInput.focus();
    });
});