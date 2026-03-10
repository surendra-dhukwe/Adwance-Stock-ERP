const express = require('express');
const router = express.Router();

const db = require('../db');


/* ================= GET ALL PRODUCTS ================= */

router.get('/', async (req,res)=>{

try{

const [rows] = await db.query(
"SELECT code,name FROM products_master ORDER BY code"
);

res.json(rows);

}

catch(err){

console.log(err);
res.status(500).send("Database Error");

}

});


/* ================= ADD PRODUCT ================= */

router.post('/', async (req,res)=>{

try{

const {code,name} = req.body;

await db.query(
"INSERT INTO products_master(code,name) VALUES(?,?)",
[code,name]
);

res.json({
message:"Product Added Successfully"
});

}

catch(err){

console.log(err);
res.status(500).send("Insert Error");

}

});


/* ================= STOCK1 CURRENT STOCK ================= */

router.get('/stock1', async (req,res)=>{

try{

const [rows] = await db.query(`

SELECT
p.code,
p.name,

COALESCE(SUM(
CASE
WHEN t.type='receive' THEN t.total_quantity
WHEN t.type='dispatch' THEN -t.total_quantity
ELSE 0
END
),0) AS stock

FROM products_master p

LEFT JOIN transactions_stock1 t
ON p.code = t.code

GROUP BY p.code,p.name
ORDER BY p.code

`);

res.json(rows);

}

catch(err){

console.log(err);
res.status(500).send("Database Error");

}

});


/* ================= STOCK2 CURRENT STOCK ================= */

router.get('/stock2', async (req,res)=>{

try{

const [rows] = await db.query(`

SELECT
p.code,
p.name,

COALESCE(SUM(
CASE
WHEN t.type='receive' THEN t.total_quantity
WHEN t.type='dispatch' THEN -t.total_quantity
ELSE 0
END
),0) AS stock

FROM products_master p

LEFT JOIN transactions_stock2 t
ON p.code = t.code

GROUP BY p.code,p.name
ORDER BY p.code

`);

res.json(rows);

}

catch(err){

console.log(err);
res.status(500).send("Database Error");

}

});


module.exports = router;