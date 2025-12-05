# Google OAuth Setup Guide

This guide will help you set up Google OAuth 2.0 authentication for your chat application.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter a project name (e.g., "Chat App")
5. Click **"Create"**

## Step 2: Enable Google+ API

1. In your project, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google+ API"** (or "People API")
3. Click on it and press **"Enable"**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen:
   - Choose **"External"** user type
   - Fill in the app name: `Chat Application`
   - Add your email as support email
   - Add your email in developer contact
   - Click **"Save and Continue"**
   - Skip adding scopes (click "Save and Continue")
   - Add test users if needed
   - Click **"Save and Continue"**

4. Back in Create OAuth client ID:
   - Application type: **"Web application"**
   - Name: `Chat App Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:3000` (frontend)
     - `http://localhost:5001` (backend user service)
   - Authorized redirect URIs:
     - `http://localhost:5001/api/v1/auth/google/callback`
   - Click **"Create"**

## Step 4: Copy Your Credentials

After creation, you'll see a popup with:
- **Client ID**: Something like `123456789-abcdefgh.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-abc123def456`

**Copy both of these!**

## Step 5: Update Backend Environment Variables

Open `backend/user/.env` file and add:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

Replace:
- `your-client-id-here` with your actual Client ID
- `your-client-secret-here` with your actual Client Secret

## Step 6: Restart Your Backend Service

```bash
# Stop the current backend user service (Ctrl+C in its terminal)
# Then restart it:
cd backend/user
npm run dev
```

## Testing

1. Go to `http://localhost:3000/login`
2. Click **"Sign in with Google"**
3. You should be redirected to Google's login page
4. After signing in, you'll be redirected back to your app

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the redirect URI in Google Console exactly matches: `http://localhost:5001/api/v1/auth/google/callback`
- Make sure you're using the correct port (5001 for user service)

### "Access blocked: This app's request is invalid"
- Complete the OAuth consent screen configuration
- Add yourself as a test user in the OAuth consent screen settings

### Still getting errors?
- Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correctly set in `.env`
- Make sure there are no extra spaces or quotes in the `.env` file
- Restart the backend service after changing `.env` variables

## Production Setup

When deploying to production:

1. Update redirect URIs in Google Console to your production domain
2. Update `.env` variables:
   ```env
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/v1/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   ```
3. Publish your OAuth consent screen (move from "Testing" to "Production")
