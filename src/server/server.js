const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const deepl = require("deepl-node");
const { Pool } = require("pg"); // <-- Using pg for Neon
require("dotenv").config();

const app = express();

// ==========================================
// 1. MIDDLEWARE & CONFIGURATION
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Initialize Neon Database Pool
// Neon requires SSL. Setting rejectUnauthorized to false is standard for cloud providers.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize DeepL
const translator = new deepl.Translator(process.env.DEEPL_API_KEY, {
  minTimeout: 60000, 
});

const MAX_FREE_TRANSLATIONS = 2;

// ==========================================
// 2. TRANSLATION ROUTE
// ==========================================
app.post("/api/translate", upload.single("file"), async (req, res) => {
  let client;
  try {
    const file = req.file;
    const { targetLang, email, sourceLang } = req.body;

    if (!file) return res.status(400).json({ error: "No file uploaded." });
    if (!email) return res.status(400).json({ error: "Email required." });

    client = await pool.connect();

    // Fetch or Create User
    let userRes = await client.query('SELECT * FROM app_users WHERE email = $1', [email]);
    let user;

    if (userRes.rows.length === 0) {
      const insertRes = await client.query(
        'INSERT INTO app_users (email, plan, translations_used) VALUES ($1, $2, $3) RETURNING *',
        [email, 'Free', 0]
      );
      user = insertRes.rows[0];
    } else {
      user = userRes.rows[0];
    }

    const currentUsage = user.translations_used || 0;

    // Check Limit
    if (user.plan === "Free" && currentUsage >= MAX_FREE_TRANSLATIONS) {
      try { fs.unlinkSync(file.path); } catch (e) {}
      return res.status(403).json({ error: "FREE_LIMIT_REACHED" });
    }

    // Translate
    const getLangCode = (str) => {
      if (!str || str === "Auto-Detect") return null;
      if (str.includes("French")) return "fr";
      if (str.includes("English")) return "en-US";
      if (str.includes("Spanish")) return "es";
      return null;
    };

    const translatedFilename = `translated-${Date.now()}-${file.originalname}`;
    const outputPath = path.join(__dirname, "uploads", translatedFilename);

    await translator.translateDocument(
      file.path, 
      outputPath, 
      getLangCode(sourceLang), 
      getLangCode(targetLang)
    );

    try { fs.unlinkSync(file.path); } catch (e) {}

    // Increment Usage & Save Document (Transaction)
    await client.query('BEGIN');

    const newUsageCount = currentUsage + 1;
    await client.query(
      'UPDATE app_users SET translations_used = $1 WHERE email = $2',
      [newUsageCount, email]
    );

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${translatedFilename}`;
    
    const docRes = await client.query(
      'INSERT INTO app_documents (email, name, lang, date, status, url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [email, file.originalname, targetLang, new Date().toLocaleDateString(), 'Done', fileUrl]
    );

    await client.query('COMMIT');

    res.status(200).json({ 
      success: true, 
      document: docRes.rows[0], 
      translationsUsed: newUsageCount 
    });

  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error("Translation Error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(500).json({ error: error.message || "Translation failed." });
  } finally {
    if (client) client.release();
  }
});

// ==========================================
// 3. FETCH ACCOUNT STATUS
// ==========================================
app.get("/api/account", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const { rows } = await pool.query('SELECT plan, translations_used FROM app_users WHERE email = $1', [email]);
    
    if (rows.length === 0) {
      return res.status(200).json({ 
        subscription: { plan: "Free", status: "inactive", translationsUsed: 0 } 
      });
    }

    const user = rows[0];
    res.status(200).json({ 
      subscription: { 
        plan: user.plan, 
        status: user.plan !== "Free" ? "active" : "inactive",
        translationsUsed: user.translations_used || 0
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// ==========================================
// 4. FETCH USER DOCUMENTS
// ==========================================
app.get("/api/documents", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const { rows } = await pool.query(
      'SELECT * FROM app_documents WHERE email = $1 ORDER BY id DESC', 
      [email]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// ==========================================
// 5. START SERVER
// ==========================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});