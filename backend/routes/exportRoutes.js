const express = require('express');
const router = express.Router();
const db = require('../db');
const XLSX = require('xlsx');


/* ================= STOCK1 TRANSACTION EXPORT ================= */

router.get('/stock1/export', (req,res)=>{

db.query("SELECT * FROM transactions_stock1",(err,result)=>{

if(err) return res.status(500).send(err);

const ws = XLSX.utils.json_to_sheet(result);

const wb = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb, ws, "Stock1_Transactions");

const filePath = "./stock1_transactions.xlsx";

XLSX.writeFile(wb, filePath);

res.download(filePath);

});

});



/* ================= STOCK2 TRANSACTION EXPORT ================= */

router.get('/stock2/export', (req,res)=>{

db.query("SELECT * FROM transactions_stock2",(err,result)=>{

if(err) return res.status(500).send(err);

const ws = XLSX.utils.json_to_sheet(result);

const wb = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb, ws, "Stock2_Transactions");

const filePath = "./stock2_transactions.xlsx";

XLSX.writeFile(wb, filePath);

res.download(filePath);

});

});


module.exports = router;