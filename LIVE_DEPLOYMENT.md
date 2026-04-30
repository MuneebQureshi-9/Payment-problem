# Payment Dashboard - Live Deployment Instructions

## Quick Setup Summary

✅ Backend: Node.js/Express → Deploy on **Render**  
✅ Frontend: HTML/JS → Deploy on **Render** OR **FTP**  
✅ Database: Supabase (already configured)  
✅ Email: Nodemailer SMTP (already configured)  

---

## OPTION 1: Deploy Everything on Render (Recommended)

### Backend Setup

1. **Initialize Git in Backend Folder**
```bash
cd "e:\Programming Projects\Client Problem Fixing\Main\payment-dashboard\backend"
git init
git config user.name "Your Name"
git config user.email "your@email.com"
git add .
git commit -m "Initial backend commit - Payment Dashboard API"
```

2. **Create GitHub Repository**
   - Go to https://github.com/new
   - Create repo: `payment-dashboard-backend`
   - Copy SSH/HTTPS URL
   - Add remote:
```bash
git remote add origin https://github.com/YOUR_USERNAME/payment-dashboard-backend.git
git branch -M main
git push -u origin main
```

3. **Deploy on Render**
   - Visit https://render.com
   - Sign up/Login
   - Click **+ New** → **Web Service**
   - Connect GitHub (authorize Render)
   - Select `payment-dashboard-backend` repository
   - Fill in:
     - **Name**: `payment-dashboard-api`
     - **Environment**: `Node`
     - **Region**: `Ohio` (or closest to your users)
     - **Branch**: `main`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: `Free` (for testing) or `Starter` (production)
   - Click **Create Web Service**

4. **Add Environment Variables**
   - In Render dashboard → Your service → **Environment**
   - Click **Add Environment Variable** and add all of these:

```
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_KEY = your-supabase-service-role-key
EMAIL_USER = your-smtp-email@example.com
EMAIL_PASS = your-smtp-password
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_SECURE = false
ADMIN_EMAIL = your-admin-email@example.com
JWT_SECRET = your-jwt-secret
ADMIN_USERNAME = admin
ADMIN_PASSWORD = your-admin-password
DASHBOARD_URL = https://payment-dashboard-web.onrender.com/dashboard/
ALLOWED_ORIGINS = https://payment-dashboard-web.onrender.com,http://localhost:3001
NODE_ENV = production
```

Important:
- The backend now uses Nodemailer only.
- Admin emails are short notifications, not full payment dumps.

5. **Wait for Deployment**
   - Render will auto-deploy
   - Check **Logs** tab for errors
   - You'll get a URL like: `https://payment-dashboard-api.onrender.com`
   - Test: `https://payment-dashboard-api.onrender.com/api/login` (should show error about missing body, that's OK)

---

### Frontend Setup (on Render)

1. **Copy frontend to same repo or new one**

Option A: Same repo structure
```
/backend → your backend code
/frontend → your frontend code
```

Option B: Separate GitHub repo
```bash
cd "e:\Programming Projects\Client Problem Fixing\Main\payment-dashboard\frontend"
git init
git add .
git commit -m "Initial frontend commit"
git remote add origin https://github.com/YOUR_USERNAME/payment-dashboard-frontend.git
git push -u origin main
```

2. **Update config.js with Render API URL**
   - File: `frontend/online-payment/config.js`
   - Update line in config.js:
```javascript
production: 'https://payment-dashboard-api.onrender.com'
```
   - Commit and push

3. **Deploy Frontend on Render**
   - Click **+ New** → **Static Site**
   - Connect your frontend GitHub repo
   - Fill in:
     - **Name**: `payment-dashboard-web`
     - **Branch**: `main`
     - **Build Command**: (leave empty - no build needed)
     - **Publish Directory**: `frontend`
   - Click **Create Static Site**

4. **Get Frontend URL**
   - Render will give you: `https://payment-dashboard-web.onrender.com`

---

## OPTION 2: FTP Hosting for Frontend + Render for Backend

### Step 1: Deploy Backend on Render (same as Option 1)

### Step 2: Prepare Frontend for FTP

1. **Update config.js**
```javascript
// In frontend/online-payment/config.js
production: 'https://payment-dashboard-api.onrender.com'  // Your Render API URL
```

2. **Get these files ready for FTP:**
```
frontend/
├── index.html
├── online-payment/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── config.js
└── dashboard/
    └── index.html
```

3. **FTP Upload via FileZilla or similar:**
   - Use your FTP credentials
   - Upload files to public_html/ or www/ folder
   - Set `frontend/index.html` as entry point
   - Make sure `.htaccess` allows routing to index.html

4. **Test:**
   - Visit your FTP domain
   - Should redirect to `/online-payment`
   - Fill form and submit
   - Should connect to Render API

---

## Testing After Deployment

### Test Backend API
```bash
# Login endpoint (try in browser or curl)
curl -X POST https://your-render-api.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Should return JWT token
```

### Test Frontend
1. Open your frontend URL
2. Fill form with test data
3. Click "Pay Now"
4. Check admin panel for payment record
5. Check admin email for notification

### Check Logs
- **Render Backend**: Dashboard → Service → Logs
- **Render Frontend**: Dashboard → Site → Runtime Logs
- **Browser Console**: Open DevTools (F12) → Console tab

---

## Troubleshooting

### Backend won't deploy
- Check Render Logs for errors
- Verify all env variables are set
- Make sure `package.json` has correct dependencies

### Frontend can't reach backend
- Open browser DevTools (F12)
- Check Console for CORS errors
- Verify API URL in config.js matches actual Render backend URL
- Backend needs CORS headers (already configured)

### Emails not sending
- Check `EMAIL_USER` / `EMAIL_PASS`
- Confirm SMTP host/port values
- Look at backend logs for email errors

### "Cannot GET" errors
- Make sure static files uploaded to right folder
- Check Publish Directory is set to `frontend`

---

## Important Notes

⚠️ **FREE Plan on Render**:
- Spins down after 15 min inactivity
- ~30s cold start time
- For production: upgrade to Starter ($7/month)

⚠️ **Email Delivery**:
- First test with your own email
- Verify SMTP settings
- Check spam folder

⚠️ **HTTPS Only**:
- Render uses HTTPS by default
- Update config.js to use HTTPS

---

## Next Steps

1. Choose Option 1 or Option 2
2. Follow backend setup first
3. Get Render backend URL
4. Update frontend config.js with that URL
5. Deploy frontend
6. Test everything
7. Come back if issues!

Good luck! 🚀

