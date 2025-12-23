# Jam Rooms - Deployment Guide

This guide will help you deploy your Jam Rooms application to the cloud for free.

## Overview

- **Frontend**: Vercel (Free)
- **Backend**: Render (Free tier)
- **Database**: Neon PostgreSQL (Free tier - 500MB)

## Step 1: Set Up Cloud Database (Neon)

1. Go to [neon.tech](https://neon.tech) and sign up for free
2. Click "Create Project"
3. Name your project: `jam-rooms-db`
4. Select region closest to you
5. Click "Create Project"
6. Copy the connection string (it looks like: `postgresql://user:password@host/database`)
7. **IMPORTANT**: Save this connection string - you'll need it for the backend deployment

## Step 2: Push Your Code to GitHub

1. Create a new repository on GitHub: https://github.com/new
2. Name it: `jam-rooms`
3. Make it public (required for free Render deployment)
4. In your terminal, run:

```bash
cd c:\omer\projects\Jam-Rooms
git init
git add .
git commit -m "Initial commit - Jam Rooms project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jam-rooms.git
git push -u origin main
```

## Step 3: Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign up for free
2. Click "New +" → "Web Service"
3. Connect your GitHub repository `jam-rooms`
4. Configure the service:
   - **Name**: `jam-rooms-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   - `DATABASE_URL`: Paste your Neon connection string
   - `FRONTEND_URL`: `*` (we'll update this after deploying frontend)

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL (looks like: `https://jam-rooms-backend.onrender.com`)

## Step 4: Run Database Migrations

After backend is deployed:

1. In Render dashboard, go to your service
2. Click "Shell" tab
3. Run these commands:

```bash
cd app
alembic upgrade head
```

## Step 5: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up for free
2. Click "Add New..." → "Project"
3. Import your `jam-rooms` repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://jam-rooms-backend.onrender.com`)
   - `NEXT_PUBLIC_SOCKET_URL`: Same as API URL

6. Click "Deploy"
7. Wait for deployment (2-5 minutes)
8. Copy your frontend URL (looks like: `https://jam-rooms.vercel.app`)

## Step 6: Update Backend CORS

1. Go back to Render dashboard
2. Click on your backend service
3. Go to "Environment" tab
4. Update the `FRONTEND_URL` variable:
   - Change from `*` to your Vercel URL (e.g., `https://jam-rooms.vercel.app`)
5. Save changes (this will trigger a redeploy)

## Step 7: Test Your Application

1. Visit your Vercel URL
2. Create a room with a password
3. Join from another browser/incognito window
4. Test all features:
   - Real-time participant updates
   - Song selection
   - Close room

## Important Notes

### Free Tier Limitations

- **Render Free Tier**: Backend will sleep after 15 minutes of inactivity. First request after sleep takes 30-60 seconds to wake up.
- **Neon Free Tier**: 500MB database storage, 1 project
- **Vercel Free Tier**: Unlimited bandwidth for personal projects

### Keeping Backend Awake (Optional)

If you want to prevent the backend from sleeping, you can use a free service like [UptimeRobot](https://uptimerobot.com) to ping your backend every 5 minutes.

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify DATABASE_URL is correct
- Make sure all environment variables are set

### Frontend can't connect to backend
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS settings in backend
- Look at browser console for errors

### Database errors
- Make sure you ran migrations (alembic upgrade head)
- Verify Neon database is active
- Check connection string format

## Updating Your Deployment

When you make changes to your code:

1. Commit and push to GitHub:
```bash
git add .
git commit -m "Description of changes"
git push
```

2. Render and Vercel will automatically redeploy when you push to GitHub

## Your Live URLs

After deployment, save these URLs:

- **Frontend**: https://jam-rooms-XXXX.vercel.app
- **Backend**: https://jam-rooms-backend-XXXX.onrender.com
- **Database**: (Neon dashboard URL)

Add your frontend URL to your resume!
