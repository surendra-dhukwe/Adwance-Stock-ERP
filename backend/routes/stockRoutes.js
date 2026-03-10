const express = require('express');
const router = express.Router();
const db = require('../db');


/* ================= STOCK 1 FINAL STOCK DOWNLOAD ================= */

router.get('/stock1/download', (req,res)=>{

const sql = `
SELECT 
code,
MAX(name) AS name,
SUM(
CASE
WHEN type='receive' THEN total_quantity
WHEN type='dispatch' THEN -total_quantity
ELSE 0
END
) AS total_quantity
FROM transactions_stock1
GROUP BY code
ORDER BY code
`;

db.query(sql,(err,results)=>{

if(err) return res.status(500).send(err);

let csvContent = "Code,Name,Final Stock\n";

results.forEach(row=>{
csvContent += `${row.code},${row.name},${row.total_quantity}\n`;
});

res.setHeader('Content-disposition','attachment; filename=stock1_final_stock.csv');
res.set('Content-Type','text/csv');
res.status(200).send(csvContent);

});

});


/* ================= STOCK 2 FINAL STOCK DOWNLOAD ================= */

router.get('/stock2/download', (req,res)=>{

const sql = `
SELECT 
code,
MAX(name) AS name,
SUM(
CASE
WHEN type='receive' THEN total_quantity
WHEN type='dispatch' THEN -total_quantity
ELSE 0
END
) AS total_quantity
FROM transactions_stock2
GROUP BY code
ORDER BY code
`;

db.query(sql,(err,results)=>{

if(err) return res.status(500).send(err);

let csvContent = "Code,Name,Final Stock\n";

results.forEach(row=>{
csvContent += `${row.code},${row.name},${row.total_quantity}\n`;
});

res.setHeader('Content-disposition','attachment; filename=stock2_final_stock.csv');
res.set('Content-Type','text/csv');
res.status(200).send(csvContent);

});

});


module.exports = router;