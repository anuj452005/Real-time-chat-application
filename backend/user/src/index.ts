import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { Redis } from "@upstash/redis";
import userRoutes from "./routes/user.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import cors from "cors";
import passport from "passport";
import { configureGoogleAuth } from "./config/googleAuth.js";
import session from "express-session";

dotenv.config();

connectDb();

connectRabbitMQ();

export const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

console.log("✅ Redis client initialized (Upstash REST API)");

// Configure Google OAuth
configureGoogleAuth();

const app = express();

app.use(express.json());

app.use(cors());

// Session middleware is required for Google OAuth state verification
app.use(
  session({
    secret: process.env.JWT_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Secure in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());

app.use("/api/v1", userRoutes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
