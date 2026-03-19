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
    const dateInput = document.getElementById("receiveDate");
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

        const list = document.getElementById("codeList");

        if (list) {
            list.innerHTML = "";

            products.forEach(p => {
                const option = document.createElement("option");
                option.value = p.code ?? "";
                option.label = p.name ?? "";
                list.appendChild(option);
            });
        }

        const tbody = document.querySelector("#itemTable tbody");
        if (tbody && tbody.children.length === 0) {
            addRow();
        }

    } catch (err) {
        console.log("Product Load Error:", err);
        alert("❌ Backend not connected (check server & API)");
    }
}

/* ================= ADD ROW ================= */
function addRow() {
    const table = document.querySelector("#itemTable tbody");
    if (!table) return;

    const row = table.insertRow();

    row.innerHTML = `
        <td><input class="code" list="codeList"></td>
        <td><input class="name" readonly></td>
        <td><input class="loose" placeholder="Loose Code"></td>
        <td><input type="number" class="bags"></td>
        <td><input type="number" class="qty"></td>
        <td><input class="total" readonly></td>
    `;

    const codeInput = row.querySelector(".code");

    codeInput.addEventListener("input", function () {
        const val = this.value?.trim();

        const product = products.find(p => (p.code ?? "") == val);

        if (product) {
            row.querySelector(".name").value = product.name || "";
            if (!row.querySelector(".loose").value) {
                row.querySelector(".loose").value = product.loose_code || "";
            }
        } else {
            row.querySelector(".name").value = "";
        }
    });

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
        alert("❌ Save failed (check backend & API)");
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