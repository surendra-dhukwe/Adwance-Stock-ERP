const express = require('express');
const router = express.Router();
const db = require('../db');
const XLSX = require('xlsx');

/* ================= EXPORT FUNCTION ================= */
async function exportStock(stockTable, stockName, res){
    try {
        const [result] = await db.query(`
            SELECT 
                code,
                name,
                loose_code,
                bags,
                quantity,
                total_quantity,
                type,
                entry_date
            FROM ${stockTable}
            ORDER BY entry_date DESC
        `);

        // ✅ Format data (clean + readable)
        const formatted = result.map(row => ({
            Code: row.code || "",
            Name: row.name || "",
            Loose_Code: row.loose_code || "",
            Bags: row.bags || 0,
            Per_Bag_Qty: row.quantity || 0,
            Total_Qty: row.total_quantity || 0,
            Type: row.type || "",
            Date: row.entry_date 
                ? new Date(row.entry_date).toLocaleString()
                : ""
        }));

        const ws = XLSX.utils.json_to_sheet(formatted);
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, stockName);

        const buffer = XLSX.write(wb, { 
            type: "buffer", 
            bookType: "xlsx" 
        });

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${stockName.toLowerCase()}_transactions.xlsx`
        );

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.send(buffer);

    } catch(err){
        console.log("🔥 Export Error:", err);
        res.status(500).json({ message: "Export Failed" });
    }
}

/* ================= ROUTES ================= */
router.get('/stock1/export', (req, res)=>{
    exportStock("transactions_stock1", "Stock1", res);
});

router.get('/stock2/export', (req, res)=>{
    exportStock("transactions_stock2", "Stock2", res);
});

router.get('/stock3/export', (req, res)=>{
    exportStock("transactions_stock3", "Stock3", res);
});

router.get('/stock4/export', (req, res)=>{
    exportStock("transactions_stock4", "Stock4", res);
});

module.exports = router;