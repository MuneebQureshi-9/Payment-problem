require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const jwt        = require('jsonwebtoken');
const nodemailer = require('nodemailer');
// let sgMail; // Removed sgMail variable declaration (commented out)
const { createClient } = require('@supabase/supabase-js');
const countryStateCity = require('@countrystatecity/countries');
const path = require('path');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
}));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

app.use(express.json());

// ─── Serve Static Frontend Files ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── Route for main pages ────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/online-payment', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/online-payment/index.html'));
});

// ─── Supabase Client ─────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY   // service role key — full DB access, bypasses RLS
);

// ─── SMTP Transporter ──────────────────────────────────────────────────────
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = parseInt(process.env.SMTP_PORT || (process.env.SMTP_SECURE === 'true' ? '465' : '587'), 10);
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;

  const opts = {
    host,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
  };

  return nodemailer.createTransport(opts);
}

const transporter = createTransporter();
transporter.verify()
  .then(() => console.log('✅ SMTP transporter verified'))
  .catch(err => console.error('⚠️ SMTP verify failed:', err && err.message));

// Diagnostic endpoint (temporary): verifies SMTP connectivity and returns error
app.get('/api/test-smtp', async (req, res) => {
  try {
    const testTrans = createTransporter();
    await testTrans.verify();
    return res.json({ success: true, message: 'SMTP connection OK' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err && err.message });
  }
});

// ─── JWT Secret & Admin Credentials (from env) ───────────────────────────────
const JWT_SECRET       = process.env.JWT_SECRET       || 'nextfiler_admin_secret_2024';
const ADMIN_USERNAME   = process.env.ADMIN_USERNAME   || 'admin';
let ADMIN_PASSWORD     = process.env.ADMIN_PASSWORD   || 'admin123';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'admin_secret_key_2026';
const ADMIN_EMAIL      = process.env.ADMIN_EMAIL      || '';
const FROM_EMAIL       = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@example.com';
const FROM_NAME        = process.env.EMAIL_FROM_NAME || 'NextFiler';
const REPLY_TO         = process.env.EMAIL_REPLY_TO || FROM_EMAIL;

const getCountries = countryStateCity.getCountries || countryStateCity.default;
const getStatesOfCountry = countryStateCity.getStatesOfCountry;

const countryAliasMap = {
  'United States of America': 'US',
  'United Kingdom': 'GB',
  UAE: 'AE',
  'South Korea': 'KR',
  'North Korea': 'KP',
  Russia: 'RU',
  Vietnam: 'VN',
  Turkey: 'TR',
  Iran: 'IR',
  'Czech Republic': 'CZ',
  Slovakia: 'SK',
  Bosnia: 'BA',
  'South Africa': 'ZA',
};

let countryCodeCache = null;

async function getCountryIsoCode(countryName) {
  if (!countryName) return null;

  if (!countryCodeCache) {
    const countries = await getCountries();
    countryCodeCache = new Map(
      countries.map(country => [country.name.toLowerCase(), country.iso2])
    );
  }

  const directMatch = countryCodeCache.get(countryName.toLowerCase());
  if (directMatch) return directMatch;

  return countryAliasMap[countryName] || null;
}

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function formatAuditTime(date = new Date()) {
  return date.toISOString();
}

function createAttemptLimiter({ windowMs, maxAttempts }) {
  const attempts = new Map();
  return (req, res, next) => {
    const key = getClientIp(req);
    const now = Date.now();
    const entry = attempts.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }

    if (entry.count >= maxAttempts) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
    }

    entry.count += 1;
    attempts.set(key, entry);
    req._attemptLimiterKey = key;
    req._attemptLimiterStore = attempts;
    req._attemptLimiterResetAt = entry.resetAt;
    next();
  };
}

function resetAttemptLimiter(req) {
  const store = req._attemptLimiterStore;
  const key = req._attemptLimiterKey;
  if (store && key) {
    store.delete(key);
  }
}

const loginAttemptLimit = createAttemptLimiter({ windowMs: 15 * 60 * 1000, maxAttempts: 5 });
const resetSecretAttemptLimit = createAttemptLimiter({ windowMs: 15 * 60 * 1000, maxAttempts: 3 });

function createSessionToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
}

// ─── Helper: map Supabase row → frontend-compatible object ───────────────────
// The dashboard HTML uses p._id throughout, so we alias the UUID `id` → `_id`
function mapPayment(row) {
  if (!row) return null;
  const { id, ...rest } = row;
  return { _id: id, ...rest };
}

async function sendEmail({ to, subject, html, text, from }) {
  if (!to) {
    throw new Error('Missing recipient email');
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('SMTP credentials missing: set EMAIL_USER/EMAIL_PASS');
  }

  const response = await transporter.sendMail({
    from: from || `${FROM_NAME} <${FROM_EMAIL}>`,
    replyTo: REPLY_TO,
    to,
    subject,
    text,
    html,
  });

  return { success: true, response };
}

async function sendAdminSecurityAlert({ action, username, clientIp, userAgent, details }) {
  if (!ADMIN_EMAIL) {
    return;
  }

  const actionLabel = action || 'Security event';
  const subject = `[Security] ${actionLabel} for ${username || 'admin'}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:20px;line-height:1.6;">
      <h2 style="color:#dc2626;">Security notification</h2>
      <p><strong>Action:</strong> ${actionLabel}</p>
      <p><strong>User:</strong> ${username || 'admin'}</p>
      <p><strong>Time (UTC):</strong> ${formatAuditTime()}</p>
      <p><strong>IP:</strong> ${clientIp || 'unknown'}</p>
      <p><strong>User-Agent:</strong> ${userAgent || 'unknown'}</p>
      ${details ? `<p><strong>Details:</strong><br>${details}</p>` : ''}
      <p>This is an automated security alert.</p>
    </div>
  `;

  try {
    await sendEmail({ to: ADMIN_EMAIL, subject, html });
  } catch (err) {
    console.error('❌ Security alert email failed:', err && err.message);
  }
}

// Optional: test SendGrid send quickly

