/* ================= GLOBAL PRODUCTS ================= */

let products = []

/* ================= DETECT STOCK ================= */

let stockType = "stock1"

if (window.location.pathname.toLowerCase().includes("stock2")) {
stockType = "stock2"
}

/* ================= DETECT TYPE ================= */

let type = "receive"

if (window.location.pathname.toLowerCase().includes("dispatch")) {
type = "dispatch"
}

/* ================= DATE AUTO ================= */

window.addEventListener("DOMContentLoaded", () => {

const dateInput = document.getElementById("receiveDate")

if(dateInput){

const today = new Date()

const yyyy = today.getFullYear()
const mm = String(today.getMonth()+1).padStart(2,"0")
const dd = String(today.getDate()).padStart(2,"0")

dateInput.value = `${yyyy}-${mm}-${dd}`

}

})

/* ================= LOAD PRODUCTS ================= */

fetch("/products")

.then(res => res.json())

.then(data => {

products = data

const list = document.getElementById("codeList")

if(list){

products.forEach(p => {

const option = document.createElement("option")

option.value = p.code
option.label = p.name

list.appendChild(option)

})

}

if(document.querySelector("#itemTable tbody") &&
document.querySelector("#itemTable tbody").children.length === 0){

addRow()

}

})

.catch(err=>{

console.log("Product Load Error",err)

})

/* ================= ADD ROW ================= */

function addRow(){

const table = document.querySelector("#itemTable tbody")

if(!table) return

const row = table.insertRow()

row.innerHTML = `

<td><input class="code" list="codeList"></td>
<td><input class="name" readonly></td>
<td><input type="number" class="bags"></td>
<td><input type="number" class="qty"></td>
<td><input class="total" readonly></td>

`

const codeInput = row.querySelector(".code")

codeInput.addEventListener("input",function(){

let code = this.value

let product = products.find(p => p.code == code)

if(product){
row.querySelector(".name").value = product.name
}else{
row.querySelector(".name").value = ""
}

})

row.querySelectorAll(".bags,.qty").forEach(input=>{
input.addEventListener("input",calculateRow)
})

row.querySelectorAll("input").forEach(input=>{

input.addEventListener("keydown",function(e){

if(e.key === "Enter"){

e.preventDefault()

addRow()

}

})

})

codeInput.focus()

}

/* ================= CALCULATE ================= */

function calculateRow(e){

const row = e.target.closest("tr")

const bags = parseFloat(row.querySelector(".bags").value) || 0
const qty = parseFloat(row.querySelector(".qty").value) || 0

const total = bags * qty

row.querySelector(".total").value = total

updateTotals()

}

/* ================= TOTAL ================= */

function updateTotals(){

let totalBags = 0
let totalQty = 0

document.querySelectorAll("#itemTable tbody tr").forEach(row=>{

const bags = parseFloat(row.querySelector(".bags").value) || 0
const total = parseFloat(row.querySelector(".total").value) || 0

totalBags += bags
totalQty += total

})

if(document.getElementById("totalBags")){
document.getElementById("totalBags").innerText = totalBags
}

if(document.getElementById("grandTotalQty")){
document.getElementById("grandTotalQty").innerText = totalQty
}

}

/* ================= SAVE ================= */

function saveTransaction(){

const rows = document.querySelectorAll("#itemTable tbody tr")

let items = []

rows.forEach(row=>{

const code = row.querySelector(".code").value
const name = row.querySelector(".name").value
const totalQty = row.querySelector(".total").value

if(code){
items.push({code,name,totalQty})
}

})

if(items.length === 0){
alert("No items entered")
return
}

let entryDate = document.getElementById("receiveDate").value

fetch(`/transactions/${stockType}`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

type:type,
date:entryDate,
items:items

})

})

.then(res=>res.json())

.then(data=>{

alert("Saved Successfully")

location.reload()

})

.catch(err=>{

console.log(err)

alert("Server Error")

})

}

/* ================= DOWNLOAD ================= */

function downloadExcel(){

fetch(`/final-stock/${stockType}/download`)

.then(res=>res.blob())

.then(blob=>{

const url = URL.createObjectURL(blob)

const a = document.createElement("a")

a.href = url

a.download = `${stockType}_final_stock.csv`

a.click()

})

}