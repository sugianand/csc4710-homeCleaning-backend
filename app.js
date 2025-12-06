// ===================== IMPORTS =====================
const express = require("express");
const cors = require("cors");
const DbService = require("./dbService");
require("dotenv").config();

// ===================== APP INIT =====================
const app = express();

// ---- FIXED CORS (WORKS FOR NETLIFY + RAILWAY) ----
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  })
);

app.options("*", cors()); // Preflight support

app.use(express.json());

// ===================== AUTH =====================
app.post("/auth/login", async (req, res) => {
  try {
    const db = DbService.getDbServiceInstance();
    const result = await db.login(req.body.username, req.body.password);
    res.json(result);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ===================== REGISTER CLIENT =====================
app.post("/clients/register", async (req, res) => {
  try {
    const db = DbService.getDbServiceInstance();
    const result = await db.registerClient(req.body);
    res.json(result);
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ===================== CREATE SERVICE REQUEST =====================
app.post("/requests/new", async (req, res) => {
  try {
    const db = DbService.getDbServiceInstance();
    const result = await db.createRequest(req.body);
    res.json(result);
  } catch (err) {
    console.error("Request error:", err);
    res.status(500).json({ error: "Request creation failed" });
  }
});

// ===================== QUOTES =====================
app.post("/quotes/create", async (req, res) => {
  try {
    const db = DbService.getDbServiceInstance();
    const result = await db.createQuote(req.body);
    res.json(result);
  } catch (err) {
    console.error("Quote error:", err);
    res.status(500).json({ error: "Quote creation failed" });
  }
});

app.post("/quotes/accept", async (req, res) => {
  try {
    const db = DbService.getDbServiceInstance();
    const result = await db.acceptQuote(req.body.quote_id);
    res.json(result);
  } catch (err) {
    console.error("Accept quote error:", err);
    res.status(500).json({ error: "Accept quote failed" });
  }
});

// ===================== ORDERS =====================
app.post("/orders/complete", async (req, res) => {
  try {
    const db = DbService.getDbServiceInstance();
    const result = await db.completeOrder(req.body.order_id);
    res.json(result);
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ error: "Order completion failed" });
  }
});

// ===================== BILLS =====================
app.post("/bills/create", async (req, res) => {
  try {
    const db = DbService.getDbServiceInstance();
    const result = await db.createBill(req.body);
    res.json(result);
  } catch (err) {
    console.error("Bill error:", err);
    res.status(500).json({ error: "Bill creation failed" });
  }
});

app.post("/bills/pay", async (req, res) => {
  try {
    const db = DbService.getDbServiceInstance();
    const result = await db.payBill(req.body);
    res.json(result);
  } catch (err) {
    console.error("Pay bill error:", err);
    res.status(500).json({ error: "Bill payment failed" });
  }
});

app.post("/bills/dispute", async (req, res) => {
  try {
    const db = DbService.getDbServiceInstance();
    const result = await db.disputeBill(req.body);
    res.json(result);
  } catch (err) {
    console.error("Dispute bill error:", err);
    res.status(500).json({ error: "Bill dispute failed" });
  }
});

// ===================== DASHBOARD =====================
app.get("/dashboard/frequent-clients", async (_, res) => {
  try {
    const db = DbService.getDbServiceInstance();
    res.json(await db.frequentClients());
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Query failed" });
  }
});

app.get("/dashboard/uncommitted-clients", async (_, res) => {
  try {
    const db = DbService.getDbServiceInstance();
    res.json(await db.uncommittedClients());
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Query failed" });
  }
});

app.get("/dashboard/prospective-clients", async (_, res) => {
  try {
    const db = DbService.getDbServiceInstance();
    res.json(await db.prospectiveClients());
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Query failed" });
  }
});

app.get("/dashboard/largest-job", async (_, res) => {
  try {
    const db = DbService.getDbServiceInstance();
    res.json(await db.largestJob());
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Query failed" });
  }
});

app.get("/dashboard/overdue-bills", async (_, res) => {
  try {
    const db = DbService.getDbServiceInstance();
    res.json(await db.overdueBills());
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Query failed" });
  }
});

app.get("/dashboard/bad-clients", async (_, res) => {
  try {
    const db = DbService.getDbServiceInstance();
    res.json(await db.badClients());
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Query failed" });
  }
});

app.get("/dashboard/good-clients", async (_, res) => {
  try {
    const db = DbService.getDbServiceInstance();
    res.json(await db.goodClients());
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Query failed" });
  }
});

// ===================== SERVER LISTEN =====================
const PORT = process.env.PORT || 5052;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
