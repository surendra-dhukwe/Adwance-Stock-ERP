/* ================= LOAD PRODUCTS ================= */

let products = [];

/* Detect stock type from URL */
let stockType = "stock1";
if(window.location.pathname.toLowerCase().includes("stock2")){
    stockType = "stock2";
}

/* Load product list from DB */
fetch("http://localhost:3000/products")
.then(res => res.json())
.then(data => {
    products = data;
    console.log("Products Loaded:",products);
    addRow(); // Add first row on load
})
.catch(err=>{
    console.log("Product Load Error",err);
});

/* ================= ADD ROW ================= */
function addRow(){
    const table=document.querySelector("#itemTable tbody");
    const row=table.insertRow();

    /* CODE COLUMN */
    const codeCell=row.insertCell(0);
    const codeInput=document.createElement("input");
    codeInput.type="text";
    codeInput.placeholder="Code";
    codeInput.setAttribute("list","codeList");

    codeInput.addEventListener("input",function(){
        showSuggestion(this);
        autoFillName(this);
    });

    codeCell.appendChild(codeInput);

    /* NAME COLUMN */
    const nameCell=row.insertCell(1);
    const nameInput=document.createElement("input");
    nameInput.type="text";
    nameInput.placeholder="Name";
    nameInput.readOnly=true;
    nameCell.appendChild(nameInput);

    /* BAGS */
    const bagsCell=row.insertCell(2);
    const bagsInput=document.createElement("input");
    bagsInput.type="number";
    bagsInput.placeholder="Bags";
    bagsInput.min=0;
    bagsInput.addEventListener("keydown",(e)=>{ handleKeyEvents(e, bagsInput); });
    bagsInput.addEventListener("input",(e)=>{ calculateRow(bagsInput,e); });
    bagsCell.appendChild(bagsInput);

    /* QUANTITY */
    const qtyCell=row.insertCell(3);
    const qtyInput=document.createElement("input");
    qtyInput.type="number";
    qtyInput.placeholder="Quantity";
    qtyInput.min=0;
    qtyInput.addEventListener("keydown",(e)=>{ handleKeyEvents(e, qtyInput); });
    qtyInput.addEventListener("input",(e)=>{ calculateRow(qtyInput,e); });
    qtyCell.appendChild(qtyInput);

    /* TOTAL */
    const totalCell=row.insertCell(4);
    const totalInput=document.createElement("input");
    totalInput.type="number";
    totalInput.readOnly=true;
    totalCell.appendChild(totalInput);

    codeInput.focus();
}

/* ================= HANDLE KEY EVENTS FOR ROWS ================= */
function handleKeyEvents(event, input){
    const row=input.parentElement.parentElement;
    const tbody=row.parentElement;

    // ENTER adds new row
    if(event.key==="Enter"){
        event.preventDefault();
        addRow();
        document.querySelector("#itemTable tbody tr:last-child")
        .cells[0].querySelector("input").focus();
    }

    // DELETE removes current row (if more than 1 row exists)
    if(event.key==="Delete" || event.key==="Backspace"){
        const allRows=tbody.querySelectorAll("tr");
        if(allRows.length>1){
            row.remove();
            updateTotals();
        }
    }
}

/* ================= CALCULATE ROW ================= */
function calculateRow(input,event){
    const row=input.parentElement.parentElement;
    const bags=parseFloat(row.cells[2].querySelector("input").value)||0;
    const qty=parseFloat(row.cells[3].querySelector("input").value)||0;
    const total=bags*qty;
    row.cells[4].querySelector("input").value=total.toFixed(2);
    updateTotals();
}

/* ================= TOTALS ================= */
function updateTotals(){
    let totalBags=0;
    let totalQty=0;
    document.querySelectorAll("#itemTable tbody tr").forEach(row=>{
        const bags=parseFloat(row.cells[2].querySelector("input").value)||0;
        const total=parseFloat(row.cells[4].querySelector("input").value)||0;
        totalBags+=bags;
        totalQty+=total;
    });
    document.getElementById("totalBags").innerText=totalBags;
    document.getElementById("grandTotalQty").innerText=totalQty;
}

/* ================= SAVE TRANSACTION ================= */
function saveTransaction(){
    let type=localStorage.getItem("type");
    if(!type){
        if(window.location.pathname.includes("dispatch")) type="dispatch";
        else type="receive";
    }

    const items=[];
    const entryDate=document.getElementById("entryDate").value;

    document.querySelectorAll("#itemTable tbody tr").forEach(row=>{
        const code=row.cells[0].querySelector("input").value;
        const name=row.cells[1].querySelector("input").value;
        const totalQty=row.cells[4].querySelector("input").value;

        if(code){
            items.push({ code, name, totalQty });
        }
    });

    if(items.length===0) return alert("No valid items to save!");

    fetch(`http://localhost:3000/transactions/${stockType}`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            type:type,
            date:entryDate,
            items:items
        })
    })
    .then(res=>res.json())
    .then(data=>{
        alert("Saved Successfully");
        location.reload();
    })
    .catch(err=>{
        alert("Save Error");
        console.log(err);
    });
}

/* ================= EXCEL DOWNLOAD ================= */
function downloadExcel(){
    fetch(`http://localhost:3000/final-stock/${stockType}/download`)
    .then(res=>res.blob())
    .then(blob=>{
        let url=URL.createObjectURL(blob);
        let a=document.createElement("a");
        a.href=url;
        a.download=`${stockType}_final_stock.csv`;
        a.click();
    });
}