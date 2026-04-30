# Payment Dashboard - Complete Deployment Guide

## Project Structure

```
payment-dashboard/
├── backend/                 (Node.js/Express API)
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── render.yaml
│   └── Procfile
├── frontend/                (HTML/CSS/JS Frontend)
│   ├── index.html
│   ├── package.json
│   ├── online-payment/
│   │   ├── index.html
│   │   ├── script.js
│   │   ├── style.css
│   │   └── config.js        ← Update API URL here!
│   └── dashboard/
├── LIVE_DEPLOYMENT.md       ← FULL DEPLOYMENT GUIDE
└── DEPLOYMENT_GUIDE.md
```

## Quick Start - Deploy to Render

### Backend (5 minutes)
1. Push backend to GitHub
2. Create Render Web Service from GitHub
3. Add environment variables
4. Deploy → Get API URL

### Frontend (3 minutes)
1. Update `frontend/online-payment/config.js` with your backend URL
2. Push to GitHub
3. Create Render Static Site
4. Deploy

**Total time: ~15 minutes**

## Files You Need to Know

| File | Purpose | How to Update |
|------|---------|---------------|
| `backend/.env` | API Keys & Secrets | Never commit, set in Render dashboard |
| `frontend/online-payment/config.js` | API Endpoint | Update with your Render backend URL |
| `backend/server.js` | API Logic | Changes auto-deploy when you push |
| `frontend/online-payment/script.js` | Form Logic | Changes auto-deploy when you push |

## Environment Variables (Backend)

Add these to Render:

```
SUPABASE_URL, SUPABASE_KEY
EMAIL_USER, EMAIL_PASS
SMTP_HOST, SMTP_PORT, SMTP_SECURE
ADMIN_EMAIL, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
DASHBOARD_URL
ALLOWED_ORIGINS
```

## Testing

**Backend**: `https://your-api.onrender.com/api/login`
**Frontend**: `https://your-site.onrender.com` → Fill form → Submit

Check browser Console (F12) for API errors.

## Need Help?

See detailed guide: `LIVE_DEPLOYMENT.md`

Good luck! 🚀
