const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const deepl = require("deepl-node");
const { Pool } = require("pg");
require("dotenv").config();
const axios = require('axios');

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

const PLAN_LIMITS = {
  "Free": 2,
  "Pro": 12,
  "Équipe": 20
};

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
    const userLimit = PLAN_LIMITS[user.plan] || PLAN_LIMITS["Free"];

    // Check Limit
    if (currentUsage >= userLimit) {
      try { fs.unlinkSync(file.path); } catch (e) {}
      return res.status(403).json({ error: "LIMIT_REACHED" });
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
// 3. FETCH ACCOUNT STATUS
// ==========================================
app.get("/api/account", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const { rows } = await pool.query('SELECT plan, translations_used FROM app_users WHERE email = $1', [email]);
    
    if (rows.length === 0) {
      return res.status(200).json({ 
        subscription: { 
          plan: "Free", 
          status: "inactive", 
          translationsUsed: 0,
          maxTranslations: PLAN_LIMITS["Free"]
        } 
      });
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
// 5. CREATE SASPAY CHECKOUT SESSION
// ==========================================
app.post('/api/saspay/create-checkout', async (req, res) => {
  console.log("1. 🚀 [SasPay] Checkout route hit. Body:", req.body);

  try {
    const { plan, price, email } = req.body;
    if (!plan || !price || !email) {
      return res.status(400).json({ error: "Plan, price, and email are required." });
    }

    const apiKey = process.env.SASPAY_API_KEY;
    if (!apiKey) {
      console.log("❌ SASPAY_API_KEY is missing from environment variables!");
      return res.status(500).json({ error: "Server configuration error." });
    }

    const baseUrl = 'https://api.saspay.me/api/v1';
    const endpoint = `${baseUrl}/checkout-sessions/`;

    // Bulletproof name extraction
    let customerName = "Valued Customer";
    if (email && email.includes('@')) {
        const rawName = email.split('@')[0].replace(/[._]/g, ' ').trim();
        if (rawName) customerName = rawName.replace(/\b\w/g, l => l.toUpperCase());
    }

    const payload = {
      // FIXED: Dynamically use the price from the frontend and format it as a decimal string
      amount: Number(price).toFixed(2), 
      currency: "XOF", 
      description: `DocTrans ${plan} Subscription`,
      customer_email: email,
      customer_name: customerName,
      return_url: `https://doc-trans-frontend.vercel.app/?checkout=success`,
      metadata: {
        plan: plan,
        email: email
      }
    };

    console.log("2. 📦 [SasPay] Sending payload to SasPay:", JSON.stringify(payload, null, 2));

    const response = await axios.post(endpoint, payload, {
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("3. ✅ [SasPay] Response from SasPay:", response.data);

    // Handle the standard envelope { success: true, data: {...} } OR direct response
    const checkoutUrl = response.data?.data?.checkout_url || response.data?.checkout_url;

    if (checkoutUrl) {
      res.json({ payment_url: checkoutUrl });
    } else {
      console.log("❌ [SasPay] No checkout_url in response");
      res.status(400).json({ error: 'Failed to create SasPay checkout session.' });
    }
  } catch (error) {
    console.error("🔥 [SasPay] CRITICAL ERROR:", {
      message: error.message,
      response: error.response?.data,
      fieldErrors: error.response?.data?.error, 
    });
    res.status(500).json({ error: 'Internal server error during checkout.' });
  }
});

// ==========================================
// 6. SASPAY WEBHOOK HANDLER
// ==========================================
app.post('/api/saspay/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;

    // Check for a successful payment event
    if (event === 'payment.successful' || data?.status === 'SUCCESSFUL') {
      const { metadata } = data;
      const { email, plan } = metadata || {};

      if (email && plan) {
        const apiKey = process.env.SASPAY_API_KEY;
        const paymentId = data.id; 
        const verifyUrl = `https://api.saspay.me/api/v1/payments/${paymentId}/verify/`;

        // Verify with SasPay API before upgrading
        const verifyResponse = await axios.get(verifyUrl, {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (verifyResponse.data.status === 'SUCCESSFUL') {
          await pool.query(
            'UPDATE app_users SET plan = $1 WHERE email = $2',
            [plan, email]
          );
          console.log(`✅ Payment confirmed for ${email} - Plan: ${plan}`);
        }
      }
    }

    // SasPay expects a 200 OK to acknowledge receipt
    res.status(200).send('OK');
  } catch (error) {
    console.error('SasPay Webhook Error:', error);
    res.status(200).send('OK'); // Acknowledge even on error to stop retries
  }
});

// ==========================================
// 7. START SERVER
// ==========================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});