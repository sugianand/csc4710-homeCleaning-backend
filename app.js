// =======================
// app.js (FULL VERSION)
// =======================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const DbService = require("./dbService");
const app = express();

app.use(cors());
app.use(express.json());

const db = DbService.getDbServiceInstance();

app.get("/", (req, res) => {
  res.json({ message: "Home Cleaning System Backend Running" });
});

// ===========================
// LOGIN
// ===========================
app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await db.loginUser(username, password);
  res.json(result);
});

// ===========================
// REGISTER CLIENT
// ===========================
app.post("/clients/register", async (req, res) => {
  const {
    first_name,
    last_name,
    address,
    phone,
    email,
    cc_last4,
    cc_token,
    password
  } = req.body;

  const result = await db.registerClient(
    first_name,
    last_name,
    address,
    phone,
    email,
    cc_last4,
    cc_token,
    password
  );

  res.json(result);
});

// ===========================
// CREATE REQUEST
// ===========================
app.post("/requests/new", async (req, res) => {
  const {
    client_id,
    service_address,
    cleaning_type,
    num_rooms,
    preferred_datetime,
    proposed_budget,
    notes
  } = req.body;

  const result = await db.createServiceRequest(
    client_id,
    service_address,
    cleaning_type,
    num_rooms,
    preferred_datetime || null,
    proposed_budget || null,
    notes || null
  );

  res.json(result);
});

// ===========================
// ADD PHOTO
// ===========================
app.post("/requests/add-photo", async (req, res) => {
  const { request_id, photo_url } = req.body;
  const result = await db.addPhoto(request_id, photo_url);
  res.json(result);
});

// ===========================
// CREATE QUOTE
// ===========================
app.post("/quotes/create", async (req, res) => {
  const {
    request_id,
    price,
    time_window_start,
    time_window_end,
    note
  } = req.body;

  const result = await db.createQuote(
    request_id,
    price,
    time_window_start,
    time_window_end,
    note
  );

  res.json(result);
});

// ===========================
// ACCEPT QUOTE
// ===========================
app.post("/quotes/accept", async (req, res) => {
  const { quote_id } = req.body;
  const result = await db.acceptQuote(quote_id);
  res.json(result);
});

// ===========================
// COMPLETE ORDER
// ===========================
app.post("/orders/complete", async (req, res) => {
  const { order_id } = req.body;
  const result = await db.completeOrder(order_id);
  res.json(result);
});

// ===========================
// CREATE BILL
// ===========================
app.post("/bills/create", async (req, res) => {
  const { order_id, amount } = req.body;
  const result = await db.createBill(order_id, amount);
  res.json(result);
});

// ===========================
// PAY BILL
// ===========================
app.post("/bills/pay", async (req, res) => {
  const { bill_id, client_id, amount } = req.body;
  const result = await db.payBill(bill_id, client_id, amount);
  res.json(result);
});

// ===========================
// DISPUTE BILL
// ===========================
app.post("/bills/dispute", async (req, res) => {
  const { bill_id, note } = req.body;
  const result = await db.disputeBill(bill_id, note);
  res.json(result);
});

// ===========================
// DASHBOARD
// ===========================
app.get("/dashboard/frequent-clients", async (req, res) => {
  res.json(await db.frequentClients());
});

app.get("/dashboard/uncommitted-clients", async (req, res) => {
  res.json(await db.uncommittedClients());
});

app.get("/dashboard/accepted-quotes", async (req, res) => {
  const { year, month } = req.query;
  res.json(await db.acceptedQuotes(year, month));
});

app.get("/dashboard/prospective-clients", async (req, res) => {
  res.json(await db.prospectiveClients());
});

app.get("/dashboard/largest-job", async (req, res) => {
  res.json(await db.largestJob());
});

app.get("/dashboard/overdue-bills", async (req, res) => {
  res.json(await db.overdueBills());
});

app.get("/dashboard/bad-clients", async (req, res) => {
  res.json(await db.badClients());
});

app.get("/dashboard/good-clients", async (req, res) => {
  res.json(await db.goodClients());
});

// ===========================
// START SERVER
// ===========================
app.listen(process.env.PORT, () => {
  console.log("Backend running on port:", process.env.PORT);
});
