// =======================
// dbService.js (FULL VERSION)
// =======================

const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config();

let instance = null;

console.log("HOST:", process.env.HOST);
console.log("DB USER:", process.env.DB_USER);
console.log("PASSWORD:", process.env.PASSWORD);
console.log("DATABASE:", process.env.DATABASE);
console.log("DB PORT:", process.env.DB_PORT);

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DB_PORT
});

connection.connect((err) => {
  if (err) {
    console.log(err.message);
  }
  console.log("DB STATUS:", connection.state);
});

class DbService {
  static getDbServiceInstance() {
    return instance ? instance : new DbService();
  }

  // ============================
  // LOGIN
  // ============================
  async loginUser(username, password) {
    try {
      const user = await new Promise((resolve, reject) => {
        const query = `
          SELECT user_id, username, role, client_id
          FROM UserAccount
          WHERE username = ? AND password = ?
        `;
        connection.query(query, [username, password], (err, rows) => {
          if (err) reject(err);
          else resolve(rows[0]);
        });
      });

      if (!user) return { success: false };

      return {
        success: true,
        role: user.role,
        client_id: user.client_id
      };
    } catch (err) {
      console.log(err);
      return { success: false };
    }
  }

  // ============================
  // CLIENT REGISTRATION
  // ============================
  async registerClient(first, last, address, phone, email, cc_last4, cc_token, password) {
    try {
      const clientId = await new Promise((resolve, reject) => {
        const q = `
          INSERT INTO Client (first_name, last_name, address, phone, email, cc_last4, cc_token)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [first, last, address, phone, email, cc_last4, cc_token];
        connection.query(q, params, (err, res) => {
          if (err) reject(err);
          else resolve(res.insertId);
        });
      });

      await new Promise((resolve, reject) => {
        const q = `
          INSERT INTO UserAccount (username, password, role, client_id)
          VALUES (?, ?, 'CLIENT', ?)
        `;
        connection.query(q, [email, password, clientId], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      return { success: true, client_id: clientId };
    } catch (err) {
      console.log(err);
      return { success: false };
    }
  }

  // ============================
  // CREATE REQUEST
  // ============================
  async createServiceRequest(client_id, address, type, rooms, datetime, budget, notes) {
    try {
      const requestId = await new Promise((resolve, reject) => {
        const q = `
          INSERT INTO ServiceRequest
          (client_id, service_address, cleaning_type, num_rooms, preferred_datetime, proposed_budget, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        connection.query(q, [client_id, address, type, rooms, datetime, budget, notes], (err, res) => {
          if (err) reject(err);
          else resolve(res.insertId);
        });
      });

      return { success: true, request_id: requestId };
    } catch (err) {
      console.log(err);
      return { success: false };
    }
  }

  // ============================
  // ADD PHOTO
  // ============================
  async addPhoto(request_id, url) {
    try {
      const id = await new Promise((resolve, reject) => {
        const q = `
          INSERT INTO RequestPhoto (request_id, photo_url)
          VALUES (?, ?)
        `;
        connection.query(q, [request_id, url], (err, res) => {
          if (err) reject(err);
          else resolve(res.insertId);
        });
      });

      return { success: true, photo_id: id };
    } catch (err) {
      console.log(err);
      return { success: false };
    }
  }

  // ============================
  // CREATE QUOTE (Anna)
  // ============================
  async createQuote(request_id, price, tstart, tend, note) {
    try {
      const quoteId = await new Promise((resolve, reject) => {
        const q = `
          INSERT INTO Quote (request_id, price, time_window_start, time_window_end, note, status)
          VALUES (?, ?, ?, ?, ?, 'PENDING')
        `;
        connection.query(q, [request_id, price, tstart, tend, note], (err, res) => {
          if (err) reject(err);
          else resolve(res.insertId);
        });
      });

      return { success: true, quote_id: quoteId };
    } catch (err) {
      console.log(err);
      return { success: false };
    }
  }

  // ============================
  // ACCEPT QUOTE → CREATE ORDER
  // ============================
  async acceptQuote(quote_id) {
    try {
      const request_id = await new Promise((resolve, reject) => {
        const q = `SELECT request_id FROM Quote WHERE quote_id = ?`;
        connection.query(q, [quote_id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows[0]?.request_id);
        });
      });

      if (!request_id) return { success: false };

      const orderId = await new Promise((resolve, reject) => {
        const q = `
          INSERT INTO ServiceOrder (request_id, status)
          VALUES (?, 'ACCEPTED')
        `;
        connection.query(q, [request_id], (err, res) => {
          if (err) reject(err);
          else resolve(res.insertId);
        });
      });

      await new Promise((resolve, reject) => {
        const q = `UPDATE Quote SET status = 'ACCEPTED' WHERE quote_id = ?`;
        connection.query(q, [quote_id], (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });

      return { success: true, order_id: orderId };
    } catch (err) {
      console.log(err);
      return { success: false };
    }
  }

  // ============================
  // COMPLETE ORDER (Anna)
  // ============================
  async completeOrder(order_id) {
    try {
      await new Promise((resolve, reject) => {
        const q = `
          UPDATE ServiceOrder
          SET status = 'COMPLETED', completed_at = NOW()
          WHERE order_id = ?
        `;
        connection.query(q, [order_id], (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });

      return { success: true };
    } catch (err) {
      console.log(err);
      return { success: false };
    }
  }

  // ============================
  // CREATE BILL
  // ============================
  async createBill(order_id, amount) {
    try {
      const billId = await new Promise((resolve, reject) => {
        const q = `
          INSERT INTO Bill (order_id, amount, created_at, status)
          VALUES (?, ?, NOW(), 'UNPAID')
        `;
        connection.query(q, [order_id, amount], (err, res) => {
          if (err) reject(err);
          else resolve(res.insertId);
        });
      });

      return { success: true, bill_id: billId };
    } catch (err) {
      console.log(err);
      return { success: false };
    }
  }

  // ============================
  // PAY BILL (Client)
  // ============================
  async payBill(bill_id, client_id, amount) {
    try {
      await new Promise((resolve, reject) => {
        const q = `
          UPDATE Bill 
          SET status = 'PAID', paid_at = NOW()
          WHERE bill_id = ? AND amount = ?
        `;
        connection.query(q, [bill_id, amount], (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });

      return { success: true };
    } catch (err) {
      console.log(err);
      return { success: false };
    }
  }

  // ============================
  // DISPUTE BILL
  // ============================
  async disputeBill(bill_id, note) {
    try {
      await new Promise((resolve, reject) => {
        const q = `
          UPDATE Bill SET status = 'DISPUTED', dispute_note = ?
          WHERE bill_id = ?
        `;
        connection.query(q, [note, bill_id], (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });

      return { success: true };
    } catch (err) {
      console.log(err);
      return { success: false };
    }
  }

  // ===============================================
  // DASHBOARD QUERIES (Anna only)
  // ===============================================

  async frequentClients() {
    return await this.runQuery(`
      SELECT c.client_id, c.first_name, c.last_name, COUNT(o.order_id) AS completed_orders
      FROM Client c
      JOIN ServiceRequest r ON c.client_id = r.client_id
      JOIN ServiceOrder o ON o.request_id = r.request_id
      WHERE o.status = 'COMPLETED'
      GROUP BY c.client_id
      ORDER BY completed_orders DESC;
    `);
  }

  async uncommittedClients() {
    return await this.runQuery(`
      SELECT c.client_id, c.first_name, c.last_name
      FROM Client c
      JOIN ServiceRequest r ON c.client_id = r.client_id
      LEFT JOIN ServiceOrder o ON o.request_id = r.request_id
      GROUP BY c.client_id
      HAVING COUNT(r.request_id) >= 3 AND SUM(o.order_id IS NOT NULL) = 0;
    `);
  }

  async acceptedQuotes(year, month) {
    return await this.runQueryParams(`
      SELECT * FROM Quote
      WHERE status = 'ACCEPTED'
      AND YEAR(updated_at) = ?
      AND MONTH(updated_at) = ?
    `, [year, month]);
  }

  async prospectiveClients() {
    return await this.runQuery(`
      SELECT c.client_id, c.first_name, c.last_name
      FROM Client c
      LEFT JOIN ServiceRequest r ON c.client_id = r.client_id
      WHERE r.request_id IS NULL;
    `);
  }

  async largestJob() {
    return await this.runQuery(`
      SELECT r.request_id, r.num_rooms
      FROM ServiceRequest r
      JOIN ServiceOrder o ON r.request_id = o.request_id
      WHERE o.status = 'COMPLETED'
      ORDER BY r.num_rooms DESC
      LIMIT 1;
    `);
  }

  async overdueBills() {
    return await this.runQuery(`
      SELECT * FROM Bill
      WHERE status = 'UNPAID'
      AND created_at < NOW() - INTERVAL 7 DAY;
    `);
  }

  async badClients() {
    return await this.runQuery(`
      SELECT DISTINCT c.client_id, c.first_name, c.last_name
      FROM Client c
      JOIN ServiceRequest r ON c.client_id = r.client_id
      JOIN ServiceOrder o ON r.request_id = o.request_id
      JOIN Bill b ON b.order_id = o.order_id
      WHERE b.status = 'UNPAID'
      AND b.created_at < NOW() - INTERVAL 7 DAY;
    `);
  }

  async goodClients() {
    return await this.runQuery(`
      SELECT DISTINCT c.client_id, c.first_name, c.last_name
      FROM Client c
      JOIN ServiceRequest r ON c.client_id = r.client_id
      JOIN ServiceOrder o ON r.request_id = o.request_id
      JOIN Bill b ON o.order_id = b.order_id
      WHERE TIMESTAMPDIFF(HOUR, b.created_at, b.paid_at) <= 24;
    `);
  }

  // ============================
  // HELPER QUERIES
  // ============================
  async runQuery(query) {
    try {
      return await new Promise((resolve, reject) => {
        connection.query(query, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async runQueryParams(query, params) {
    try {
      return await new Promise((resolve, reject) => {
        connection.query(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}

module.exports = DbService;
