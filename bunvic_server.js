import express from "express";
import cors from "cors";
import mysql from "mysql2";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const app = express();

const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
  ADMIN_USER,
  ADMIN_PASS,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  PORT = 5000,
} = process.env;

app.use(cors());
app.use(express.json());

// ===== MySQL Pool =====
const db = mysql.createPool({
  host: DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database:", DB_NAME);
    connection.release();
  }
});

// ===== Static Files — serve frontend =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "bunvic-travel-car-hire")));

// ===== JWT Helpers =====
function signToken(payload) {
  if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN || "2h" });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

// ===== Queue (FIFO) =====
class Queue {
  constructor() { this.items = []; }
  enqueue(job) { this.items.push(job); }
  dequeue() { return this.items.shift(); }
  isEmpty() { return this.items.length === 0; }
  size() { return this.items.length; }
}
const adminQueue = new Queue();
let isProcessingAdminQueue = false;

async function processAdminQueue() {
  if (isProcessingAdminQueue) return;
  isProcessingAdminQueue = true;
  while (!adminQueue.isEmpty()) {
    const job = adminQueue.dequeue();
    try { await job(); } catch (err) { console.error("Queue job failed:", err?.message || err); }
  }
  isProcessingAdminQueue = false;
}

// ===== Stack (LIFO) for undo =====
class Stack {
  constructor(limit = 50) { this.items = []; this.limit = limit; }
  push(x) { this.items.push(x); if (this.items.length > this.limit) this.items.shift(); }
  pop() { return this.items.pop(); }
  isEmpty() { return this.items.length === 0; }
}
const undoStack = new Stack(100);

// ===== ADMIN LOGIN =====
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = signToken({ role: "admin", username });
    return res.status(200).json({ success: true, message: "Login successful", token, redirect: "/admin-dashboard.html" });
  }
  return res.status(401).json({ success: false, message: "Invalid username or password" });
});

