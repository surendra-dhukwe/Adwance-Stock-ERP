const express = require('express');
const router = express.Router();
const db = require('../db');

/* ================= GET ALL PRODUCTS ================= */
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT code, name, loose_code FROM products_master ORDER BY code ASC"
        );
        res.json(rows);
    } catch (err) {
        console.log("🔥 Product Fetch Error:", err);
        res.status(500).json({ message: "Database Error" });
    }
});

/* ================= ADD PRODUCT ================= */
router.post('/', async (req, res) => {
    try {
        const { code, name, loose_code } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        await db.query(
            "INSERT INTO products_master(code, name, loose_code) VALUES(?,?,?)",
            [code || null, name, loose_code || null]
        );

        res.json({ message: "Product Added Successfully" });

    } catch (err) {
        console.log("🔥 Insert Error:", err);
        res.status(500).json({ message: err.message });
    }
});

/* ================= UPDATE PRODUCT ================= */
router.put('/', async (req, res) => {
    try {
        const { cpp_code, name, loose_code } = req.body;

        const [existing] = await db.query(
            "SELECT * FROM products_master WHERE code = ?",
            [cpp_code]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: "Product Not Found" });
        }

        const old = existing[0];

        const updatedName = name || old.name;
        const updatedLoose = loose_code || old.loose_code;

        await db.query(
            `UPDATE products_master 
             SET name = ?, loose_code = ? 
             WHERE code = ?`,
            [updatedName, updatedLoose, cpp_code]
        );

        res.json({ message: "Product Updated" });

    } catch (err) {
        console.log("🔥 Update Error:", err);
        res.status(500).json({ message: "Error Updating Product" });
    }
});

/* ================= DELETE PRODUCT ================= */
router.delete('/:code', async (req, res) => {
    try {
        const code = req.params.code;

        await db.query(
            "DELETE FROM products_master WHERE code = ?",
            [code]
        );

        res.json({ message: "Deleted" });

    } catch (err) {
        console.log("🔥 Delete Error:", err);
        res.status(500).json({ message: "Error Deleting Product" });
    }
});

module.exports = router;