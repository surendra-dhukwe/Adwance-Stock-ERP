const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./db");
const productRoutes = require("./routes/productRoutes");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC ================= */
app.use(express.static(path.join(__dirname, "../frontend")));

/* ================= ROUTES ================= */
app.use("/products", productRoutes);

/* ================= PRODUCTS STOCK ================= */
app.get("/products-stock/:stock", async (req, res) => {
    try {
        const stock = req.params.stock.toLowerCase();
        const validStocks = ["stock1", "stock2", "stock3", "stock4"];

        if (!validStocks.includes(stock)) {
            return res.status(400).json({ message: "Invalid Stock" });
        }

        const table = `transactions_${stock}`;

        const [rows] = await db.query(`
            SELECT 
                COALESCE(t.code, p.code) as cpp_code,
                COALESCE(t.name, p.name) as name,
                p.loose_code,
                COALESCE(SUM(
                    CASE 
                        WHEN t.type='receive' THEN t.total_quantity
                        WHEN t.type='dispatch' THEN -t.total_quantity
                        ELSE 0 
                    END
                ),0) AS stock
            FROM ${table} t
            LEFT JOIN products_master p 
                ON p.code = t.code
            GROUP BY COALESCE(t.code, p.code), COALESCE(t.name, p.name), p.loose_code
            ORDER BY cpp_code ASC
        `);

        res.json(rows);

    } catch (err) {
        console.log("Stock Fetch Error:", err);
        res.status(500).json({ message: "Database Error" });
    }
});

/* ================= ALL TRANSACTIONS ================= */
app.get("/all-transactions/:stock", async (req, res) => {
    try {
        const stock = req.params.stock.toLowerCase();
        const validStocks = ["stock1", "stock2", "stock3", "stock4"];

        if (!validStocks.includes(stock)) {
            return res.status(400).json({ message: "Invalid Stock" });
        }

        const table = `transactions_${stock}`;

        const [rows] = await db.query(`
            SELECT 
                code,
                name,
                total_quantity,
                type,
                entry_date
            FROM ${table}
            ORDER BY entry_date DESC
        `);

        res.json(rows);

    } catch (err) {
        console.log("🔥 Transactions Fetch Error:", err);
        res.status(500).json({ message: "Database Error" });
    }
});

/* ================= FINAL STOCK DOWNLOAD ================= */
app.get("/final-stock/:stock/download", async (req, res) => {
    try {
        const stock = req.params.stock.toLowerCase();
        const validStocks = ["stock1", "stock2", "stock3", "stock4"];

        if (!validStocks.includes(stock)) {
            return res.status(400).json({ message: "Invalid Stock" });
        }

        const table = `transactions_${stock}`;

        const [rows] = await db.query(`
            SELECT 
                code,
                name,
                SUM(
                    CASE 
                        WHEN type='receive' THEN total_quantity
                        WHEN type='dispatch' THEN -total_quantity
                        ELSE 0 
                    END
                ) as final_stock
            FROM ${table}
            GROUP BY code, name
            ORDER BY code ASC
        `);

        let csv = "Code,Name,Final Stock\n";

        rows.forEach(r => {
            csv += `${r.code || ""},${r.name},${r.final_stock}\n`;
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
    console.log(`🚀 Server Running On: http://localhost:${PORT}`);
    console.log("=================================");
});