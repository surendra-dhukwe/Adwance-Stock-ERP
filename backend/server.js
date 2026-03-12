// javascript
const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./db");
const productRoutes = require("./routes/productRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC FRONTEND ================= */

app.use(express.static(path.join(__dirname, "../frontend")));

/* ================= ROUTES ================= */

app.use("/products", productRoutes);
app.use("/transactions", transactionRoutes);

/* ================= ALL TRANSACTIONS ================= */

app.get("/all-transactions/:stock", async (req, res) => {

    try {

        const stock = req.params.stock;

        let table = "";

        if (stock === "stock1") {
            table = "transactions_stock1";
        } 
        else if (stock === "stock2") {
            table = "transactions_stock2";
        } 
        else {
            return res.status(400).json({ message: "Invalid Stock" });
        }

        const [rows] = await db.query(`
            SELECT code, name, total_quantity, type, entry_date
            FROM ${table}
            ORDER BY entry_date DESC
        `);

        res.json(rows);

    } catch (err) {

        console.log("All Transaction Error:", err);
        res.status(500).json({ message: "Database Error" });

    }

});

/* ================= PRODUCTS STOCK ================= */

app.get("/products-stock/:stock", async (req, res) => {

    try {

        const stock = req.params.stock;

        let table = "";

        if (stock === "stock1") {
            table = "transactions_stock1";
        } 
        else if (stock === "stock2") {
            table = "transactions_stock2";
        } 
        else {
            return res.status(400).json({ message: "Invalid Stock" });
        }

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
            LEFT JOIN ${table} t ON p.code = t.code
            GROUP BY p.code,p.name
            ORDER BY p.code
        `);

        res.json(rows);

    } catch (err) {

        console.log("Stock Fetch Error:", err);
        res.status(500).json({ message: "Database Error" });

    }

});

/* ================= FINAL STOCK DOWNLOAD ================= */

app.get("/final-stock/:stock/download", async (req, res) => {

    try {

        const stock = req.params.stock;

        let table = "";

        if (stock === "stock1") {
            table = "transactions_stock1";
        } 
        else if (stock === "stock2") {
            table = "transactions_stock2";
        } 
        else {
            return res.status(400).json({ message: "Invalid Stock" });
        }

        const [rows] = await db.query(`
            SELECT 
                code,
                MAX(name) as name,
                SUM(
                    CASE
                        WHEN type='receive' THEN total_quantity
                        WHEN type='dispatch' THEN -total_quantity
                        ELSE 0
                    END
                ) as final_stock
            FROM ${table}
            GROUP BY code
            ORDER BY code
        `);

        let csv = "Code,Name,Final Stock\n";

        rows.forEach(row => {
            csv += `${row.code},${row.name},${row.final_stock}\n`;
        });

        res.header("Content-Type", "text/csv");
        res.attachment(`${stock}_final_stock.csv`);
        res.send(csv);

    } catch (err) {

        console.log("Download Error:", err);
        res.status(500).json({ message: "Download Error" });

    }

});

/* ================= HOME ================= */

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

/* ================= SERVER ================= */

const PORT = 3000;

app.listen(PORT, () => {
    console.log("=================================");
    console.log(`Server Running On: http://localhost:${PORT}`);
    console.log("=================================");
});