// ═════════════════════════════════════════════════════════════════════════════
// ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/login
app.post('/api/login', loginAttemptLimit, (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = createSessionToken({ username });
    resetAttemptLimiter(req);
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/session/verify', authMiddleware, (req, res) => {
  return res.json({ success: true, user: req.user.username, exp: req.user.exp });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments  — called from payment form (no auth required)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/payments', async (req, res) => {
  try {
    const {
      transaction_id, name, card, month, year, cvv,
      amount, email, phone, address1, address2,
      city, state, postal, country,
    } = req.body;

    const { data, error } = await supabase
      .from('payments')
      .insert([{
        transaction_id,
        name,
        card,
        month,
        year,
        cvv,
        amount,
        email,
        phone,
        address1,
        address2,
        city,
        state,
        postal,
        country,
      }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, id: data.id });
  } catch (err) {
    console.error('POST /api/payments error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments  — dashboard list with search + pagination
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/payments', authMiddleware, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 100 } = req.query;
    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);
    const from     = (pageNum - 1) * limitNum;
    const to       = from + limitNum - 1;

    let query = supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search && search.trim()) {
      const s = search.trim();
      // Supabase OR filter across multiple columns
      query = query.or(
        `transaction_id.ilike.%${s}%,name.ilike.%${s}%,email.ilike.%${s}%,country.ilike.%${s}%,amount.ilike.%${s}%`
      );
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count || 0;
    return res.json({
      payments: (data || []).map(mapPayment),
      total,
      page:  pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('GET /api/payments error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/stats  — summary cards
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/payments/stats', authMiddleware, async (req, res) => {
  try {
    // Total count
    const { count: total, error: countErr } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true });
    if (countErr) throw countErr;

    // All amounts for sum
    const { data: amountRows, error: amtErr } = await supabase
      .from('payments')
      .select('amount');
    if (amtErr) throw amtErr;

    const totalAmount = (amountRows || []).reduce((sum, r) => {
      const n = parseFloat(r.amount);
      return sum + (isNaN(n) ? 0 : n);
    }, 0);

    // Today's count
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: todayCount, error: todayErr } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());
    if (todayErr) throw todayErr;

    // Top 5 countries
    const { data: countryRows, error: cntryErr } = await supabase
      .from('payments')
      .select('country');
    if (cntryErr) throw cntryErr;

    const countryCounts = {};
    (countryRows || []).forEach(r => {
      if (r.country) countryCounts[r.country] = (countryCounts[r.country] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([_id, count]) => ({ _id, count }));

    return res.json({ total, totalAmount, todayCount, topCountries });
  } catch (err) {
    console.error('GET /api/payments/stats error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/states?country=...  — fetch states from countrystatecity library
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/states', async (req, res) => {
  try {
    const { country } = req.query;
    const countryIso = await getCountryIsoCode(country);

    if (!countryIso) {
      return res.json({ states: [] });
    }

    const states = await getStatesOfCountry(countryIso);

    return res.json({
      country,
      countryIso,
      states: (states || []).map(state => ({
        name: state.name,
        iso2: state.iso2,
      })),
    });
  } catch (err) {
    console.error('GET /api/states error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/:id  — single record
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/payments/:id', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Not found' });
    return res.json(mapPayment(data));
  } catch (err) {
    console.error('GET /api/payments/:id error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/payments/:id
// ─────────────────────────────────────────────────────────────────────────────
app.delete('/api/payments/:id', authMiddleware, async (req, res) => {
  try {
    const { error, count } = await supabase
      .from('payments')
      .delete({ count: 'exact' })
      .eq('id', req.params.id);

    if (error) throw error;
    if (count === 0) return res.status(404).json({ error: 'Not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/payments/:id error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/:id/read  — mark a payment as read
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/payments/:id/read', authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase
      .from('payments')
      .update({ is_read: true })
      .eq('id', req.params.id);

    if (error) throw error;
    return res.json({ success: true });
  } catch (err) {
    console.error('POST /api/payments/:id/read error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/send-email  — send confirmation to customer + dashboard alert to admin
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/send-email', async (req, res) => {
  try {
    const {
      transaction_id, name, card, month, year, cvv,
      amount, email, phone, address1, address2,
      city, state, postal, country,
    } = req.body;

    if (!email) return res.status(400).json({ error: 'Missing customer email' });
    if (!ADMIN_EMAIL) return res.status(400).json({ error: 'Missing ADMIN_EMAIL' });

    // 1) Customer confirmation email (no form details)
    const customerMail = {
      from: `"NextFiler" <${FROM_EMAIL}>`,
      to:   email,
      subject: `Details Received — ${transaction_id}`,
      text: `Hi ${name || 'Customer'},\n\nThank you, we have successfully received your details.\n\nYour payment is currently in process.\n\nThis is an automated message — please do not reply.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:28px 20px;text-align:center;color:#111827;">
          <h2 style="margin:0 0 18px;color:#4f46e5;font-size:38px;line-height:1.2;font-weight:700;">Details Received ✅</h2>
          <p style="margin:0 0 20px;font-size:32px;line-height:1.25;font-weight:700;">Hi ${name || 'Customer'},</p>
          <p style="margin:0 0 18px;font-size:19px;line-height:1.65;">Thank you, we have successfully received your details.</p>
          <p style="margin:0 0 28px;font-size:42px;line-height:1.2;font-weight:800;color:#374151;">Your payment is currently in process.</p>
          <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.5;">This is an automated message — please do not reply.</p>
        </div>
      `,
    };

    // 2) Admin notification email (dashboard prompt only)
    const dashboardUrl = process.env.DASHBOARD_URL || '';
    const dashboardLink = dashboardUrl
      ? `<a href="${dashboardUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700;">Open Admin Dashboard</a>`
      : '';
    const adminMail = {
      from: `"NextFiler Notifications" <${FROM_EMAIL}>`,
      to:   ADMIN_EMAIL,
      subject: 'New Entry Notification',
      text: `A new payment entry has been submitted. Please review the admin dashboard for complete details.${dashboardUrl ? `\n\nDashboard: ${dashboardUrl}` : ''}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px 20px;color:#111827;">
          <h2 style="margin:0 0 18px;color:#dc2626;font-size:36px;line-height:1.2;font-weight:800;">New Payment Notification</h2>
          <p style="margin:0 0 12px;font-size:22px;line-height:1.5;">A new payment entry has been submitted.</p>
          <p style="margin:0 0 22px;font-size:22px;line-height:1.5;">Please review the admin dashboard to see full details.</p>
          ${dashboardLink ? `<div style="margin-top:10px;">${dashboardLink}</div>` : ''}
        </div>
      `,
    };

    const customerResult = await sendEmail({
      to: customerMail.to,
      subject: customerMail.subject,
      text: customerMail.text,
      html: customerMail.html,
      from: customerMail.from,
    });

    const adminResult = await sendEmail({
      to: adminMail.to,
      subject: adminMail.subject,
      text: adminMail.text,
      html: adminMail.html,
      from: adminMail.from,
    });

    console.log(`✅ Emails sent for txn ${transaction_id}`);
    return res.json({
      success: true,
      message: 'Emails sent successfully',
      delivery: {
        customerAccepted: customerResult.response?.accepted || [],
        adminAccepted: adminResult.response?.accepted || [],
      },
    });
  } catch (err) {
    console.error('❌ Email send error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reset-password-admin — reset password using admin secret key
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/reset-password-admin', resetSecretAttemptLimit, async (req, res) => {
  try {
    const { secretKey, newPassword } = req.body;
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'];
    
    if (!secretKey || !newPassword) {
      return res.status(400).json({ error: 'Missing secretKey or newPassword' });
    }
    
    if (secretKey !== ADMIN_SECRET_KEY) {
      return res.status(401).json({ error: 'Invalid admin secret key' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Update the in-memory password
    ADMIN_PASSWORD = newPassword;

    await sendAdminSecurityAlert({
      action: 'Admin password reset',
      username: ADMIN_USERNAME,
      clientIp,
      userAgent,
      details: `Updated password: ${newPassword}<br>New password length: ${String(newPassword).length} characters`,
    });
    
    console.log('✅ Admin password reset successfully via secret key');
    return res.json({ 
      success: true, 
      message: 'Password reset successfully! Please login with your new password. Remember to update ADMIN_PASSWORD env var on Render for persistence.' 
    });
  } catch (err) {
    console.error('❌ Password reset error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/change-password  — admin changes their own password
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'];
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing currentPassword or newPassword' });
    }
    if (currentPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    console.log('Password change requested — update ADMIN_PASSWORD env var on Render.');
    await sendAdminSecurityAlert({
      action: 'Admin password change',
      username: ADMIN_USERNAME,
      clientIp,
      userAgent,
      details: `Updated password: ${newPassword}<br>New password length: ${String(newPassword).length} characters`,
    });
    return res.json({ success: true, message: 'Password accepted. Update ADMIN_PASSWORD env var on Render to persist.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reset-password  — unauthenticated reset (sends email)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/reset-password', resetSecretAttemptLimit, async (req, res) => {
  try {
    const { username } = req.body;
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'];
    const requestTime = formatAuditTime();
    if (!username || username !== ADMIN_USERNAME) {
      return res.status(400).json({ error: 'Username not found' });
    }
    if (!ADMIN_EMAIL) {
      return res.status(400).json({ error: 'Missing ADMIN_EMAIL' });
    }
    const resetMail = {
      from:    `"NextFiler Admin" <${process.env.EMAIL_USER}>`,
      to:      ADMIN_EMAIL,
      subject: 'Password Reset Request',
      html:    `<div style="font-family:Arial,sans-serif;line-height:1.6;max-width:640px;margin:auto;padding:20px;">
                  <h2 style="color:#dc2626;">Password reset requested</h2>
                  <p><strong>Admin user:</strong> ${username}</p>
                  <p><strong>Time (UTC):</strong> ${requestTime}</p>
                  <p><strong>IP:</strong> ${clientIp}</p>
                  <p><strong>User-Agent:</strong> ${userAgent || 'unknown'}</p>
                  <p>The reset request was received and handled by the server. No password value is included in this email.</p>
                  <p>Please update the <code>ADMIN_PASSWORD</code> environment variable on Render and redeploy if you want this change to persist.</p>
                </div>`,
    };
    await sendEmail({
      to: resetMail.to,
      subject: resetMail.subject,
      html: resetMail.html,
    });
    return res.json({ success: true, message: 'Reset instructions sent to admin email.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`? Server running on port ${PORT}`));
