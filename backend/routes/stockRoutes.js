const express = require('express');
const router = express.Router();
const db = require('../db');

/* ================= FUNCTION TO DOWNLOAD FINAL STOCK ================= */
async function downloadStock(stockTable, stockName, res) {
    try {
        const sql = `
        SELECT 
            code,
            name,
            SUM(
                CASE
                    WHEN type='receive' THEN total_quantity
                    WHEN type='dispatch' THEN -total_quantity
                    ELSE 0
                END
            ) AS total_quantity
        FROM ${stockTable}
        GROUP BY code, name
        ORDER BY name
        `;

        const [results] = await db.query(sql);

        let csvContent = "Code,Name,Final Stock\n";

        results.forEach(row => {
            csvContent += `${row.code || ""},${row.name},${row.total_quantity || 0}\n`;
        });

        res.setHeader(
            'Content-disposition',
            `attachment; filename=${stockName.toLowerCase()}_final_stock.csv`
        );
        res.setHeader('Content-Type', 'text/csv');

        res.status(200).send(csvContent);

    } catch (err) {
        console.log("🔥 Final Stock Download Error:", err);
        res.status(500).json({ message: "Download Error" });
    }
}

/* ================= STOCK FINAL DOWNLOAD ROUTES ================= */
router.get('/stock1/download', (req, res) => {
    downloadStock('transactions_stock1', 'Stock1', res);
});

router.get('/stock2/download', (req, res) => {
    downloadStock('transactions_stock2', 'Stock2', res);
});

router.get('/stock3/download', (req, res) => {
    downloadStock('transactions_stock3', 'Stock3', res);
});

router.get('/stock4/download', (req, res) => {
    downloadStock('transactions_stock4', 'Stock4', res);
});

module.exports = router;