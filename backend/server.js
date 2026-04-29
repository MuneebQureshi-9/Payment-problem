require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const jwt        = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const countryStateCity = require('@countrystatecity/countries');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ─── Serve Static Frontend Files ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── Route for main pages ────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard/index.html'));
});

app.get('/online-payment', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/online-payment/index.html'));
});

const SMTP_HOST = process.env.BREVO_SMTP_HOST || process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.BREVO_SMTP_PORT || process.env.SMTP_PORT || '587', 10);
const SMTP_SECURE = String(process.env.BREVO_SMTP_SECURE || process.env.SMTP_SECURE || '').toLowerCase() === 'true';
const SMTP_USER = process.env.EMAIL_USER || process.env.BREVO_SMTP_USER || '';
const SMTP_PASS = process.env.EMAIL_PASS || process.env.BREVO_SMTP_PASS || '';

// ─── Supabase Client ─────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY   // service role key — full DB access, bypasses RLS
);

// ─── SMTP Transporter ────────────────────────────────────────────────────────
const transporterOptions = SMTP_HOST
  ? {
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    }
  : {
      service: 'gmail',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    };

const transporter = nodemailer.createTransport(transporterOptions);

// ─── JWT Secret & Admin Credentials (from env) ───────────────────────────────
const JWT_SECRET       = process.env.JWT_SECRET       || 'nextfiler_admin_secret_2024';
const ADMIN_USERNAME   = process.env.ADMIN_USERNAME   || 'admin';
let ADMIN_PASSWORD     = process.env.ADMIN_PASSWORD   || 'admin123';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'admin_secret_key_2026';
const ADMIN_EMAIL      = process.env.ADMIN_EMAIL      || '';
const FROM_EMAIL       = process.env.EMAIL_USER || process.env.BREVO_FROM_EMAIL || 'noreply@example.com';
const FROM_NAME        = process.env.BREVO_FROM_NAME  || 'NextFiler';
const REPLY_TO         = process.env.BREVO_REPLY_TO   || FROM_EMAIL;

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

// ─── Helper: map Supabase row → frontend-compatible object ───────────────────
// The dashboard HTML uses p._id throughout, so we alias the UUID `id` → `_id`
function mapPayment(row) {
  if (!row) return null;
  const { id, ...rest } = row;
  return { _id: id, ...rest };
}

async function sendResendEmail({ to, subject, html }) {
  if (!to) {
    throw new Error('Missing recipient email');
  }

  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP credentials missing: set BREVO_SMTP_USER/BREVO_SMTP_PASS or EMAIL_USER/EMAIL_PASS');
  }

  const response = await transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    replyTo: REPLY_TO,
    to,
    subject,
    html,
  });

  return response;
}

// ═════════════════════════════════════════════════════════════════════════════
// ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
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
// POST /api/send-email  — send confirmation to customer + full details to admin
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

    // 1️⃣  Customer confirmation email
    const customerMail = {
      from: `"NextFiler" <${process.env.EMAIL_USER}>`,
      to:   email,
      subject: `Details Received — ${transaction_id}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;text-align:center;">
          <h2 style="color:#4f46e5;">Details Received ✅</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you, we have successfully received your details.</p>
          <p style="font-size:16px;font-weight:bold;color:#333;margin:20px 0;">Your payment is currently in process.</p>
          <p style="color:#6b7280;font-size:12px;margin-top:30px;">This is an automated message — please do not reply.</p>
        </div>
      `,
    };

    // 2️⃣  Admin full-details email
    const adminMail = {
      from: `"NextFiler Payments" <${process.env.EMAIL_USER}>`,
      to:   ADMIN_EMAIL,
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
                <td style="padding:8px;border:1px solid #e5e7eb;">${phone || 'N/A'}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Address</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${address1 || ''} ${address2 || ''}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">City / State / Postal</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${city || ''}, ${state || ''} ${postal || ''}</td></tr>
            <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Country</td>
                <td style="padding:8px;border:1px solid #e5e7eb;">${country || 'N/A'}</td></tr>
          </table>
        </div>
      `,
    };

    await Promise.all([
      sendResendEmail({
        to: customerMail.to,
        subject: customerMail.subject,
        html: customerMail.html,
      }),
      sendResendEmail({
        to: adminMail.to,
        subject: adminMail.subject,
        html: adminMail.html,
      }),
    ]);

    console.log(`✅ Emails sent for txn ${transaction_id}`);
    return res.json({ success: true, message: 'Emails sent successfully' });
  } catch (err) {
    console.error('❌ Email send error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reset-password-admin — reset password using admin secret key
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/reset-password-admin', async (req, res) => {
  try {
    const { secretKey, newPassword } = req.body;
    
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
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing currentPassword or newPassword' });
    }
    if (currentPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    // On a stateless server the new password would need to be persisted via env vars or a DB record.
    // For now we acknowledge success — update ADMIN_PASSWORD env var on Render to take effect permanently.
    console.log('Password change requested — update ADMIN_PASSWORD env var on Render.');
    return res.json({ success: true, message: 'Password accepted. Update ADMIN_PASSWORD env var on Render to persist.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reset-password  — unauthenticated reset (sends email)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/reset-password', async (req, res) => {
  try {
    const { username } = req.body;
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
      html:    `<p>A password reset was requested for admin account <strong>${username}</strong>.</p>
                <p>Please update the <code>ADMIN_PASSWORD</code> environment variable on Render and redeploy.</p>`,
    };
    await sendResendEmail({
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
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
