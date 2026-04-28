# 🚀 Deployment Checklist

## Pre-Deployment Checklist

- [ ] You have GitHub account (https://github.com)
- [ ] You have Render account (https://render.com)
- [ ] You have all environment variables ready (copy from `.env`)
- [ ] Frontend config.js is ready to update

---

## Backend Deployment (Render)

### Local Git Setup
- [ ] Opened PowerShell in `payment-dashboard/backend/`
- [ ] Ran: `git init`
- [ ] Ran: `git config user.name "Your Name"` 
- [ ] Ran: `git config user.email "your@email.com"`
- [ ] Ran: `git add .`
- [ ] Ran: `git commit -m "Initial backend commit"`

### GitHub Setup
- [ ] Created new repo at https://github.com/new
- [ ] Named it: `payment-dashboard-backend`
- [ ] Ran: `git remote add origin https://github.com/YOUR_USERNAME/payment-dashboard-backend.git`
- [ ] Ran: `git push -u origin main`
- [ ] Can see files on GitHub.com ✓

### Render Deployment
- [ ] Went to https://render.com
- [ ] Clicked **+ New** → **Web Service**
- [ ] Authorized GitHub
- [ ] Selected `payment-dashboard-backend` repo
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `npm start`
- [ ] Clicked **Create Web Service**
- [ ] **COPIED the URL**: `https://payment-dashboard-api-xxxx.onrender.com`

### Environment Variables (Render Dashboard)
- [ ] Went to: Environment tab
- [ ] Added all variables from `.env`:
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_KEY
  - [ ] EMAIL_USER
  - [ ] EMAIL_PASS
  - [ ] ADMIN_EMAIL
  - [ ] JWT_SECRET
  - [ ] ADMIN_USERNAME
  - [ ] ADMIN_PASSWORD
  - [ ] BREVO_SMTP_HOST
  - [ ] BREVO_SMTP_PORT
  - [ ] BREVO_SMTP_USER
  - [ ] BREVO_SMTP_PASS
  - [ ] BREVO_FROM_EMAIL
  - [ ] BREVO_FROM_NAME
  - [ ] BREVO_REPLY_TO
  - [ ] NODE_ENV = `production`
- [ ] Clicked **Save**
- [ ] Backend auto-deployed ✓
- [ ] Logs show: `✅ Server running on port ...`

### Test Backend
- [ ] Opened browser to: `https://payment-dashboard-api-xxxx.onrender.com/api/login`
- [ ] Saw response (may be error, that's OK) ✓

---

## Frontend Deployment (Render)

### Update Configuration
- [ ] Opened: `frontend/online-payment/config.js`
- [ ] Updated line: `production: 'https://payment-dashboard-api-xxxx.onrender.com'`
- [ ] Saved file

### GitHub Setup
- [ ] Opened PowerShell in `payment-dashboard/frontend/`
- [ ] Ran: `git init`
- [ ] Ran: `git config user.name "Your Name"`
- [ ] Ran: `git config user.email "your@email.com"`
- [ ] Ran: `git add .`
- [ ] Ran: `git commit -m "Initial frontend commit"`
- [ ] Created new repo: `payment-dashboard-frontend`
- [ ] Ran: `git remote add origin https://github.com/YOUR_USERNAME/payment-dashboard-frontend.git`
- [ ] Ran: `git push -u origin main`
- [ ] Can see files on GitHub.com ✓

### Render Deployment
- [ ] Went to https://render.com
- [ ] Clicked **+ New** → **Static Site**
- [ ] Selected `payment-dashboard-frontend` repo
- [ ] Set **Publish Directory**: `frontend` (or just leave if root)
- [ ] Clicked **Create Static Site**
- [ ] **COPIED the URL**: `https://payment-dashboard-web-xxxx.onrender.com`
- [ ] Deployment completed ✓

### Test Frontend
- [ ] Opened browser to your frontend URL
- [ ] Page loaded ✓
- [ ] Form appears ✓
- [ ] Filled test form data
- [ ] Clicked "Pay Now"
- [ ] Got success message ✓

---

## Verification

### In Browser Console (F12 - Console tab)
- [ ] See: `🔗 API Base URL: https://payment-dashboard-api-xxxx.onrender.com`
- [ ] No CORS errors ✓
- [ ] Payment saved to Supabase ✓

### In Admin Panel
- [ ] Visit: `https://your-frontend/dashboard/` (if dashboard exists)
- [ ] Login with: admin / admin123
- [ ] See payment record ✓

### Email Verification
- [ ] Check your admin email for payment notifications ✓

---

## Done! 🎉

Your payment dashboard is now **LIVE**!

**Frontend URL**: `https://payment-dashboard-web-xxxx.onrender.com`
**Backend API**: `https://payment-dashboard-api-xxxx.onrender.com`

---

## Post-Deployment

### If You Need to Update Code
1. Make changes locally
2. `git add .` → `git commit -m "message"` → `git push`
3. Render auto-deploys!

### If You Need to Upgrade Plan
- Free plan has 15-min cold start
- Go to Render dashboard → Select service → Upgrade plan

### Troubleshooting

**"Cannot connect to API"**
- Check config.js API URL
- Check Render backend logs
- Wait 30 seconds (cold start)

**"Email not sending"**
- Check email credentials in Render env vars
- Check Brevo SMTP settings
- Look at backend logs

---

## Keep These Safe 🔐

Save these URLs and credentials somewhere secure:
- Frontend URL: ___________________________________
- Backend API URL: ___________________________________
- GitHub repos: ___________________________________
- Render account: ___________________________________

Don't share `.env` file or GitHub repos with API keys!
