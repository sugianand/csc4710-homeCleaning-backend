const fs = require("fs");
const mysql = require("mysql2/promise");

async function importSQL() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.HOST,
      user: process.env.DB_USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      port: process.env.DB_PORT
    });

    console.log("Connected to Railway MySQL.");

    const sql = fs.readFileSync("cleaning_service.sql", "utf8");

    const statements = sql
      .replace(/\/\*![\s\S]*?\*\//g, "")
      .split(/;\s*[\r\n]+/);

    for (let stmt of statements) {
      stmt = stmt.trim();
      if (!stmt) continue;
      try {
        console.log("Running:", stmt.substring(0, 60), "...");
        await conn.query(stmt);
      } catch (err) {
        console.error("Error running statement:", err.message);
      }
    }

    console.log("SQL IMPORT COMPLETE.");
    return { success: true };
  } catch (err) {
    console.error("Connection error:", err);
    return { success: false, error: err.message };
  }
}

module.exports = importSQL;
