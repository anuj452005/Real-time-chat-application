# Complete Render Deployment Guide - Microservice Chat Project

This comprehensive guide will walk you through deploying your microservices-based real-time chat application on Render, from pushing code to GitHub to complete deployment with all environment variables configured.

---

## 📋 Table of Contents
1. [Prerequisites & Account Setup](#prerequisites--account-setup)
2. [Infrastructure Services Setup](#infrastructure-services-setup)
3. [Preparing Your Code for GitHub](#preparing-your-code-for-github)
4. [Deploying Backend Services on Render](#deploying-backend-services-on-render)
5. [Frontend Deployment on Vercel](#frontend-deployment-on-vercel)
6. [Final Configuration & Testing](#final-configuration--testing)
7. [Troubleshooting](#troubleshooting)

---

## 📦 Prerequisites & Account Setup

### Required Accounts
Make sure you have accounts on these platforms:

1. **[GitHub](https://github.com/)** - Version control and code hosting
2. **[Render](https://render.com/)** - Backend services hosting (Free Tier)
3. **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)** - Database (Free Tier)
4. **[Upstash](https://upstash.com/)** - Redis cache (Free Tier)
5. **[CloudAMQP](https://www.cloudamqp.com/)** - RabbitMQ message broker (Free Tier)
6. **[Cloudinary](https://cloudinary.com/)** - Media storage (Free Tier)
7. **[Google Cloud Console](https://console.cloud.google.com/)** - OAuth setup
8. **[Vercel](https://vercel.com/)** - Frontend hosting (Free Tier)

### Local Requirements
- Git installed on your machine
- Node.js installed (v18 or higher recommended)

---

## 🏗️ Infrastructure Services Setup

### 1️⃣ MongoDB Atlas Setup (Database)

**Step 1:** Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.

**Step 2:** Create a New Cluster
- Click **"Build a Database"**
- Select **"M0 FREE"** tier
- Choose a Cloud Provider and Region (closest to your Render region)
- Click **"Create Cluster"**

**Step 3:** Create Database User
- Go to **"Database Access"** (left sidebar)
- Click **"Add New Database User"**
- Set username: `chatadmin` (or your choice)
- Set password: Generate a secure password (save it!)
- Select **"Read and write to any database"**
- Click **"Add User"**

**Step 4:** Whitelist IP Addresses
- Go to **"Network Access"** (left sidebar)
- Click **"Add IP Address"**
- Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
- Click **"Confirm"**

**Step 5:** Get Connection String
- Go to **"Database"** → Click **"Connect"**
- Select **"Connect your application"**
- Copy the connection string (looks like):
  ```
  mongodb+srv://chatadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```
- **Replace `<password>`** with your actual database user password
- **Save this connection string** - you'll need it as `MONGO_URI`

---

### 2️⃣ Upstash Redis Setup (Caching & Sessions)

**Step 1:** Go to [Upstash](https://upstash.com/) and sign in.

**Step 2:** Create Redis Database
- Click **"Create Database"**
- Name: `chat-redis`
- Type: **Regional**
- Region: Choose closest to your Render services
- Click **"Create"**

**Step 3:** Get Credentials
- Click on your newly created database
- Scroll to **"REST API"** section
- Copy these two values:
  - `UPSTASH_REDIS_REST_URL` (e.g., `https://xxxxx.upstash.io`)
  - `UPSTASH_REDIS_REST_TOKEN` (long string)
- **Save both** - you'll need them for the User Service

---

### 3️⃣ CloudAMQP Setup (RabbitMQ Message Queue)

**Step 1:** Go to [CloudAMQP](https://www.cloudamqp.com/) and sign in.

**Step 2:** Create Instance
- Click **"Create New Instance"**
- Name: `chat-rabbitmq`
- Plan: **"Lemur (Free)"**
- Region: Choose closest to Render
- Click **"Create Instance"**

**Step 3:** Get AMQP URL
- Click on your instance name
- Copy the **"AMQP URL"** (looks like):
  ```
  amqps://username:password@host.cloudamqp.com/vhost
  ```
- **Save this URL** - you'll need it as `RABBITMQ_URL` for User and Mail services

---

### 4️⃣ Cloudinary Setup (Image & File Storage)

**Step 1:** Go to [Cloudinary](https://cloudinary.com/) and sign in.

**Step 2:** Get Credentials from Dashboard
- After login, you'll see your dashboard
- Note down these three values:
  - **Cloud Name**: `CLOUDINARY_CLOUD_NAME`
  - **API Key**: `CLOUDINARY_API_KEY`
  - **API Secret**: `CLOUDINARY_API_SECRET`
- **Save all three** - you'll need them for the Chat Service

---

### 5️⃣ Google OAuth Setup (Authentication)

**Step 1:** Go to [Google Cloud Console](https://console.cloud.google.com/)

**Step 2:** Create New Project (if needed)
- Click project dropdown → **"New Project"**
- Name: `chat-app-oauth`
- Click **"Create"**

**Step 3:** Enable Google+ API
- Go to **"APIs & Services"** → **"Library"**
- Search for **"Google+ API"**
- Click **"Enable"**

**Step 4:** Create OAuth Credentials
- Go to **"APIs & Services"** → **"Credentials"**
- Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
- Configure consent screen if prompted (External, fill basic info)
- Application Type: **"Web application"**
- Name: `Chat App`
- **Authorized JavaScript origins**: (Add these later after deploying)
  - `http://localhost:4000` (for local dev)
  - `https://your-user-service.onrender.com` (after deployment)
- **Authorized redirect URIs**: (Add these later)
  - `http://localhost:4000/api/v1/auth/google/callback` (for local dev)
  - `https://your-user-service.onrender.com/api/v1/auth/google/callback` (after deployment)
- Click **"Create"**

**Step 5:** Save Credentials
- Copy **Client ID** → Save as `GOOGLE_CLIENT_ID`
- Copy **Client Secret** → Save as `GOOGLE_CLIENT_SECRET`

> **Note:** You'll need to update the redirect URIs after deploying to Render

---

### 6️⃣ Gmail App Password (For Email Notifications)

**Step 1:** Go to your Google Account Security Settings
- Visit: [myaccount.google.com/security](https://myaccount.google.com/security)

**Step 2:** Enable 2-Factor Authentication (if not already)
- Required for App Passwords

**Step 3:** Generate App Password
- Search for **"App Passwords"** in settings
- Select **"Mail"** and **"Other (Custom name)"**
- Name: `Chat App Mail Service`
- Click **"Generate"**
- Copy the 16-character password
- **Save as `EMAIL_PASS`**
- Your email address will be `EMAIL_USER`

---

## 🐙 Preparing Your Code for GitHub

### Step 1: Initialize Git (if not already)

Open terminal in your project root directory:

```bash
# Navigate to your project
cd c:\gitandgithub\microservice-chat-project

# Initialize git (if not already initialized)
git init

# Check current status
git status
```

### Step 2: Create/Update .gitignore

Make sure your `.gitignore` includes:

```
# Dependencies
node_modules/
package-lock.json

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
*.tsbuildinfo

# Logs
logs/
*.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

### Step 3: Check for Sensitive Data

**IMPORTANT:** Before pushing, ensure NO `.env` files or sensitive data are tracked:

```bash
# Remove any accidentally tracked .env files
git rm --cached backend/user/.env 2>$null
git rm --cached backend/chat/.env 2>$null
git rm --cached backend/mail/.env 2>$null
git rm --cached frontend/.env.local 2>$null
```

### Step 4: Commit Your Code

```bash
# Add all files
git add .

# Commit with a message
git commit -m "Initial commit: Microservice chat application ready for deployment"
```

### Step 5: Create GitHub Repository

1. Go to [GitHub](https://github.com/) and sign in
2. Click **"+"** → **"New repository"**
3. Name: `microservice-chat-project` (or your choice)
4. **Keep it Private** if you have sensitive info (or use Public)
5. **DO NOT** initialize with README (you already have code)
6. Click **"Create repository"**

### Step 6: Push to GitHub

GitHub will show you commands. Use these:

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/microservice-chat-project.git

# Rename branch to main (if needed)
git branch -M main

# Push your code
git push -u origin main
```

**Verify:** Refresh your GitHub repository page - you should see all your code!

---

## 🚀 Deploying Backend Services on Render

You'll deploy **3 separate web services** on Render:
1. User Service (Port 4000 locally → Render assigns port)
2. Chat Service (Port 5000 locally → Render assigns port)
3. Mail Service (Port 6000 locally → Render assigns port)

---

### 🔐 Service 1: User Service Deployment

**Step 1:** Go to [Render Dashboard](https://dashboard.render.com/)

**Step 2:** Create New Web Service
- Click **"New +"** → **"Web Service"**

**Step 3:** Connect GitHub Repository
- Click **"Connect account"** (if first time)
- Search for your repository: `microservice-chat-project`
- Click **"Connect"**

**Step 4:** Configure Service Settings

| Setting | Value |
|---------|-------|
| **Name** | `chat-user-service` (or your choice) |
| **Region** | Select closest to you |
| **Branch** | `main` |
| **Root Directory** | `backend/user` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

**Step 5:** Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**. Add all of these:

| Key | Value | Example/Notes |
|-----|-------|---------------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `10000` | Render will override, but good to set |
| `MONGO_URI` | Your MongoDB connection string | `mongodb+srv://user:pass@cluster0.xxx.mongodb.net/chatdb?retryWrites=true&w=majority` |
| `UPSTASH_REDIS_REST_URL` | From Upstash dashboard | `https://xxxxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | From Upstash dashboard | Long token string |
| `RABBITMQ_URL` | From CloudAMQP | `amqps://user:pass@host.cloudamqp.com/vhost` |
| `JWT_SECRET` | Generate a random string | Use 32+ characters: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | `xxxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | OAuth secret |
| `CLIENT_URL` | Temporary placeholder | `https://localhost:3000` (update after Vercel deployment) |

**Step 6:** Create Web Service
- Click **"Create Web Service"**
- Wait 5-10 minutes for deployment
- Monitor logs in the dashboard

**Step 7:** Save Your Service URL
- Once deployed, you'll see a URL like: `https://chat-user-service.onrender.com`
- **Save this URL** - you'll need it for OAuth and frontend config

---

### 💬 Service 2: Chat Service Deployment

**Step 1:** Create New Web Service
- Click **"New +"** → **"Web Service"**

**Step 2:** Connect Same Repository
- Select: `microservice-chat-project`
- Click **"Connect"**

**Step 3:** Configure Service Settings

| Setting | Value |
|---------|-------|
| **Name** | `chat-message-service` (or your choice) |
| **Region** | **SAME as User Service** (important for latency) |
| **Branch** | `main` |
| **Root Directory** | `backend/chat` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

**Step 4:** Add Environment Variables

| Key | Value | Example/Notes |
|-----|-------|---------------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `10000` | Render will override |
| `MONGO_URI` | Same MongoDB connection string | Same as User Service |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard | `dxxxxxxx` |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard | `123456789012345` |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard | API secret key |
| `USER_SERVICE_URL` | User Service URL | `https://chat-user-service.onrender.com` (from Step 1) |

**Step 5:** Create Web Service
- Click **"Create Web Service"**
- Wait for deployment

**Step 6:** Save Your Service URL
- Save the URL: `https://chat-message-service.onrender.com`

---

### 📧 Service 3: Mail Service Deployment

**Step 1:** Create New Web Service
- Click **"New +"** → **"Web Service"**

**Step 2:** Connect Same Repository
- Select: `microservice-chat-project`
- Click **"Connect"**

**Step 3:** Configure Service Settings

| Setting | Value |
|---------|-------|
| **Name** | `chat-mail-service` (or your choice) |
| **Region** | Same as other services |
| **Branch** | `main` |
| **Root Directory** | `backend/mail` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

**Step 4:** Add Environment Variables

| Key | Value | Example/Notes |
|-----|-------|---------------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `10000` | Render will override |
| `RABBITMQ_URL` | Same CloudAMQP URL | Same as User Service |
| `EMAIL_USER` | Your Gmail address | `youremail@gmail.com` |
| `EMAIL_PASS` | Gmail App Password | 16-character password from Google |

**Step 5:** Create Web Service
- Click **"Create Web Service"**
- Wait for deployment

---

## 🌐 Frontend Deployment on Vercel

### Step 1: Go to Vercel

Visit [Vercel Dashboard](https://vercel.com/dashboard)

### Step 2: Import Project
- Click **"Add New..."** → **"Project"**
- Click **"Import Git Repository"**
- Find `microservice-chat-project`
- Click **"Import"**

### Step 3: Configure Project

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Next.js` (auto-detected) |
| **Root Directory** | Click **"Edit"** → Enter `frontend` |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `.next` (default) |
| **Install Command** | `npm install` (default) |

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

| Key | Value | Example |
|-----|-------|---------|
| `NEXT_PUBLIC_USER_SERVICE_URL` | Your User Service URL | `https://chat-user-service.onrender.com/api/v1` |
| `NEXT_PUBLIC_CHAT_SERVICE_URL` | Your Chat Service URL | `https://chat-message-service.onrender.com` |
| `NEXT_PUBLIC_SOCKET_URL` | Same as Chat Service URL | `https://chat-message-service.onrender.com` |

### Step 5: Deploy
- Click **"Deploy"**
- Wait 3-5 minutes
- You'll get a URL like: `https://your-app.vercel.app`
- **Save this URL**

---

## ✅ Final Configuration & Testing

### 1️⃣ Update Google OAuth Settings

**Step 1:** Go to [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to **"APIs & Services"** → **"Credentials"**
- Click on your OAuth 2.0 Client ID

**Step 2:** Update Authorized Origins
- Add: `https://chat-user-service.onrender.com` (your actual User Service URL)

**Step 3:** Update Redirect URIs
- Add: `https://chat-user-service.onrender.com/api/v1/auth/google/callback`

**Step 4:** Save changes

---

### 2️⃣ Update User Service Environment

**Step 1:** Go to Render Dashboard
- Click on **"chat-user-service"**
- Go to **"Environment"** tab

**Step 2:** Update `CLIENT_URL`
- Find `CLIENT_URL` variable
- Change from `https://localhost:3000` to your Vercel URL
- Example: `https://your-app.vercel.app`
- Click **"Save Changes"**

**Step 3:** Service will auto-redeploy (wait 2-3 minutes)

---

### 3️⃣ Enable CORS (if needed)

Check your backend services have CORS configured to allow requests from your Vercel domain. This should already be set via `CLIENT_URL`.

---

### 4️⃣ Test Your Application

**Step 1:** Open your Vercel URL
- Visit: `https://your-app.vercel.app`

**Step 2:** Test Registration/Login
- Try creating an account
- Check if verification email arrives (check spam folder)
- Try Google OAuth login

**Step 3:** Test Chat Features
- Send a message to yourself or another user
- Check real-time updates
- Upload an image (tests Cloudinary)
- Create a group chat

**Step 4:** Monitor Logs
- **Render**: Check each service's logs for errors
- **Vercel**: Check function logs in Vercel dashboard
- **MongoDB Atlas**: Check database activity

---

## 🔧 Troubleshooting

### ❌ Service Won't Start

**Issue:** Render service fails to build or start

**Solutions:**
1. Check build logs for missing dependencies
2. Verify `package.json` has correct scripts:
   - `"build": "tsc"`
   - `"start": "node dist/index.js"`
3. Ensure `tsconfig.json` exists in service directory
4. Check Node version compatibility

---

### ❌ Database Connection Failed

**Issue:** `MongoServerError: Authentication failed`

**Solutions:**
1. Verify `MONGO_URI` has correct username and password
2. Ensure password doesn't have special characters (or URL-encode them)
3. Check MongoDB Atlas Network Access allows `0.0.0.0/0`
4. Verify database user has read/write permissions

---

### ❌ Redis Connection Issues

**Issue:** Cannot connect to Upstash Redis

**Solutions:**
1. Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are correct
2. Check if using REST API version (not TCP)
3. Ensure `@upstash/redis` package is installed
4. Test connection from Upstash dashboard

---

### ❌ RabbitMQ Connection Failed

**Issue:** Cannot connect to CloudAMQP

**Solutions:**
1. Verify `RABBITMQ_URL` is complete (starts with `amqps://`)
2. Check CloudAMQP instance status (should be running)
3. Free tier has connection limits - check if exceeded
4. Verify URL includes correct vhost path

---

### ❌ OAuth Redirect Error

**Issue:** `redirect_uri_mismatch` error

**Solutions:**
1. Verify Google Cloud Console has exact callback URL:
   - `https://chat-user-service.onrender.com/api/v1/auth/google/callback`
2. No trailing slashes
3. HTTPS required (HTTP only for localhost)
4. Wait a few minutes after updating (Google propagation delay)

---

### ❌ CORS Errors

**Issue:** Frontend can't connect to backend

**Solutions:**
1. Verify `CLIENT_URL` in User Service matches Vercel URL exactly
2. No trailing slashes in URLs
3. Check CORS configuration in backend code
4. Ensure frontend uses correct API URLs (from env variables)

---

### ❌ Images Won't Upload

**Issue:** Cloudinary upload fails

**Solutions:**
1. Verify all three Cloudinary credentials are correct
2. Check Cloudinary dashboard for usage limits (free tier)
3. Ensure `multer` and `cloudinary` packages are installed
4. Check file size limits

---

### ❌ Free Tier Cold Starts

**Issue:** First request takes 50+ seconds

**Solutions:**
1. This is normal for Render free tier (spins down after inactivity)
2. Consider upgrading to paid tier for production
3. Use Render's "keep alive" services (external pings)
4. Warn users about initial load time

---

### ⚡ Performance Tips

1. **Keep services in same region** - Reduces latency
2. **Use MongoDB indexes** - Faster queries
3. **Enable Redis caching** - Reduce database hits
4. **Optimize images** - Use Cloudinary transformations
5. **Monitor logs** - Catch issues early

---

## 📊 Service URLs Summary

Once deployed, you'll have these URLs:

```
User Service:    https://chat-user-service.onrender.com
Chat Service:    https://chat-message-service.onrender.com
Mail Service:    https://chat-mail-service.onrender.com
Frontend:        https://your-app.vercel.app
```

---

## 🎉 Deployment Complete!

Your microservice chat application is now:
- ✅ Hosted on Render (backend) and Vercel (frontend)
- ✅ Using MongoDB Atlas for data persistence
- ✅ Using Upstash Redis for caching and sessions
- ✅ Using CloudAMQP for async messaging
- ✅ Using Cloudinary for file storage
- ✅ Fully configured with OAuth and email notifications

**Next Steps:**
- Add custom domain (optional)
- Set up monitoring and alerts
- Configure backup strategies
- Implement CI/CD pipelines
- Scale services as needed

---

**Need Help?** Check service logs and refer to troubleshooting section above!
