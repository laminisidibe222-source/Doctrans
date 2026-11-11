const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function reset() {
  try {
    await pool.query('UPDATE app_users SET translations_used = 0');
    console.log("✅ Monthly limits reset successfully");
  } catch (err) {
    console.error("❌ Error resetting limits:", err);
  } finally {
    pool.end();
  }
}
reset();