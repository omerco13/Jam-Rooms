# Quick Start - Deploy Jam Rooms in 30 Minutes

Follow these steps to deploy your application to the cloud.

## ✅ Checklist

- [ ] Create Neon database account
- [ ] Push code to GitHub
- [ ] Deploy backend to Render
- [ ] Run database migrations
- [ ] Deploy frontend to Vercel
- [ ] Test the application

---

## Step-by-Step Instructions

### 1️⃣ Create Cloud Database (5 minutes)

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub (easiest)
3. Click "Create Project"
4. Project name: `jam-rooms-db`
5. **Copy the connection string** - looks like:
   ```
   postgresql://user:password@ep-xyz.region.aws.neon.tech/dbname
   ```
6. Save it in a text file - you'll need it!

### 2️⃣ Push to GitHub (2 minutes)

```bash
# In your terminal (make sure you're in the Jam-Rooms folder)
cd c:\omer\projects\Jam-Rooms

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Push to GitHub (if you haven't set up remote yet)
git push
```

**If you get an error about no remote:**
1. Create a new repo on GitHub: https://github.com/new
2. Name it: `jam-rooms` (make it PUBLIC)
3. Run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/jam-rooms.git
git push -u origin main
```

### 3️⃣ Deploy Backend to Render (10 minutes)

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Find and select your `jam-rooms` repository
5. Fill in:
   - **Name**: `jam-rooms-backend`
   - **Region**: US West (Oregon) or closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free

6. Click **"Advanced"** → **"Add Environment Variable"**:

   **First variable:**
   - Key: `DATABASE_URL`
   - Value: *(Paste your Neon connection string)*

   **Second variable:**
   - Key: `FRONTEND_URL`
   - Value: `*`

7. Click **"Create Web Service"**
8. ⏳ Wait 5-10 minutes for deployment
9. **Copy your backend URL** (e.g., `https://jam-rooms-backend-xyz.onrender.com`)

### 4️⃣ Run Database Migrations (2 minutes)

1. In Render, click on your service
2. Click **"Shell"** tab on the left
3. Run these commands one by one:
```bash
cd app
alembic upgrade head
exit
```

### 5️⃣ Deploy Frontend to Vercel (5 minutes)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your `jam-rooms` repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`

6. Click **"Environment Variables"** and add:

   **First variable:**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: *(Paste your Render backend URL)*

   **Second variable:**
   - Name: `NEXT_PUBLIC_SOCKET_URL`
   - Value: *(Same Render backend URL)*

7. Click **"Deploy"**
8. ⏳ Wait 2-5 minutes
9. **Copy your frontend URL** (e.g., `https://jam-rooms-xyz.vercel.app`)

### 6️⃣ Update Backend CORS (2 minutes)

1. Go back to Render dashboard
2. Click on your backend service
3. Click **"Environment"** on the left
4. Find `FRONTEND_URL` and click **Edit**
5. Change value from `*` to your Vercel URL (e.g., `https://jam-rooms-xyz.vercel.app`)
6. Click **"Save Changes"**
7. ⏳ Backend will redeploy (2-3 minutes)

### 7️⃣ Test Your App! (5 minutes)

1. Visit your Vercel URL
2. Click **"Create a Room"**
   - Enter your name
   - Choose an instrument
   - Set a password
3. Open another browser (or incognito window)
4. Click **"Join a Room"**
   - Enter the room name (e.g., "Red Room")
   - Enter your name
   - Choose an instrument
   - Enter the password
5. Test features:
   - ✅ Do participants appear in real-time?
   - ✅ Can admin select a song?
   - ✅ Can admin close the room?

---

## 🎉 Success!

Your app is now live!

**Add to your resume:**
- Project Link: [Your Vercel URL]
- GitHub: [Your GitHub repo URL]

## 📝 Save These URLs

Create a file called `DEPLOYMENT_URLS.txt`:

```
Frontend: https://jam-rooms-xyz.vercel.app
Backend: https://jam-rooms-backend-xyz.onrender.com
GitHub: https://github.com/YOUR_USERNAME/jam-rooms
Database: https://console.neon.tech (your dashboard)
```

---

## ⚠️ Important Notes

**Free Tier Limitations:**
- Backend sleeps after 15 min of inactivity
- First request after sleep takes 30-60 seconds
- Database limited to 500MB

**Keep Backend Awake (Optional):**
- Use [UptimeRobot](https://uptimerobot.com) (free)
- Ping your backend URL every 5 minutes

---

## 🆘 Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify DATABASE_URL is correct

### Frontend can't connect
- Verify environment variables in Vercel
- Check backend CORS settings

### "Room not found" errors
- Make sure migrations ran successfully
- Check Render logs

---

## 🔄 Making Updates

When you make code changes:

```bash
git add .
git commit -m "Your change description"
git push
```

Both Render and Vercel will auto-deploy!

---

Need help? Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
