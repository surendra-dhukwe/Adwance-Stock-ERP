/* ================= GLOBAL PRODUCTS ================= */
let products = [];

/* ================= BASE URL ================= */
const BASE_URL = "http://localhost:3000";

/* ================= DETECT STOCK ================= */
let stockType = "stock1";
const pathName = window.location.pathname.toLowerCase();

if (pathName.includes("stock2")) stockType = "stock2";
else if (pathName.includes("stock3")) stockType = "stock3";
else if (pathName.includes("stock4")) stockType = "stock4";

/* ================= DETECT TYPE ================= */
let type = pathName.includes("dispatch") ? "dispatch" : "receive";

/* ================= DATE AUTO ================= */
window.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById("transactionDate");
    if (dateInput) {
        const today = new Date();
        dateInput.value = today.toISOString().split("T")[0];
    }
});

/* ================= LOAD PRODUCTS ================= */
async function loadProducts() {
    try {
        const res = await fetch(`${BASE_URL}/products`);
        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        products = data || [];

        const codeList = document.getElementById("codeList");
        const nameList = document.getElementById("nameList");
        const looseList = document.getElementById("looseList");

        if (codeList) codeList.innerHTML = "";
        if (nameList) nameList.innerHTML = "";
        if (looseList) looseList.innerHTML = "";

        products.forEach(p => {

            // CODE LIST
            if (codeList) {
                const c = document.createElement("option");
                c.value = p.code ?? "";
                c.label = p.name ?? "";
                codeList.appendChild(c);
            }

            // NAME LIST
            if (nameList) {
                const n = document.createElement("option");
                n.value = p.name ?? "";
                n.label = p.code ?? "";
                nameList.appendChild(n);
            }

            // LOOSE LIST
            if (looseList && p.loose_code) {
                const l = document.createElement("option");
                l.value = p.loose_code ?? "";
                l.label = p.name ?? "";
                looseList.appendChild(l);
            }
        });

        const tbody = document.querySelector("#itemTable tbody");
        if (tbody && tbody.children.length === 0) {
            addRow();
        }

    } catch (err) {
        console.log("Product Load Error:", err);
        alert("❌ Backend not connected");
    }
}

/* ================= ADD ROW ================= */
function addRow() {
    const table = document.querySelector("#itemTable tbody");
    if (!table) return;

    const row = table.insertRow();

    row.innerHTML = `
        <td><input class="code" list="codeList"></td>
        <td><input class="name" list="nameList"></td>
        <td><input class="loose" list="looseList" placeholder="Loose Code"></td>
        <td><input type="number" class="bags"></td>
        <td><input type="number" class="qty"></td>
        <td><input class="total" readonly></td>
    `;

    const codeInput = row.querySelector(".code");
    const nameInput = row.querySelector(".name");
    const looseInput = row.querySelector(".loose");

    /* ===== CODE → ALL ===== */
    codeInput.addEventListener("input", function () {
        const val = this.value?.trim();
        const product = products.find(p => (p.code ?? "") == val);

        if (product) {
            nameInput.value = product.name || "";
            looseInput.value = product.loose_code || "";
        }
    });

    /* ===== NAME → ALL ===== */
    nameInput.addEventListener("input", function () {
        const val = this.value?.trim().toLowerCase();

        const product = products.find(p =>
            (p.name ?? "").toLowerCase() === val
        );

        if (product) {
            codeInput.value = product.code || "";
            looseInput.value = product.loose_code || "";
        }
    });

    /* ===== LOOSE → ALL ===== */
    looseInput.addEventListener("input", function () {
        const val = this.value?.trim();

        const product = products.find(p => (p.loose_code ?? "") == val);

        if (product) {
            codeInput.value = product.code || "";
            nameInput.value = product.name || "";
        }
    });

    /* ===== CALCULATION ===== */
    row.querySelectorAll(".bags,.qty").forEach(input => {
        input.addEventListener("input", calculateRow);
    });

    codeInput.focus();
}

/* ================= CALCULATE ================= */
function calculateRow(e) {
    const row = e.target.closest("tr");

    const bags = parseFloat(row.querySelector(".bags").value) || 0;
    const qty = parseFloat(row.querySelector(".qty").value) || 0;

    row.querySelector(".total").value = bags * qty;

    updateTotals();
}

/* ================= TOTAL ================= */
function updateTotals() {
    let totalBags = 0;
    let totalQty = 0;

    document.querySelectorAll("#itemTable tbody tr").forEach(row => {
        totalBags += parseFloat(row.querySelector(".bags").value) || 0;
        totalQty += parseFloat(row.querySelector(".total").value) || 0;
    });

    const tb = document.getElementById("totalBags");
    const tq = document.getElementById("grandTotalQty");

    if (tb) tb.innerText = totalBags;
    if (tq) tq.innerText = totalQty;
}

/* ================= SAVE ================= */
async function saveTransaction() {
    try {
        const rows = document.querySelectorAll("#itemTable tbody tr");
        let items = [];

        rows.forEach(row => {
            const code = row.querySelector(".code")?.value.trim();
            const name = row.querySelector(".name")?.value.trim();
            const loose_code = row.querySelector(".loose")?.value.trim();

            const bags = parseFloat(row.querySelector(".bags")?.value) || 0;
            const qty = parseFloat(row.querySelector(".qty")?.value) || 0;

            if (name || code) {
                items.push({
                    code: code || null,
                    name,
                    loose_code,
                    bags,
                    qty,
                    totalQty: bags * qty
                });
            }
        });

        if (items.length === 0) {
            alert("No items entered");
            return;
        }

        const res = await fetch(`${BASE_URL}/transactions/${stockType}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, items })
        });

        if (!res.ok) throw new Error("Save failed");

        await res.json();

        alert("✅ Saved Successfully");

        document.querySelector("#itemTable tbody").innerHTML = "";
        addRow();

    } catch (err) {
        console.log("SAVE ERROR:", err);
        alert("❌ Save failed");
    }
}

/* ================= DOWNLOAD ================= */
async function downloadExcel() {
    try {
        const res = await fetch(`${BASE_URL}/final-stock/${stockType}/download`);

        if (!res.ok) throw new Error();

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${stockType}_final_stock.csv`;
        a.click();

    } catch (err) {
        alert("❌ Download failed");
    }
}

/* ================= INIT ================= */
loadProducts();