// ===== PUBLIC: CREATE BOOKING =====
app.post("/api/bookings", (req, res) => {
  const { fullName, email, phone, country, adults, children, tourPackage, accommodation, vehicleType, pickup, dropoff, arrivalDate, arrivalTime, serviceType, specialRequests } = req.body;

  if (!fullName) return res.status(400).json({ success: false, message: "Full name is required" });

  const sql = `INSERT INTO bookings (fullName, email, phone, country, adults, children, tourPackage, accommodation, vehicleType, pickup, dropoff, arrivalDate, arrivalTime, serviceType, specialRequests, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [fullName, email||null, phone||null, country||null, adults||0, children||0, tourPackage||null, accommodation||null, vehicleType||null, pickup||"N/A", dropoff||"N/A", arrivalDate||null, arrivalTime||null, serviceType||"tour", specialRequests||null, "Pending"];

  db.query(sql, values, (err) => {
    if (err) {
      console.error("Error inserting booking:", err);
      return res.status(500).json({ success: false, message: "Database insert error", error: err.message });
    }
    res.status(200).json({ success: true, message: "Booking saved successfully!" });
  });
});

// ===== PROTECT ALL OTHER /api ROUTES =====
app.use("/api", authMiddleware);

// ===== GET BOOKINGS =====
app.get("/api/bookings", (req, res) => {
  const { status, q, sortBy = "id", order = "desc", page = "1", limit = "20" } = req.query;
  db.query("SELECT * FROM bookings ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database fetch error" });

    let data = Array.isArray(results) ? results : [];
    if (status && ["Pending","Confirmed","Cancelled"].includes(status)) data = data.filter(b => b.status === status);
    if (q) {
      const query = String(q).toLowerCase();
      data = data.filter(b => String(b.fullName||"").toLowerCase().includes(query) || String(b.email||"").toLowerCase().includes(query) || String(b.phone||"").toLowerCase().includes(query));
    }

    const allowedSort = new Set(["id","arrivalDate","status","fullName"]);
    const safeSortBy = allowedSort.has(sortBy) ? sortBy : "id";
    const dir = String(order).toLowerCase() === "asc" ? 1 : -1;
    data.sort((a, b) => {
      const A = a[safeSortBy], B = b[safeSortBy];
      if (safeSortBy === "arrivalDate") return ((A ? new Date(A).getTime() : 0) - (B ? new Date(B).getTime() : 0)) * dir;
      if (A == null && B == null) return 0;
      if (A == null) return 1 * dir;
      if (B == null) return -1 * dir;
      if (typeof A === "number" && typeof B === "number") return (A - B) * dir;
      return String(A).localeCompare(String(B)) * dir;
    });

    const p = Math.max(parseInt(page,10)||1,1);
    const l = Math.min(Math.max(parseInt(limit,10)||20,1),200);
    const paged = data.slice((p-1)*l, p*l);
    return res.status(200).json({ success: true, page: p, limit: l, total: data.length, data: paged });
  });
});

// ===== PATCH STATUS =====
app.patch("/api/bookings/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["Pending","Confirmed","Cancelled"].includes(status)) return res.status(400).json({ success: false, message: "Invalid status value." });

  adminQueue.enqueue(() => new Promise((resolve, reject) => {
    db.query("SELECT * FROM bookings WHERE id = ?", [id], (err, rows) => {
      if (err) return reject(err);
      if (!rows || rows.length === 0) return reject(new Error("Booking not found"));
      const before = rows[0];
      db.query("UPDATE bookings SET status = ? WHERE id = ?", [status, id], (err2, result) => {
        if (err2) return reject(err2);
        if (result.affectedRows === 0) return reject(new Error("Booking not found"));
        undoStack.push({ type: "STATUS_CHANGE", bookingId: id, previousStatus: before.status, newStatus: status, timestamp: Date.now() });
        resolve();
      });
    });
  }));
  processAdminQueue();
  return res.status(202).json({ success: true, message: "Status update queued.", queueSize: adminQueue.size() });
});

// ===== DELETE BOOKING =====
app.delete("/api/bookings/:id", (req, res) => {
  const { id } = req.params;
  adminQueue.enqueue(() => new Promise((resolve, reject) => {
    db.query("SELECT * FROM bookings WHERE id = ?", [id], (err, rows) => {
      if (err) return reject(err);
      if (!rows || rows.length === 0) return reject(new Error("Booking not found"));
      const deletedRow = rows[0];
      db.query("DELETE FROM bookings WHERE id = ?", [id], (err2, result) => {
        if (err2) return reject(err2);
        if (result.affectedRows === 0) return reject(new Error("Booking not found"));
        undoStack.push({ type: "DELETE", bookingId: id, deletedRow, timestamp: Date.now() });
        resolve();
      });
    });
  }));
  processAdminQueue();
  return res.status(202).json({ success: true, message: "Delete queued.", queueSize: adminQueue.size() });
});

// ===== UNDO =====
app.post("/api/admin/undo", (req, res) => {
  if (undoStack.isEmpty()) return res.status(400).json({ success: false, message: "Nothing to undo." });
  const action = undoStack.pop();

  if (action.type === "STATUS_CHANGE") {
    adminQueue.enqueue(() => new Promise((resolve, reject) => {
      db.query("UPDATE bookings SET status = ? WHERE id = ?", [action.previousStatus, action.bookingId], (err, result) => {
        if (err) return reject(err);
        if (result.affectedRows === 0) return reject(new Error("Booking not found"));
        resolve();
      });
    }));
    processAdminQueue();
    return res.json({ success: true, message: "Undo queued: status restored." });
  }

  if (action.type === "DELETE") {
    const row = action.deletedRow;
    const sql = `INSERT INTO bookings (fullName, email, phone, country, adults, children, tourPackage, accommodation, vehicleType, pickup, dropoff, arrivalDate, arrivalTime, serviceType, specialRequests, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [row.fullName, row.email, row.phone, row.country, row.adults, row.children, row.tourPackage, row.accommodation, row.vehicleType, row.pickup, row.dropoff, row.arrivalDate, row.arrivalTime, row.serviceType, row.specialRequests, row.status];
    adminQueue.enqueue(() => new Promise((resolve, reject) => {
      db.query(sql, values, (err) => { if (err) return reject(err); resolve(); });
    }));
    processAdminQueue();
    return res.json({ success: true, message: "Undo queued: deleted booking restored." });
  }

  return res.status(400).json({ success: false, message: "Unknown undo action." });
});

// ===== SUMMARY =====
app.get("/api/bookings/summary", (req, res) => {
  db.query(`SELECT COUNT(*) AS total, SUM(CASE WHEN status='Confirmed' THEN 1 ELSE 0 END) AS confirmed, SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status='Cancelled' THEN 1 ELSE 0 END) AS cancelled FROM bookings`, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.status(200).json(results[0]);
  });
});

// ===== MONTHLY =====
app.get("/api/bookings/monthly", (req, res) => {
  db.query(`SELECT DATE_FORMAT(arrivalDate, '%b %Y') AS month, COUNT(*) AS total FROM bookings WHERE arrivalDate IS NOT NULL GROUP BY month ORDER BY MIN(arrivalDate)`, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.status(200).json(results);
  });
});

// ===== FALLBACK =====
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "bunvic-travel-car-hire", "index.html"));
});

// ===== START =====
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

process.on("SIGINT", () => { db.end(); process.exit(); });
