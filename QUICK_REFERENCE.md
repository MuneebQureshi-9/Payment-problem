# ⚡ Quick Reference - Deployment Commands

## Backend Setup (Copy & Paste)

```powershell
cd "e:\Programming Projects\Client Problem Fixing\Main\payment-dashboard\backend"
git init
git config user.name "Your Name"
git config user.email "your@email.com"
git add .
git commit -m "Initial backend commit"
git remote add origin https://github.com/YOUR_USERNAME/payment-dashboard-backend.git
git branch -M main
git push -u origin main
```

Then:
1. Go to Render.com
2. Click **+ New** → **Web Service**
3. Select GitHub repo
4. Build: `npm install`
5. Start: `npm start`
6. Add all env variables from `.env`
7. Deploy!

---

## Frontend Setup (Copy & Paste)

```powershell
cd "e:\Programming Projects\Client Problem Fixing\Main\payment-dashboard\frontend"
```

**Before pushing, update this file:**
```
frontend/online-payment/config.js
→ Change "production" URL to your Render API URL
```

Then:
```powershell
git init
git config user.name "Your Name"
git config user.email "your@email.com"
git add .
git commit -m "Initial frontend commit"
git remote add origin https://github.com/YOUR_USERNAME/payment-dashboard-frontend.git
git branch -M main
git push -u origin main
```

Then:
1. Go to Render.com
2. Click **+ New** → **Static Site**
3. Select GitHub repo
4. Publish Directory: `frontend`
5. Deploy!

---

## Important Files

| File | Location | Purpose |
|------|----------|---------|
| API Config | `frontend/online-payment/config.js` | Update with Render backend URL |
| Secrets | `backend/.env` | Don't commit! Copy to Render env vars |
| Backend Code | `backend/server.js` | Auto-deploys when you push |
| Frontend Code | `frontend/online-payment/script.js` | Auto-deploys when you push |

---

## Testing

```
Backend: https://your-api.onrender.com/api/login
Frontend: https://your-site.onrender.com
```

Check browser console (F12) for API errors.

---

## Environment Variables (Add to Render)

```
SUPABASE_URL = [your supabase url]
SUPABASE_KEY = [your supabase key]
EMAIL_USER = your-email@example.com
EMAIL_PASS = your-email-password
ADMIN_EMAIL = your-admin-email@example.com
JWT_SECRET = your-jwt-secret
ADMIN_USERNAME = admin
ADMIN_PASSWORD = your-admin-password
BREVO_SMTP_HOST = smtp-relay.brevo.com
BREVO_SMTP_PORT = 587
BREVO_SMTP_USER = your-brevo-smtp-user
BREVO_SMTP_PASS = [your brevo pass]
BREVO_FROM_EMAIL = your-from-email@example.com
BREVO_FROM_NAME = DebtCollectionServiceUs
BREVO_REPLY_TO = your-reply-to@example.com
NODE_ENV = production
```

---

## After Each Update

```powershell
git add .
git commit -m "Your message"
git push
# Render auto-deploys in 30 seconds!
```

---

## URLs to Save

- GitHub Backend: https://github.com/YOUR_USERNAME/payment-dashboard-backend
- GitHub Frontend: https://github.com/YOUR_USERNAME/payment-dashboard-frontend
- Render Dashboard: https://render.com/dashboard
- Frontend Live: https://your-frontend.onrender.com
- Backend API: https://your-api.onrender.com

---

## Problems?

**Cold start takes 30 seconds?** → Normal for free tier
**Emails not sending?** → Check BREVO credentials
**Can't reach API?** → Check config.js URL + CORS headers

See: LIVE_DEPLOYMENT.md for detailed troubleshooting

