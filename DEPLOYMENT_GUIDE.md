# Deployment Guide for Payment Dashboard

## Backend Deployment on Render

### Step 1: Push to GitHub
```bash
cd payment-dashboard/backend
git init
git add .
git commit -m "Initial backend commit"
git remote add origin https://github.com/YOUR_USERNAME/payment-dashboard-backend.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to https://render.com
2. Click "New Web Service"
3. Connect your GitHub repository
4. Fill in:
   - **Name**: payment-dashboard-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter paid)

### Step 3: Add Environment Variables on Render
In Render dashboard, go to your service → Environment

Add all variables from `.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
EMAIL_USER=your-smtp-email@example.com
EMAIL_PASS=your-smtp-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
ADMIN_EMAIL=your-admin-email@example.com
JWT_SECRET=your-jwt-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password
DASHBOARD_URL=https://payment-dashboard-web.onrender.com/dashboard/
NODE_ENV=production
```

Notes:
- Backend now uses Nodemailer only.
- Admin notifications are minimal and do not include confidential form data.

### Step 4: Deploy
Click "Deploy" — it will automatically pull from GitHub and start your server

---

## Frontend Deployment Options

### Option A: Render (Recommended - Same Platform)
1. On Render, create a **Static Site** (different from web service)
2. Connect same GitHub repo
3. Build command: (leave empty)
4. Publish directory: `frontend`

### Option B: FTP Hosting
Upload files from `frontend/` folder:
- index.html
- dashboard/index.html
- online-payment/ (entire folder)

Update `frontend` files to point to your Render API:
- Replace `localhost:3001` with your Render URL
- Example: `https://payment-dashboard-api.onrender.com`

---

## Testing After Deployment

1. **Test Backend**: `https://your-api-url/api/login` (POST)
2. **Test Frontend**: Visit your frontend URL
3. **Check Logs**: On Render dashboard → Logs tab

