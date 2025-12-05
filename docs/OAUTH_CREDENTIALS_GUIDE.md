# Quick Setup: Where to Paste Google OAuth Credentials

## Step 1: Get Your Google OAuth Credentials

Follow the guide in `docs/GOOGLE_OAUTH_SETUP.md` to get your:
- **Client ID** (looks like: `123456789-abc123def456.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abc123def456xyz`)

## Step 2: Add to Backend Environment File

Open file: `backend/user/.env`

Add these lines (replace with your actual values):

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456xyz
GOOGLE_CALLBACK_URL=http://localhost:5001/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

## Example `.env` File

Your complete `.env` file should look something like this:

```env
# Existing variables (keep these as they are)
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-existing-secret
PORT=5001
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
RABBITMQ_URL=amqp://...

# NEW: Google OAuth Configuration (add these)
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456xyz
GOOGLE_CALLBACK_URL=http://localhost:5001/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

## Step 3: Restart Your Backend Service

After adding the variables, restart the user service:

1. Stop the current backend user service (press Ctrl+C in the terminal where it's running)
2. Start it again:
   ```bash
   cd backend/user
   npm run dev
   ```

## You're Done! 🎉

Now you can:
1. Go to `http://localhost:3000/login`
2. Click the "Continue with Google" button
3. Sign in with your Google account
4. You'll be redirected back to your app and logged in!

---

## Troubleshooting

### "Invalid Client" Error
- Double-check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Make sure there are no extra spaces or quotes in the `.env` file

### "Redirect URI Mismatch" Error
- In Google Cloud Console, make sure the redirect URI is exactly:
  `http://localhost:5001/api/v1/auth/google/callback`
- Check that PORT in `.env` matches (default is 5001)

### Backend Won't Start
- Make sure all environment variables are set
- Check the terminal for specific error messages
