# Payment Dashboard — Setup Guide

## Project Structure
```
payment-dashboard/
├── backend/
│   ├── server.js        ← Express API + MongoDB
│   └── package.json
├── dashboard/
│   └── index.html       ← Admin dashboard (open in browser)
├── index.html           ← Payment form (your original)
├── script.js            ← Updated — now saves to MongoDB + EmailJS
├── style.css
└── bg.png
```

---

## Step 1 — Install & Run Backend

```bash
cd backend
npm install
node server.js
```

Server will start on **http://localhost:3001**

---

## Step 2 — Open Payment Form

Just open `index.html` in browser (or host it).
When someone fills the form → data saves to MongoDB automatically.

---

## Step 3 — Open Dashboard

Open `dashboard/index.html` in browser.

**Login credentials:**
- Username: `admin`
- Password: `admin123`

---

## Change Admin Password

Edit `backend/server.js` line:
```js
const ADMIN = { username: 'admin', password: 'admin123' };
```

---

## If Deployed (not localhost)

Update API URL in TWO places:

1. `script.js` line:
   ```js
   const API_BASE = 'https://your-server.com';
   ```

2. `dashboard/index.html` line:
   ```js
   const API = 'https://your-server.com';
   ```
## If changing emailjs
first make account on emailjs.com
make template on email js 
change
Public Key : 
Service ID:
Template ID:
---

## Dashboard Features
-   use this link for admin  file:///D:/main/payment-dashboard/payment-dashboard/frontend/dashboard/index.html
- 🔍 Search by name, email, transaction ID, country, amount
- 📄 Pagination (100 per page)
- 🖱️ Click any row → full details popup (card number, address, etc.)
- 🔄 Refresh button
- 🔐 JWT login (token saved in localStorage, valid 24 hours)
