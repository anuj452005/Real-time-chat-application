# Environment Variables Reference Guide

Complete list of all environment variables needed for deployment.

---

## 🔐 USER SERVICE Environment Variables

Copy these to Render → User Service → Environment:

```env
# Server Configuration
NODE_ENV=production
PORT=10000

# Database
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/chatdb?retryWrites=true&w=majority

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token-here

# Message Queue
RABBITMQ_URL=amqps://username:password@host.cloudamqp.com/vhost

# Authentication
JWT_SECRET=your-32-character-or-longer-random-secret
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-secret

# CORS
CLIENT_URL=https://your-app.vercel.app
```

**Total: 9 variables**

---

## 💬 CHAT SERVICE Environment Variables

Copy these to Render → Chat Service → Environment:

```env
# Server Configuration
NODE_ENV=production
PORT=10000

# Database
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/chatdb?retryWrites=true&w=majority

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=dxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-cloudinary-secret

# Service Communication
USER_SERVICE_URL=https://chat-user-service.onrender.com
```

**Total: 7 variables**

---

## 📧 MAIL SERVICE Environment Variables

Copy these to Render → Mail Service → Environment:

```env
# Server Configuration
NODE_ENV=production
PORT=10000

# Message Queue
RABBITMQ_URL=amqps://username:password@host.cloudamqp.com/vhost

# Email Configuration
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your-16-char-gmail-app-password
```

**Total: 5 variables**

---

## 🌐 FRONTEND (Vercel) Environment Variables

Copy these to Vercel → Project → Settings → Environment Variables:

```env
# Backend API Endpoints
NEXT_PUBLIC_USER_SERVICE_URL=https://chat-user-service.onrender.com/api/v1
NEXT_PUBLIC_CHAT_SERVICE_URL=https://chat-message-service.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://chat-message-service.onrender.com
```

**Total: 3 variables**

---

## 📝 How to Get Each Variable

### MONGO_URI
1. Go to MongoDB Atlas
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Add database name after `/` (e.g., `/chatdb`)

**Format:**
```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/chatdb?retryWrites=true&w=majority
```

---

### UPSTASH_REDIS_REST_URL & TOKEN
1. Go to Upstash dashboard
2. Click on your Redis database
3. Scroll to "REST API" section
4. Copy both URL and TOKEN

**Format:**
```
URL:   https://xxxxx.upstash.io
TOKEN: very-long-token-string-here
```

---

### RABBITMQ_URL
1. Go to CloudAMQP dashboard
2. Click on your instance
3. Copy the "AMQP URL"

**Format:**
```
amqps://username:password@host.cloudamqp.com/vhost
```

---

### JWT_SECRET
Generate a secure random string (32+ characters):

**On Windows (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**On Linux/Mac:**
```bash
openssl rand -base64 32
```

**Or use an online generator like:** https://randomkeygen.com/

---

### GOOGLE_CLIENT_ID & CLIENT_SECRET
1. Go to Google Cloud Console
2. Navigate to "APIs & Services" → "Credentials"
3. Click on your OAuth 2.0 Client ID
4. Copy both Client ID and Client Secret

**Format:**
```
CLIENT_ID:     xxxxx.apps.googleusercontent.com
CLIENT_SECRET: GOCSPX-xxxxx
```

---

### CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET
1. Go to Cloudinary dashboard
2. All three values are shown on the main dashboard

**Format:**
```
CLOUD_NAME: dxxxxxxx
API_KEY:    123456789012345
API_SECRET: secret-key-here
```

---

### EMAIL_USER & EMAIL_PASS
1. **EMAIL_USER**: Your Gmail address
2. **EMAIL_PASS**: Generate from Google Account Settings
   - Go to myaccount.google.com/security
   - Search "App Passwords"
   - Create new app password (16 characters)

**Format:**
```
EMAIL_USER: youremail@gmail.com
EMAIL_PASS: abcd efgh ijkl mnop (16 characters, no spaces when entering)
```

---

### CLIENT_URL
This is your **Vercel frontend URL** after deployment.

**Initial placeholder:**
```
CLIENT_URL=https://localhost:3000
```

**After Vercel deployment, update to:**
```
CLIENT_URL=https://your-app.vercel.app
```

---

### USER_SERVICE_URL
This is your **Render User Service URL** after deployment.

**Format:**
```
USER_SERVICE_URL=https://chat-user-service.onrender.com
```

---

### Frontend Environment Variables
These use your deployed Render service URLs.

**Note:** `NEXT_PUBLIC_` prefix makes them accessible in browser.

**Format:**
```
NEXT_PUBLIC_USER_SERVICE_URL=https://chat-user-service.onrender.com/api/v1
NEXT_PUBLIC_CHAT_SERVICE_URL=https://chat-message-service.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://chat-message-service.onrender.com
```

---

## ⚠️ Important Notes

### Security
- **NEVER commit `.env` files to GitHub**
- **Use strong passwords** for database users
- **Keep secrets confidential** - don't share in public repos
- **Rotate secrets regularly** in production

### URL Formatting
- **No trailing slashes** in URLs
- **Use HTTPS** for production (Render provides this)
- **Match URLs exactly** - case-sensitive

### Special Characters in Passwords
If your MongoDB password has special characters, **URL-encode them**:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`

**Example:**
```
Password: P@ssw0rd!
Encoded:  P%40ssw0rd!
```

---

## 🔄 Update Order

When updating environment variables:

1. **First:** Update infrastructure services (MongoDB, Redis, etc.)
2. **Second:** Deploy backend services to Render
3. **Third:** Deploy frontend to Vercel
4. **Fourth:** Update `CLIENT_URL` in User Service
5. **Fifth:** Update Google OAuth redirect URIs

---

## ✅ Validation Checklist

Before deploying, verify:

- [ ] All MongoDB connection strings use correct password
- [ ] Redis URL and TOKEN both copied
- [ ] RabbitMQ URL starts with `amqps://`
- [ ] JWT_SECRET is at least 32 characters
- [ ] Google OAuth credentials match project
- [ ] Cloudinary credentials match dashboard
- [ ] Gmail app password is 16 characters
- [ ] All URLs use HTTPS (except localhost)
- [ ] No trailing slashes in URLs
- [ ] Frontend env vars have `NEXT_PUBLIC_` prefix

---

## 📊 Environment Variables Summary

| Service | Total Variables | Critical Secrets |
|---------|----------------|------------------|
| User Service | 9 | `JWT_SECRET`, `GOOGLE_CLIENT_SECRET`, Redis Token |
| Chat Service | 7 | `CLOUDINARY_API_SECRET`, MongoDB URI |
| Mail Service | 5 | `EMAIL_PASS`, RabbitMQ URL |
| Frontend | 3 | None (all public) |
| **TOTAL** | **24** | **7 critical secrets** |

---

**💡 Tip:** Keep all your credentials in a password manager (1Password, LastPass, Bitwarden) for easy access and security.
