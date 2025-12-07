// ====================== IMPORTS ======================
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const multer = require("multer");
const dotenv = require("dotenv");
const importSQL = require("./importSQL");

dotenv.config();

// ====================== APP INIT ======================
const app = express();
app.use(cors());
app.use(express.json());

// ====================== DB CONNECTION ======================
const db = mysql.createConnection({
  host: process.env.HOST,                 // mysql.railway.internal
  user: process.env.DB_USER,              // root
  password: process.env.PASSWORD,         // your Railway MySQL password
  database: process.env.DATABASE,         // railway
  port: process.env.DB_PORT               // 3306
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("DATABASE CONNECTION FAILED:", err);
  } else {
    console.log("Connected to Railway MySQL!");
  }
});

// ====================== MULTER SETUP ======================
const upload = multer({ storage: multer.memoryStorage() });

// ====================== ROUTES ======================

// ----------- TEMPORARY: IMPORT SQL INTO RAILWAY -----------
app.get("/import-db", async (req, res) => {
  const result = await importSQL();
  res.json(result);
});
// ⚠️ Delete this route after SQL is imported once.

// ====================== AUTH ======================
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM client WHERE email = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) return res.json({ success: false, error: err.message });

      if (results.length === 0) {
        return res.json({ success: false });
      }

      const user = results[0];
      return res.json({
        success: true,
        role: user.role,
        client_id: user.client_id
      });
    }
  );
});

// ====================== REGISTER CLIENT ======================
app.post("/clients/register", (req, res) => {
  const { first_name, last_name, address, phone, email, password, cc_last4 } = req.body;

  const sql = `
    INSERT INTO client (first_name, last_name, address, phone, email, password, cc_last4)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [first_name, last_name, address, phone, email, password, cc_last4 || null],
    (err, result) => {
      if (err) return res.json({ success: false, error: err.message });
      res.json({ success: true, client_id: result.insertId });
    }
  );
});

// ====================== CREATE SERVICE REQUEST ======================
app.post("/requests/new", upload.array("photos", 5), (req, res) => {
  const { client_id, service_address, cleaning_type, rooms, preferred_date, budget, notes } = req.body;

  const sql = `
    INSERT INTO service_request 
      (client_id, service_address, cleaning_type, rooms, preferred_date, budget, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [client_id, service_address, cleaning_type, rooms, preferred_date, budget, notes],
    (err, result) => {
      if (err) return res.json({ success: false, error: err.message });
      res.json({ success: true, request_id: result.insertId });
    }
  );
});

// ====================== CREATE QUOTE ======================
app.post("/quotes/create", (req, res) => {
  const { request_id, contractor_id, amount, valid_until } = req.body;

  const sql = `
    INSERT INTO quote (request_id, contractor_id, amount, valid_until)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [request_id, contractor_id, amount, valid_until], (err, result) => {
    if (err) return res.json({ success: false, error: err.message });
    res.json({ success: true, quote_id: result.insertId });
  });
});

// ====================== ACCEPT QUOTE ======================
app.post("/quotes/accept", (req, res) => {
  const { quote_id } = req.body;

  db.query(
    "UPDATE quote SET status = 'ACCEPTED' WHERE quote_id = ?",
    [quote_id],
    (err) => {
      if (err) return res.json({ success: false, error: err.message });
      res.json({ success: true });
    }
  );
});

// ====================== COMPLETE ORDER ======================
app.post("/orders/complete", (req, res) => {
  const { request_id } = req.body;

  db.query(
    "UPDATE service_request SET status = 'COMPLETED' WHERE request_id = ?",
    [request_id],
    (err) => {
      if (err) return res.json({ success: false, error: err.message });
      res.json({ success: true });
    }
  );
});

// ====================== CREATE BILL ======================
app.post("/bills/create", (req, res) => {
  const { request_id, amount_due, due_date } = req.body;

  const sql = `
    INSERT INTO bill (request_id, amount_due, due_date)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [request_id, amount_due, due_date], (err, result) => {
    if (err) return res.json({ success: false, error: err.message });
    res.json({ success: true, bill_id: result.insertId });
  });
});

// ====================== PAY BILL ======================
app.post("/bills/pay", (req, res) => {
  const { bill_id } = req.body;

  db.query(
    "UPDATE bill SET paid = 1 WHERE bill_id = ?",
    [bill_id],
    (err) => {
      if (err) return res.json({ success: false, error: err.message });
      res.json({ success: true });
    }
  );
});

// ====================== DISPUTE BILL ======================
app.post("/bills/dispute", (req, res) => {
  const { bill_id, reason } = req.body;

  db.query(
    "UPDATE bill SET dispute_reason = ? WHERE bill_id = ?",
    [reason, bill_id],
    (err) => {
      if (err) return res.json({ success: false, error: err.message });
      res.json({ success: true });
    }
  );
});

// ====================== DASHBOARD QUERIES ======================
app.get("/dashboard/frequent-clients", (req, res) => {
  db.query(
    "SELECT client_id, COUNT(*) as jobs FROM service_request GROUP BY client_id ORDER BY jobs DESC LIMIT 5",
    (err, rows) => res.json(rows)
  );
});

app.get("/dashboard/uncommitted-clients", (req, res) => {
  db.query(
    "SELECT * FROM client WHERE client_id NOT IN (SELECT client_id FROM service_request)",
    (err, rows) => res.json(rows)
  );
});

app.get("/dashboard/prospective-clients", (req, res) => {
  db.query(
    "SELECT * FROM service_request WHERE status = 'PENDING'",
    (err, rows) => res.json(rows)
  );
});

app.get("/dashboard/largest-job", (req, res) => {
  db.query(
    "SELECT * FROM service_request ORDER BY budget DESC LIMIT 1",
    (err, rows) => res.json(rows)
  );
});

app.get("/dashboard/overdue-bills", (req, res) => {
  db.query(
    "SELECT * FROM bill WHERE due_date < NOW() AND paid = 0",
    (err, rows) => res.json(rows)
  );
});

app.get("/dashboard/bad-clients", (req, res) => {
  db.query(
    "SELECT * FROM bill WHERE paid = 0 AND due_date < NOW()",
    (err, rows) => res.json(rows)
  );
});

app.get("/dashboard/good-clients", (req, res) => {
  db.query(
    "SELECT * FROM bill WHERE paid = 1",
    (err, rows) => res.json(rows)
  );
});

// ====================== SERVER LISTEN ======================
const PORT = process.env.PORT || 5052;

app.listen(PORT, () => {
  console.log("Backend running on port:", PORT);
});
