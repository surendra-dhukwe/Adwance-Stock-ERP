const express = require("express");
const router = express.Router();
const db = require("../db");

/* ================= SAVE TRANSACTION ================= */
async function saveTransaction(stockTable, type, items, res) {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        for (const item of items) {
            await conn.query(
                `INSERT INTO ${stockTable} 
                (code,name,loose_code,bags,quantity,total_quantity,type)
                VALUES (?,?,?,?,?,?,?)`,
                [
                    item.code || null,
                    item.name,                     // ⚠️ name must
                    item.loose_code || null,
                    item.bags || 0,
                    item.qty || 0,
                    item.totalQty || (item.bags * item.qty) || 0,
                    type
                ]
            );
        }

        await conn.commit();

        res.json({ message: `${stockTable} Saved Successfully` });

    } catch (err) {
        await conn.rollback();
        console.log("🔥 SAVE ERROR:", err);
        res.status(500).json({ message: err.message });

    } finally {
        conn.release();
    }
}

/* ================= SAVE ROUTE ================= */
router.post("/:stock", async (req, res) => {
    try {
        const stock = req.params.stock.toLowerCase();
        const validStocks = ["stock1", "stock2", "stock3", "stock4"];

        if (!validStocks.includes(stock)) {
            return res.status(400).json({ message: "Invalid Stock" });
        }

        const { type, items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "No items provided" });
        }

        const table = `transactions_${stock}`;
        await saveTransaction(table, type, items, res);

    } catch (err) {
        console.log("🔥 Route Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

/* ================= GET ================= */
router.get("/all-transactions/:stock", async (req, res) => {
    try {
        const stock = req.params.stock.toLowerCase();
        const table = `transactions_${stock}`;

        const [rows] = await db.query(`
            SELECT code,name,loose_code,bags,quantity,total_quantity,type,entry_date
            FROM ${table}
            ORDER BY entry_date DESC
        `);

        res.json(rows);

    } catch (err) {
        console.log("🔥 Fetch Error:", err);
        res.status(500).json({ message: "Database Error" });
    }
});

module.exports = router;