import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "aditya",
  password: process.env.DB_PASSWORD || "Password@%5A",
  database: process.env.DB_NAME || "myappdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(express.json());

// API Routes
app.get("/api/moods", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM moods ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/moods", async (req, res) => {
  const { mood, thoughts } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO moods (mood, thoughts) VALUES (?, ?)",
      [mood, thoughts || ""]
    );
    res.json({ success: true, id: (result as any).insertId });
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/moods/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM moods WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/moods", async (req, res) => {
  try {
    await pool.query("DELETE FROM moods");
    await pool.query("ALTER TABLE moods AUTO_INCREMENT = 1");
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
