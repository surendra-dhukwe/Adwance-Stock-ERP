const express = require("express");
const router = express.Router();

const db = require("../db");


/* =========================
STOCK 1 TRANSACTION SAVE
========================= */

router.post("/stock1", async (req,res)=>{

try{

const { type, items } = req.body;

for(const item of items){

await db.query(

`INSERT INTO transactions_stock1
(code,name,total_quantity,type,entry_date)
VALUES (?,?,?,?,NOW())`,

[
item.code,
item.name,
item.totalQty,
type
]

);

}

res.json({
message:"Stock1 Transaction Saved Successfully"
});

}

catch(err){

console.log(err);

res.status(500).json({
message:"Database Error"
});

}

});



/* =========================
STOCK 2 TRANSACTION SAVE
========================= */

router.post("/stock2", async (req,res)=>{

try{

const { type, items } = req.body;

for(const item of items){

await db.query(

`INSERT INTO transactions_stock2
(code,name,total_quantity,type,entry_date)
VALUES (?,?,?,?,NOW())`,

[
item.code,
item.name,
item.totalQty,
type
]

);

}

res.json({
message:"Stock2 Transaction Saved Successfully"
});

}

catch(err){

console.log(err);

res.status(500).json({
message:"Database Error"
});

}

});



/* =========================
GET TRANSACTIONS REPORT
========================= */

router.get("/all-transactions/:stock", async (req,res)=>{

try{

const stock=req.params.stock;

let table="";

if(stock==="stock1"){

table="transactions_stock1";

}

else if(stock==="stock2"){

table="transactions_stock2";

}

else{

return res.status(400).json({
message:"Invalid Stock"
});

}


const [rows]=await db.query(

`SELECT code,name,total_quantity,type,entry_date
FROM ${table}
ORDER BY entry_date DESC`

);

res.json(rows);

}

catch(err){

console.log(err);

res.status(500).json({
message:"Database Error"
});

}

});


module.exports = router;