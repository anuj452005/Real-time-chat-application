# Deploying Frontend to Render

This guide explains how to deploy your Next.js frontend to Render.

## Prerequisites

- You have pushed your latest code to GitHub (I just did this for you!).
- You have your Backend Service URLs ready (User Service and Chat Service).

## Step-by-Step Deployment

### 1. Create a New Web Service

1.  Log in to your [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository `microservice-chat-project`.

### 2. Configure the Service

Fill in the details as follows:

| Setting | Value |
| :--- | :--- |
| **Name** | `chat-frontend` (or any name you like) |
| **Region** | Select the same region as your backend services (e.g., Oregon, Frankfurt) |
| **Branch** | `new-feature` (or `main` if you merge later) |
| **Root Directory** | `frontend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 3. Configure Environment Variables

This is the **most important step**. You need to tell the frontend where to find your backend services.

Scroll down to the **Environment Variables** section and add the following:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_USER_SERVICE_URL` | `https://your-user-service.onrender.com` | The URL of your deployed User Service |
| `NEXT_PUBLIC_CHAT_SERVICE_URL` | `https://your-chat-service.onrender.com` | The URL of your deployed Chat Service |

> **Note:** Make sure there are no trailing slashes `/` at the end of the URLs.

### 4. Deploy

1.  Click **Create Web Service**.
2.  Render will start building your application. This might take a few minutes.
3.  Once finished, you will see a green **Live** badge.
4.  Click the URL provided by Render (e.g., `https://chat-frontend.onrender.com`) to visit your app.

## Troubleshooting

-   **Build Failed?** Check the logs. Ensure `npm install` ran successfully.
-   **App Crashes?** Check if the Start Command is correct (`npm start`).
-   **Cannot Connect to Backend?**
    -   Verify the environment variables are set correctly.
    -   Check the Network tab in your browser's developer tools (F12) to see if requests are going to the correct URL.
    -   Ensure your Backend Services are running and have CORS configured to allow your Frontend URL.

## Important: Update Backend CORS

After your frontend is deployed, you **MUST** update your Backend Services to allow requests from your new Frontend URL.

1.  Go to your **User Service** and **Chat Service** on Render.
2.  Update the `CLIENT_URL` (or `CORS_ORIGIN`) environment variable to your new Frontend URL (e.g., `https://chat-frontend.onrender.com`).
3.  Redeploy the backend services.
