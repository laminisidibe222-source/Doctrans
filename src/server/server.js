const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const deepl = require("deepl-node");
const { Pool } = require("pg");
require("dotenv").config();
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_change_me_in_render";

// ==========================================
// 1. MIDDLEWARE & CONFIGURATION
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`),
});

// Max allowed by multer is 50MB (Team Plan)
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const translator = new deepl.Translator(process.env.DEEPL_API_KEY, { minTimeout: 60000 });

// ==========================================
// PLAN RESTRICTIONS
// ==========================================
const PLAN_LIMITS = {
  "Free": 2,
  "Pro": 50,
  "Équipe": 999999 // Effectively unlimited
};

const MAX_FILE_SIZE = {
  "Free": 2 * 1024 * 1024, // 2 MB
  "Pro": 20 * 1024 * 1024, // 20 MB
  "Équipe": 50 * 1024 * 1024 // 50 MB
};

// ==========================================
// 2. AUTHENTICATION ROUTES
// ==========================================

app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO app_users (email, password_hash, plan, translations_used) VALUES ($1, $2, $3, $4)',
      [email, hashedPassword, 'Free', 0]
    );
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, email });
  } catch (err) {
    console.error("🚨 SIGNUP ERROR:", err); // <-- ADDED THIS
    if (err.code === '23505') res.status(400).json({ error: "An account with this email already exists." });
    else res.status(500).json({ error: "Server error during signup." });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });

  try {
    const { rows } = await pool.query('SELECT * FROM app_users WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(401).json({ error: "Invalid email or password." });
    
    // Safety check: If the user was created before we added passwords
    if (!rows[0].password_hash) {
      return res.status(400).json({ error: "This account was created before secure passwords were added. Please sign up again with a new email." });
    }

    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password." });

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, email });
  } catch (err) {
    console.error("🚨 LOGIN ERROR:", err); // <-- ADDED THIS
    res.status(500).json({ error: "Server error during login." });
  }
});
// ==========================================
// 3. TRANSLATION ROUTE
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
    const userLimit = PLAN_LIMITS[user.plan] || PLAN_LIMITS["Free"];
    const userMaxSize = MAX_FILE_SIZE[user.plan] || MAX_FILE_SIZE["Free"];

    // Check Translation Limit
    if (currentUsage >= userLimit) {
      try { fs.unlinkSync(file.path); } catch (e) {}
      return res.status(403).json({ error: "LIMIT_REACHED" });
    }

    // Check File Size Limit
    if (file.size > userMaxSize) {
      try { fs.unlinkSync(file.path); } catch (e) {}
      return res.status(403).json({ 
        error: `FILE_TOO_LARGE`,
        message: `Your current plan allows files up to ${userMaxSize / (1024 * 1024)}MB. Please upgrade.`
      });
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

    await translator.translateDocument(file.path, outputPath, getLangCode(sourceLang), getLangCode(targetLang));
    try { fs.unlinkSync(file.path); } catch (e) {}

    // Increment Usage & Save Document
    await client.query('BEGIN');
    const newUsageCount = currentUsage + 1;
    await client.query('UPDATE app_users SET translations_used = $1 WHERE email = $2', [newUsageCount, email]);

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${translatedFilename}`;
    const docRes = await client.query(
      'INSERT INTO app_documents (email, name, lang, date, status, url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [email, file.originalname, targetLang, new Date().toLocaleDateString(), 'Done', fileUrl]
    );
    await client.query('COMMIT');

    res.status(200).json({ 
      success: true, 
      document: docRes.rows[0], 
      translationsUsed: newUsageCount,
      maxTranslations: userLimit
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
// 4. FETCH ACCOUNT & DOCUMENTS
// ==========================================
app.get("/api/account", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const { rows } = await pool.query('SELECT plan, translations_used FROM app_users WHERE email = $1', [email]);
    
    if (rows.length === 0) {
      return res.status(200).json({ subscription: { plan: "Free", status: "inactive", translationsUsed: 0, maxTranslations: PLAN_LIMITS["Free"] } });
    }

    const user = rows[0];
    const userLimit = PLAN_LIMITS[user.plan] || PLAN_LIMITS["Free"];

    res.status(200).json({ 
      subscription: { 
        plan: user.plan, 
        status: user.plan !== "Free" ? "active" : "inactive",
        translationsUsed: user.translations_used || 0,
        maxTranslations: userLimit
      } 
    });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/documents", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const { rows } = await pool.query('SELECT * FROM app_documents WHERE email = $1 ORDER BY id DESC', [email]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// ==========================================
// 5. SASPAY INTEGRATION & CRON
// ==========================================
app.post('/api/saspay/create-checkout', async (req, res) => {
  try {
    const { plan, price, email } = req.body;
    if (!plan || !price || !email) return res.status(400).json({ error: "Plan, price, and email are required." });

    const apiKey = process.env.SASPAY_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Server configuration error." });

    const baseUrl = 'https://api.saspay.me/api/v1';
    const endpoint = `${baseUrl}/checkout-sessions/`;

    let customerName = "Valued Customer";
    if (email && email.includes('@')) {
        const rawName = email.split('@')[0].replace(/[._]/g, ' ').trim();
        if (rawName) customerName = rawName.replace(/\b\w/g, l => l.toUpperCase());
    }

    const payload = {
      amount: Number(price).toFixed(2), 
      currency: "XOF", 
      description: `DocTrans ${plan} Subscription`,
      customer_email: email,
      customer_name: customerName,
      return_url: `https://doc-trans-frontend.vercel.app/?checkout=success`,
      metadata: { plan: plan, email: email }
    };

    const response = await axios.post(endpoint, payload, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
    });

    const checkoutUrl = response.data?.data?.checkout_url || response.data?.checkout_url;
    if (checkoutUrl) res.json({ payment_url: checkoutUrl });
    else res.status(400).json({ error: 'Failed to create checkout session.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during checkout.' });
  }
});

app.post('/api/saspay/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;
    if (event === 'payment.successful' || data?.status === 'SUCCESSFUL') {
      const { email, plan } = data.metadata || {};
      if (email && plan) {
        await pool.query('UPDATE app_users SET plan = $1 WHERE email = $2', [plan, email]);
      }
    }
    res.status(200).send('OK');
  } catch (error) {
    res.status(200).send('OK');
  }
});

app.post('/api/cron/reset-limits', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: 'Unauthorized' });

  try {
    await pool.query('UPDATE app_users SET translations_used = 0');
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🚨 GLOBAL ERROR:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    body: req.body,
  });
  res.status(500).json({ error: "Internal Server Error" });
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));